# Security Architecture & Policies — OmniTest

## 1. Security Overview

Security is a foundational pillar of the OmniTest architecture. Because OmniTest executes arbitrary user-defined tests and handles sensitive application URLs, test credentials, and proprietary source artifacts, the platform is designed around the principles of **defense-in-depth, zero-trust worker isolation, and strict multi-tenant boundary enforcement**.

---

## 2. Authentication & Authorization

### 2.1 User Authentication
- **Session Model**: Secure, `HttpOnly`, `SameSite=Lax` cookie-based JWT or encrypted sessions for browser users.
- **OAuth Providers**: GitHub OAuth utilizing state verification and PKCE to prevent authorization code interception.
- **Password Security**: Strong hashing with Argon2id or bcrypt (cost factor >= 12).
- **MFA / 2FA**: TOTP-based multi-factor authentication supported at the user account level.

### 2.2 Machine & CLI Authentication (API Tokens)
- Automated systems (CLI, GitHub Actions, custom CI scripts) authenticate via scoped API Tokens:
  - Token Format: `omt_live_<random_32_characters>` (Live) or `omt_test_<random_32_characters>` (Test).
  - Storage: Plaintext tokens are **never** stored. Only the SHA-256 hash of the token is persisted in the database.
  - Scope: Tokens can be scoped to specific projects and restricted to either `read` (fetch results) or `write` (trigger runs).

### 2.3 Role-Based Access Control (RBAC)
Tenant permissions are enforced across three standard roles:

| Role | Organization Scope | Project Management | Run Tests | View Results | Billing & Plan | Secrets Management |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Owner** | Full Admin | Full Admin | ✅ Yes | ✅ Yes | ✅ Full Access | ✅ Read/Write |
| **Admin** | Member Admin | Full Admin | ✅ Yes | ✅ Yes | ❌ View Only | ✅ Read/Write |
| **Member** | None | Read-only | ✅ Yes | ✅ Yes | ❌ No Access | ❌ Write Only (Blind) |

---

## 3. Multi-Tenant Project Isolation

1. **Logical Isolation**:
   - Every database query for tenant resources (projects, suites, runs, artifacts) strictly enforces `organization_id` filter conditions verified against the authenticated user's active session.
   - Cross-tenant object access attempts (e.g. guessing UUIDs) are rejected with a standardized `404 Not Found` or `403 Forbidden` response to prevent ID enumeration.
2. **Data Partitioning**:
   - Heavy data tables (e.g. `test_results`, `artifacts`) index both `project_id` and `organization_id` to prevent accidental cross-tenant table scans.

---

## 4. Secret & Environment Variable Handling

Tests often require sensitive credentials (e.g., test user passwords, staging API keys). OmniTest enforces strict secret hygiene:

1. **Encryption at Rest**:
   - Project secrets and environment variables are encrypted using **AES-256-GCM** with unique initialization vectors (IVs) and authentication tags.
   - Master encryption keys (`ENCRYPTION_MASTER_KEY`) are managed via environment variables or cloud KMS (AWS KMS / GCP Cloud KMS) and rotated periodically.
2. **Ephemeral Decryption**:
   - Secrets are decrypted only in-memory inside the ephemeral worker container immediately before test suite execution begins.
3. **Log & Trace Masking**:
   - Test worker stdout/stderr streams and Playwright network HAR captures automatically scrub known secret values, replacing them with `[REDACTED_SECRET]`.

---

## 5. Test Worker Sandboxing & Isolation

Because browser tests interact with external URLs and run code, test worker execution is strictly sandboxed:

```
┌────────────────────────────────────────────────────────┐
│ Host Node (Linux VM / Worker Grid)                     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Unprivileged Ephemeral Container (Docker / Pod)  │  │
│  │                                                  │  │
│  │  • Non-root user (uid: 1001, gid: 1001)          │  │
│  │  • Read-only root filesystem (tmpfs for /tmp)    │  │
│  │  • CPU Quota: Max 2.0 cores                      │  │
│  │  • Memory Quota: Max 4096 MB (OOM killer on)     │  │
│  │  • Hard Execution Timeout: 600s (SIGKILL)        │  │
│  │  • Blocked: 169.254.169.254 (Cloud Metadata)     │  │
│  │  • Blocked: Local host networking                │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Non-Root Execution**: Workers execute as unprivileged user `omniworker` (`uid: 1001`).
2. **Resource Constraints**:
   - Docker container limits: `cpus: 2.0`, `memory: 4g`, `pids-limit: 512`.
   - Out-of-memory or runaway fork bombs are trapped and terminated immediately.
3. **Network Perimeter Defense**:
   - Worker containers cannot reach cloud metadata services (e.g., `http://169.254.169.254/latest/meta-data/` on AWS/GCP).
   - Local loopback access to other host containers is severed via isolated Docker bridge networks.
4. **Ephemeral Destruction**:
   - Following test execution (pass, fail, or timeout), the worker container is torn down and destroyed. No filesystem state or cookie storage survives between runs.

---

## 6. Rate Limiting & Abuse Prevention

The public REST API and ingestion endpoints are protected against brute-force attacks and denial-of-service (DoS) via Redis-backed token bucket rate limiters:

| Endpoint Route | Limit | Window | Action on Breach |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | 5 requests | 60 seconds | 429 Too Many Requests + IP backoff |
| `POST /api/v1/auth/register` | 3 requests | 300 seconds | 429 Too Many Requests |
| `POST /api/v1/runs` (User Trigger) | 60 requests | 60 seconds | 429 (Returns queue saturation error) |
| `GET /api/v1/*` (Read Queries) | 1,000 requests | 60 seconds | 429 Standard Rate Limit |
| SSE Stream Subscriptions | 20 active streams | Per Account | Connection refused |

---

## 7. Webhook Signature Validation

Inbound webhooks from third-party services are cryptographically validated before any processing occurs:

1. **GitHub Webhooks**:
   - Validated against the configured `GITHUB_WEBHOOK_SECRET` using `HMAC-SHA256` matching header `X-Hub-Signature-256`.
   - Requests with missing or non-matching signatures are rejected with `401 Unauthorized`.
2. **Stripe Webhooks**:
   - Validated against `STRIPE_WEBHOOK_SECRET` using Stripe's official SDK signature timestamp verifier to guard against replay attacks.

---

## 8. Artifact Security & Presigned URLs

1. **Private Buckets**:
   - S3/Cloudflare R2 buckets storing execution traces, videos, and screenshots are private by default with all public read access blocked.
2. **Presigned Upload URLs**:
   - Workers request single-use presigned S3 `PUT` URLs valid for 10 minutes with strict `Content-Length` and `Content-Type` constraints.
3. **Presigned Download URLs**:
   - Authenticated dashboard users view videos or traces via temporary signed `GET` URLs expiring after 15 minutes.
   - URLs cannot be shared publicly across unauthorized users unless explicitly generated as a public shareable report.

---

## 9. Environment Variables & Secret Hygiene

- Application secrets must be configured via environment variables and never checked into source control.
- `.env` files are added to `.gitignore`.
- A comprehensive `.env.example` file is maintained with non-sensitive placeholder values documenting every required variable.
- Any pull request or commit containing apparent private keys or tokens is blocked via pre-commit hooks and CI secret scanners (e.g. `gitleaks`).

---

## 10. Data Retention & Erasure Policies

1. **Retention Windows**:
   - **Free Tier**: Test execution logs and video/trace artifacts are automatically deleted after 7 days.
   - **Pro Tier**: Retained for 30 days.
   - **Enterprise Tier**: Retained for 90 to 365 days (custom SLA).
2. **Automated Purge Jobs**:
   - A daily cron job deletes expired artifacts from S3 and marks database rows as archived/purged.
3. **GDPR / Right-to-be-Forgotten**:
   - Account deletion triggers a cascading purge of user credentials, organization associations, project configurations, and physical S3 artifacts within 48 hours.

---

## 11. Performance Testing Security & Measurement Hygiene

Automated web performance audits involve requesting user-supplied URLs and capturing network telemetry:

1. **SSRF Protections**:
   - Every performance test URL is validated against internal and private IP spaces (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`) before dispatch to prevent cloud metadata or intranet extraction.
2. **Credential & Cookie Redaction**:
   - Network telemetry does **not** persist or log HTTP cookies, `Authorization` headers, session identifiers, or request payloads. Only resource sizes and response status codes are stored.
3. **Process Resource Caps**:
   - Performance browser contexts are bound by strict navigation timeouts (default 30 seconds, maximum 120 seconds).
   - Browser processes and contexts are explicitly destroyed in `finally` blocks to guarantee zero process leakage.
4. **Synthetic Audit Limitation**:
   - Performance test results represent synthetic, automated Chromium measurements under controlled runner conditions. They must not be conflated with Real User Monitoring (RUM) field data. INP is explicitly reported as unavailable during non-interactive automated audits to avoid deceptive reporting.

---

## 12. Technical SEO Testing Security & Resource Controls

Automated technical SEO auditing involves analyzing arbitrary user-configured websites, metadata, and linked resources:

1. **SSRF Protections on Primary & Subresource Requests**:
   - Every target URL, redirect destination, discovered `/robots.txt`, XML sitemap, and sampled direct hyperlink is pre-screened through `checkUrlSecurity`.
   - Direct requests to link-local addresses, internal networks, or cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`) are strictly rejected.
2. **Resource Size Caps & Anti-DDoS Limits**:
   - `/robots.txt` retrieval enforces a 256KB download truncation limit and a 4-second timeout.
   - Discovered sitemaps enforce a 512KB download truncation limit and a 4-second timeout.
   - Sitemaps are parsed safely using regex without DOMParser/libxml XXE (XML External Entity) or billion laughs entity expansion vulnerabilities.
3. **Strict Non-Crawling Scope**:
   - Phase 5D implements a single-page technical audit. It does **not** perform recursive web crawling.
   - Directly referenced hyperlinks are sampled up to a hard cap of 10 links with individual 3-second timeouts to prevent resource exhaustion or outbound spamming.
4. **HTML Evidence Sanitization**:
   - Extracted DOM elements, heading text, meta attributes, and JSON-LD snippets are rendered strictly as escaped plain text inside UI code blocks.
   - Under no circumstances is captured remote HTML rendered via `dangerouslySetInnerHTML` or executed in client browser sessions.
5. **Technical Audit Disclosure**:
   - OmniTest SEO Testing evaluates technical crawlability signals and web standards. It does not measure search-engine rankings, organic traffic, indexation guarantees, or rich-snippet eligibility.

---

## 13. Unified Reporting & Export Security

Test run reports aggregate telemetry across all testing engines (UI, API, Accessibility, Performance, and SEO). To protect tenant confidentiality and data privacy:

1. **Deterministic Redaction & Sensitive Header Masking**:
   - The report compilation engine (`report-generator.ts`) automatically executes `maskSensitiveHeaders` across stored request and response metrics.
   - Headers containing `authorization`, `proxy-authorization`, `cookie`, `set-cookie`, `x-api-key`, `*token*`, or `*secret*` are scrubbed and replaced with safe masked previews (e.g. `Bearer abc...xyz` or `************`) before report serialization or export.
2. **Multi-Tenant Report Access Control**:
   - `/api/projects/[projectId]/runs/[runId]/report` strictly authenticates user session identity and verifies that the user is an active member of the project's organization.
   - Attempts to access reports for runs belonging to another organization return `404 Not Found` to prevent project or run enumeration.
3. **Safe Export Handling**:
   - JSON report exports set `Content-Type: application/json; charset=utf-8` and explicit `Content-Disposition: attachment; filename="omnitest-report-[id].json"`.
   - All exported payloads are verified to ensure no plaintext passwords, session tokens, or unmasked bearer credentials leak into downloaded files.
4. **Rendering & XSS Prevention**:
   - In the report UI (`ReportResultsTable`, `ReportFailuresSection`), all failure reasons, stack traces, and captured snippets are rendered strictly as escaped text nodes within React JSX.
   - No report elements utilize `dangerouslySetInnerHTML`.

---

## 14. Artifact Storage & Viewer Security

OmniTest captures, stores, and presents a variety of test artifacts (screenshots, traces, video recordings, console logs, network dumps, and diagnostic JSON evidence). To ensure strict multi-tenant protection and prevent cross-site scripting:

1. **Sandboxed HTML & SVG Isolation**:
   - Remote HTML documents and SVG assets captured from target applications are **never** injected directly into the OmniTest application DOM.
   - HTML artifacts are rendered inside an isolated `<iframe>` with strict `sandbox=""` attributes, blocking scripts, top-level navigation, forms, popups, and parent DOM access.
   - Artifact content has zero access to OmniTest cookies, local storage, session state, or API authorization tokens.
2. **Credential Redaction in Diagnostic Evidence**:
   - All network and API evidence artifacts (HTTP requests, responses, headers) pass through `maskSensitiveHeaders` before being served to client viewers or downloaded.
   - Sensitive headers (`Authorization`, `Cookie`, `Set-Cookie`, `X-API-Key`, `Proxy-Authorization`) and fields matching `*secret*`, `*token*`, or `*password*` are replaced with masked previews.
3. **Multi-Tenant Authorization on Artifact Routes**:
   - All artifact endpoints (`/api/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts...`) require an authenticated user session and verify active membership in the project's organization.
   - Unauthenticated requests receive `401 Unauthorized`. Cross-tenant resource requests receive `404 Not Found` to prevent resource discovery.
4. **Physical File Containment & Path Traversal Prevention**:
   - File downloads and streams are strictly bound to validated run artifact directories. Path traversal sequences (`../`, null bytes) in artifact filenames are disallowed.
   - Binary artifacts are served with explicit MIME types and safe attachment headers when downloaded (`Content-Disposition: attachment`).

---

## 15. Visual Regression Testing Security & Integrity

Visual regression testing compares pixel data from automated browser screenshots against approved reference baselines:

1. **Explicit Baseline Approval & Mutability Protection**:
   - Baselines are immutable during test execution. A test failure NEVER automatically overwrites or alters an existing baseline image.
   - Baselines can only be created or replaced through explicit authenticated user action with confirmation modals.
   - All baseline updates record the author email, timestamp, and source artifact ID in the audit trail.
2. **Multi-Tenant Baseline Access Control**:
   - Baseline management endpoints (`/api/projects/[projectId]/tests/[testId]/visual-regression/baseline`) strictly verify organization membership.
   - Unauthorized attempts to read, create, update, or delete baselines across tenant boundaries are rejected with `404 Not Found`.
3. **Decompression Bomb & Buffer Bounds Protection**:
   - Image buffers processed by `pngjs` and `pixelmatch` are bounded by strict viewport limits and memory allocations.
   - Excessive resolutions or non-PNG file formats are rejected before parsing, preventing decompression memory exhaustion attacks.
4. **Dimension Mismatch Guard**:
   - If an attacker or corrupted test attempts to compare mismatched image resolutions, the comparison engine immediately aborts with `DIMENSION_MISMATCH` rather than performing unconstrained memory strides or distorted pixel diffing.



