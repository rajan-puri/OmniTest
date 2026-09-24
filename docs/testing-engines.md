# Testing Capabilities & Engine Architecture — OmniTest

OmniTest is architected as an **orchestration and developer-experience platform**. Rather than writing proprietary, brittle browser drivers or recreating standard testing algorithms, OmniTest integrates industry-standard, battle-tested open-source engines via modular TypeScript adapters.

---

## 1. Engine Architecture & Adapter Model

Every testing engine implements the standardized `TestEngineAdapter` contract defined in `packages/runner-core`:

```typescript
export interface ExecutionContext {
  readonly runId: string;
  readonly testId: string;
  readonly targetUrl: string;
  readonly config: Record<string, unknown>;
  readonly envVars: Record<string, string>;
  readonly artifactUploadUrlGetter: (fileName: string, contentType: string) => Promise<string>;
  readonly logEmitter: (event: StepEvent) => void;
}

export interface ExecutionResult {
  readonly status: 'PASSED' | 'FAILED' | 'TIMED_OUT';
  readonly durationMs: number;
  readonly errorMessage?: string;
  readonly stackTrace?: string;
  readonly stepResults: StepResult[];
  readonly metrics: Record<string, unknown>;
  readonly artifacts: GeneratedArtifact[];
}

export interface TestEngineAdapter {
  readonly engineType: string;
  validateConfig(config: unknown): Promise<boolean>;
  execute(ctx: ExecutionContext): Promise<ExecutionResult>;
  cleanup(): Promise<void>;
}
```

---

## 2. Planned Testing Capabilities

Below is the exhaustive architectural specification for all 10 testing dimensions, cleanly partitioned by **MVP Scope** vs. **Future Enhancements**.

### 2.1 UI Testing
- **Status**: **MVP (Phase 3)**
- **Underlying Engine**: Playwright (`@playwright/test` / `playwright-core`).
- **Architecture**:
  - Headless browser contexts launched in ephemeral Docker workers.
  - Multi-browser support: Chromium, Firefox, WebKit.
  - Dynamic viewport emulation (Desktop 1920x1080, Laptop 1366x768, Mobile Viewports like iPhone 14 / Pixel 7).
  - Resilient locator strategy prioritizing semantic role locators (`getByRole`, `getByLabel`, `getByTestId`).
- **Artifacts Captured**:
  - Full-motion video of test execution (`.webm`).
  - Interactive Playwright trace containing DOM snapshots before/after each action (`trace.zip`).
  - High-resolution screenshot on failure (`.png`).
  - Browser console logs and network HAR capture.

### 2.2 Functional & Workflow Testing
- **Status**: **MVP (Phase 3 & 4)**
- **Underlying Engine**: Playwright + State Fixture Manager.
- **Architecture**:
  - Multi-step, state-dependent user journeys (e.g. User Signup → Email Verification Code → Dashboard Onboarding → Stripe Checkout).
  - Storage state persistence: Capability to reuse authenticated cookies / session tokens across tests in a suite to eliminate redundant login steps.
  - Parameterized test execution: Running workflows against tabular test data fixtures (e.g. valid card, expired card, declined card).

### 2.3 API Testing
- **Status**: **MVP (Phase 5)**
- **Underlying Engine**: Native Node.js `fetch` / Playwright APIRequestContext.
- **Architecture**:
  - Chained HTTP requests: Extract dynamic variables from Response A (e.g. `jwt_token`, `order_id`) and inject them into Request B headers/body.
  - Response assertions:
    - HTTP Status code (`toBe(200)`).
    - Response timing SLA (`responseTime < 500ms`).
    - JSON Schema validation via Zod / JSON Schema.
    - Header assertions (`content-type`, `cache-control`).
  - SSL/TLS certificate validity verification.
- **Artifacts Captured**:
  - Request/Response payload transcript (with encrypted secret masking).
  - Network timing breakdown (DNS lookup, TCP handshake, TLS negotiation, TTFB, download).

### 2.4 Accessibility (a11y) Testing
- **Status**: **MVP (Phase 5)**
- **Underlying Engine**: `axe-core` injected into Playwright page sessions.
- **Architecture**:
  - Automated scanning against **WCAG 2.1 Level A & AA** standards.
  - Evaluates rules: color contrast, image alt texts, aria roles, duplicate IDs, form labels, landmarks.
  - Impact severity ranking: `critical`, `serious`, `moderate`, `minor`.
  - DOM path mapping: Identifies the exact CSS selector and HTML snippet of violating elements with remediation guidance links.
- **Artifacts Captured**:
  - Structured axe violation report (`axe-report.json`).
  - Highlighted DOM overlay screenshots pinpointing non-compliant elements.

### 2.5 Visual Regression Testing
- **Status**: **Future (Phase 6)**
- **Underlying Engine**: `pixelmatch` + Playwright high-DPI screenshots.
- **Architecture**:
  - Captures baseline screenshots on the designated `main` branch.
  - PR runs capture matching screenshots and generate pixel diff masks.
  - Anti-aliasing detection and configurable perceptual color difference threshold (YIQ delta).
  - Dynamic element masking (ignoring timestamps, avatars, random ads).
  - Two-way baseline approval workflow inside the web dashboard.
- **Artifacts Captured**:
  - Baseline image, candidate image, and red-highlighted diff image.

### 2.6 Performance Auditing & Core Web Vitals
- **Status**: **MVP (Phase 5)**
- **Underlying Engine**: Google Lighthouse (headless CLI) + Chrome DevTools Protocol (CDP).
- **Architecture**:
  - Emulates standard desktop and mobile network throttling (Simulated 4G, Fast 3G).
  - Metrics collected:
    - **LCP** (Largest Contentful Paint)
    - **CLS** (Cumulative Layout Shift)
    - **INP / FID** (Interaction to Next Paint / First Input Delay)
    - **TTFB** (Time to First Byte)
    - Total bundle weight and unminified JavaScript warnings.
  - Performance scoring (0 to 100) with budget regression assertions (e.g. fail if LCP > 2.5s).
- **Artifacts Captured**:
  - Full Lighthouse HTML report and raw JSON metrics.

### 2.7 SEO & Meta Auditing
- **Status**: **Future (Phase 5)**
- **Underlying Engine**: Cheerio DOM Analyzer + Lighthouse SEO Module.
- **Architecture**:
  - Static HTML verification: `title`, `meta[description]`, `canonical` link, `robots.txt`, OpenGraph tags (`og:title`, `og:image`), Twitter cards.
  - Heading hierarchy verification (`h1` presence and single count).
  - Broken link crawling (identifying 404 links within the crawled page).

### 2.8 Security Checks (DAST & Hygiene)
- **Status**: **Future (Phase 10)**
- **Underlying Engine**: OWASP ZAP (Zed Attack Proxy) baseline scanner + HTTP Header Linter.
- **Architecture**:
  - Passive security inspection:
    - Content Security Policy (CSP) presence and strength.
    - Security headers: `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options`.
    - Cookie security: Missing `Secure`, `HttpOnly`, or `SameSite` flags.
    - Public exposure of source maps or `.git` directories.
  - Active baseline scanner: Input fuzzing for reflected XSS and SQL injection vulnerability indicators on test endpoints.

### 2.9 CI/CD & GitHub Workflow Orchestration
- **Status**: **Future (Phase 7)**
- **Underlying Engine**: GitHub App + OmniTest CLI (`@omnitest/cli`).
- **Architecture**:
  - Native GitHub Check Runs API: Emits individual sub-checks per suite (e.g. `omnitest/ui`, `omnitest/a11y`, `omnitest/api`).
  - PR comments with rich Markdown summaries, test run duration deltas, and deep links to traces.
  - Merge-blocking quality gates based on organization-defined threshold rules.

### 2.10 AI-Assisted Test Diagnostics & Healing
- **Status**: **Future (Phase 8)**
- **Underlying Engine**: LLM Diagnostic Service (Claude 3.5 Sonnet / Gemini 1.5 Pro).
- **Architecture**:
  - **Automated Root-Cause Analysis**: On test failure, a prompt package containing the failed step, DOM diff snapshot, console errors, and network HAR is dispatched to the LLM. The system outputs a structured explanation:
    - *What broke*: (e.g. "Payment button selector `#submit-order` was changed to `#pay-now`").
    - *Confidence Score*: (e.g. 0.94).
    - *Recommended Code Fix*: (Ready-to-apply patch).
  - **Self-Healing Locators**: If a selector fails during runtime, the worker queries an in-memory heuristic engine to find an element with matching text, accessibility role, and parent hierarchy, executes the action to verify, and flags the test as "Healed (Needs Review)".

---

## 3. Capability Matrix: MVP vs. Future

| Testing Capability | Engine Adapter | MVP (Phase 1-6) | Future (Phase 7-11) | Primary Artifacts |
| :--- | :--- | :---: | :---: | :--- |
| **Browser UI Testing** | `engine-playwright` | ✅ Phase 3 | - | Video, Trace Zip, Screenshots |
| **Functional Workflows** | `engine-playwright` | ✅ Phase 3-4 | - | Video, Session State |
| **REST API Assertions** | `engine-api` | ✅ Phase 5 | - | Request/Response JSON, HAR |
| **Accessibility (a11y)** | `engine-a11y` (axe-core) | ✅ Phase 5 | - | Violation Nodes JSON, Overlays |
| **Performance (CWV)** | `engine-lighthouse` | ✅ Phase 5 | - | Lighthouse HTML & CWV JSON |
| **Visual Regression** | `engine-visual` (pixelmatch) | - | ✅ Phase 6 | Baseline, Diff Masks |
| **SEO & Meta Verification**| `engine-seo` | - | ✅ Phase 5 | SEO Audit JSON |
| **Security Hygiene / DAST**| `engine-security` (OWASP) | - | ✅ Phase 10 | Security Finding Alerts |
| **CLI & GitHub App** | `@omnitest/cli` | - | ✅ Phase 7 | Check Runs, PR Comments |
| **AI Root-Cause Diagnosis**| `engine-ai` (LLM) | - | ✅ Phase 8 | Structured Diagnostic Card |
