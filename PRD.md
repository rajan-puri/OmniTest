# Product Requirements Document (PRD) — OmniTest

## 1. Product Vision & Overview

### 1.1 Vision Statement
To establish the world's most cohesive, developer-loved automated testing platform—enabling engineering teams to execute, analyze, and monitor **every layer of web application quality** (UI, API, Accessibility, Performance, SEO, Security, and Visuals) through a single unified engine, CLI, and intuitive dashboard.

### 1.2 Tagline & Positioning
- **Tagline**: *One platform. Every test.*
- **Category**: Unified Quality Engineering & Test Orchestration SaaS.
- **Value Proposition**: Eliminate the tool sprawl, high licensing costs, and fractured reporting of maintaining 5–7 disparate testing SaaS vendors by providing an orchestrator powered by proven open-source engines with centralized analytics and AI-powered root cause diagnosis.

---

## 2. Problem Statement

Modern software engineering teams face severe fragmentation in quality assurance:

1. **Tool Sprawl & Fragmented Signals**:
   - UI tests live in Cypress Cloud or Playwright scripts.
   - API testing lives in Postman or Newman.
   - Accessibility audits live in manual axe devTools scans.
   - Performance monitoring relies on disparate PageSpeed or Calibre runs.
   - Visual regression is pushed to Percy or Chromatic.
   - There is no single place where an engineering manager or developer can look at a pull request and see: *“Is this deployable across all quality dimensions?”*
2. **High Infrastructure & Maintenance Burden**:
   - Teams spend weeks configuring ephemeral Docker containers, managing headless browser dependencies, handling flaky network bindings, and scaling Selenium/Playwright grids.
3. **Flakiness & Opaque Failures**:
   - When a test fails in CI, developers spend hours downloading raw log files, attempting to recreate the browser state locally, or guessing whether a failure was a true regression or network jitter.
4. **Disjointed Cost**:
   - Paying independent per-seat or per-test subscriptions across multiple SaaS vendors leads to bloated budgets and restricted adoption across dev teams.

---

## 3. Target Audience & Personas

### 3.1 Target Users
- **Primary**: Full-Stack Software Engineers, Frontend Developers, QA Automation Engineers.
- **Secondary**: Engineering Managers, DevOps / Platform Engineers, Technical Founders, Product Managers.

### 3.2 Primary Personas

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│  Persona 1: "Dev Dave"          │      │  Persona 2: "Lead Elena"        │      │  Persona 3: "QA Quinn"          │
│  Senior Full-Stack Engineer     │      │  VP / Director of Engineering   │      │  Lead Automation Engineer       │
├─────────────────────────────────┤      ├─────────────────────────────────┤      ├─────────────────────────────────┤
│ • Focus: Fast PR feedback       │      │ • Focus: Release reliability    │      │ • Focus: Test suite maintenance │
│ • Wants zero-config setup       │      │ • Wants consolidated SaaS spend │      │ • Wants rich debug artifacts    │
│ • Despises flaky UI tests       │      │ • Needs audit & team visibility │      │ • Manages cross-browser suites  │
│ • Works in GitHub & VS Code     │      │ • Tracks SLA & regression trends│      │ • Needs a11y & visual baseline  │
└─────────────────────────────────┘      └─────────────────────────────────┘      └─────────────────────────────────┘
```

#### Persona 1: "Dev Dave" — Senior Full-Stack Engineer
- **Goal**: Ship pull requests rapidly without breaking production.
- **Pain Point**: CI takes 25 minutes; when a test fails, he only gets an exit code `1` and a truncated terminal stack trace without visual proof.
- **Needs**: Fast execution, automatic retry of flaky network requests, rich video/trace artifacts linked directly in GitHub PR status checks, and reproducible local CLI execution.

#### Persona 2: "Lead Elena" — VP / Director of Engineering
- **Goal**: Maintain 99.9% uptime, zero compliance violations (a11y/WCAG), and lean software vendor spend.
- **Pain Point**: Spending $1,800/month across Cypress Cloud, Percy, and run-time APM without cross-dimensional visibility.
- **Needs**: Single bill, centralized organization management, RBAC, high-level quality trends, and compliance reporting.

#### Persona 3: "QA Quinn" — Lead Quality Automation Specialist
- **Goal**: Comprehensive test coverage across cross-browser environments, responsive viewports, and edge cases.
- **Pain Point**: Writing repetitive boilerplate glue code to bridge HTTP assertions with browser-driven tests.
- **Needs**: Visual regression threshold tuning, unified test builder/recorder, deterministic test data fixtures, and automated accessibility scanning.

---

## 4. Core Use Cases

1. **Pull Request Quality Gate (CI/CD)**:
   Every GitHub PR triggers an OmniTest run that validates UI workflows, API endpoints, WCAG accessibility violations, and Core Web Vitals in parallel, posting a unified status badge and summary comment.
2. **Debugging Regressions via Video & Trace Scrubbing**:
   Developers inspect an interactive Playwright trace with DOM snapshots, console logs, network requests, and synchronized video replay directly in the OmniTest web dashboard.
3. **Scheduled Synthetic Health & Performance Probes**:
   Cron-scheduled executions run every 15 minutes against production endpoints to monitor real browser rendering performance, SSL certificate validity, and critical business flows (e.g. checkout).
4. **Visual Baseline Diffing**:
   Detecting unintended pixel drift and CSS regressions across responsive breakpoints before releasing design system updates.
5. **Automated Accessibility (a11y) Compliance**:
   Ensuring continuous compliance with WCAG 2.1 AA standards by flagging color contrast, missing aria attributes, and keyboard navigability issues on every build.

---

## 5. Product Positioning & Competitive Matrix

### 5.1 Category Definition
**Unified Test Orchestration Platform**: A Developer-Experience (DX) first SaaS layer that abstracts containerized test runners, provides enterprise-grade orchestration, and consolidates reporting across multiple testing domains.

### 5.2 Competitive Matrix

| Feature / Dimension | OmniTest | Cypress Cloud | Playwright (Raw OSS) | BrowserStack / Sauce | Datadog Synthetic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All-in-One Quality** (UI + API + a11y + Perf + SEO) | ✅ **Yes (Unified)** | ❌ UI Only | ❌ Framework Only | ❌ Infrastructure Only | ⚠️ Monitoring Only |
| **Open Engine Under the Hood** | ✅ Playwright/axe | ❌ Proprietary Runner | ✅ Pure OSS | ⚠️ Custom Selenium Grid | ❌ Closed Agent |
| **Video, Traces & Artifacts** | ✅ Included | ✅ Paid Add-on | ⚠️ Local Files Only | ⚠️ Raw Videos | ⚠️ Truncated Snaps |
| **Zero Infrastructure Config** | ✅ Cloud Hosted Runners | ⚠️ User Hosts CI | ❌ User Hosts Everything | ✅ Cloud Grid | ✅ Cloud Managed |
| **CLI + Monorepo Ready** | ✅ Native | ⚠️ Complex in Monorepos | ✅ Manual Config | ❌ Heavyweight | ❌ No Dev CLI |
| **Consolidated Pricing** | ✅ Single SaaS Bill | ❌ Expensive per-test | ✅ Free (Self-host dev) | ❌ High concurrency fees | ❌ Expensive APM addon |

---

## 6. MVP Definition vs. Future Features

To uphold the fundamental engineering principle: **"Do NOT attempt to build the entire product at once. Development will happen in clearly defined phases,"** the feature roadmap is rigorously bifurcated.

### 6.1 In Scope for MVP (Phases 1 through 6)
- **Authentication & Multi-Tenancy**: Email/password, GitHub OAuth, organization creation, workspace switcher, and role-based permissions (Owner, Admin, Member).
- **Project Management**: Project creation, environment variable secrets manager, baseUrl settings.
- **Core Test Runner (Playwright & API)**:
  - Browser-driven UI tests (Chromium, Firefox, WebKit).
  - Native HTTP/REST API assertion runner.
- **Accessibility Engine**: Automated DOM scanning via `axe-core` reporting WCAG 2.1 A & AA violations.
- **Performance Probes**: Real browser Core Web Vitals (LCP, CLS, FCP, TTFB, DOM Content Loaded) in headless Chromium.
- **Technical SEO Audits**: Real browser document inspection (title, meta description, canonical, robots directives, heading hierarchy, images, links, JSON-LD structured data, robots.txt, sitemaps).
- **Execution & Queue Architecture**: Redis + BullMQ backed test job orchestrator dispatching containerized worker processes.
- **Artifact Pipeline**: Storage of full-motion video (`.webm`/`.mp4`), interactive Playwright traces (`.zip`), screenshots (`.png`), and step-level execution logs in S3-compatible storage.
- **Unified Web Dashboard**: Live run streaming, suite explorer, failure inspector, artifact player, and run timeline.
- **Developer CLI**: Basic `@omnitest/cli` for running tests locally or invoking cloud runs from existing CI scripts.
- **GitHub Integration**: GitHub App for commit status checks and PR summary comments.

### 6.2 Explicitly Deferred to Future Phases (Phases 7 through 11)
- **AI-Powered Diagnostics**: Automatic root-cause categorization, natural language test authoring, and suggested DOM locator fixes.
- **Advanced Visual Regression**: Pixel-by-pixel anti-aliased threshold diffing with automated baseline approvals.
- **Active DAST Security Scanning**: OWASP ZAP automated dependency vulnerability and header injection audits.
- **Bi-directional Test Recorder**: Chrome extension / desktop recorder capturing user clicks and generating typed Playwright code.
- **Self-Hosted Runner Agents**: Enterprise hybrid-cloud execution behind corporate firewalls.
- **Fine-Grained Usage Billing**: Metered concurrency minutes, Stripe checkout, automated credit caps, and tiered quotas.

---

## 7. Functional Requirements

### 7.1 Organization & User Management
- Users can authenticate via Email/Password (magic link or bcrypt) or GitHub OAuth.
- Users can belong to multiple Organizations; each organization has isolated Projects and billing.
- Roles supported: `Owner` (full billing and deletion rights), `Admin` (manage projects, members, integrations), `Member` (create tests, trigger runs, view results).

### 7.2 Projects & Environments
- Each Project represents a single application or repository.
- Support for target environments: `development`, `staging`, `production`, and custom ephemeral preview URLs (e.g. Vercel / Netlify branch previews).
- Project-level encrypted environment variables for credentials and test tokens.

### 7.3 Test Authoring & Suites
- Tests organized into hierarchical Test Suites.
- Support for declarative TypeScript/JSON test specs or standard Playwright test files.
- Capability to tag tests (e.g., `@smoke`, `@regression`, `@critical`, `@a11y`).

### 7.4 Execution & Orchestration
- Execution triggers:
  - Web UI manual trigger ("Run Now").
  - CLI command (`omnitest run --project=<id>`).
  - Webhook / CI trigger (`POST /api/v1/runs`).
  - Scheduled cron triggers.
- Run parameters: Environment, browser selection, concurrency limit, retry count (0 to 3).
- Real-time progress updates delivered via WebSocket / Server-Sent Events (SSE).

### 7.5 Results & Artifacts
- Statuses: `QUEUED`, `RUNNING`, `PASSED`, `FAILED`, `TIMED_OUT`, `CANCELLED`.
- Step-by-step timeline of actions: Click, Navigate, Assert, Fetch.
- Direct links to download and inspect traces, videos, and full console/network dumps.

### 7.6 Unified Reporting System
- Standardized `RunReport` synthesizing execution metrics across all five testing engines (`UI`, `API`, `ACCESSIBILITY`, `PERFORMANCE`, and `SEO`).
- Computes deterministic pass rates (`passed / (passed + failed + errors)`), duration, and total test counts.
- Dynamic Engine Breakdown cards functioning as interactive filters for developers.
- Failure & Error extraction tailored per engine (Playwright step errors, HTTP assertion diffs, axe-core WCAG violations, performance metric breaches, SEO requirement failures).
- Searchable and sortable test results table with status tabs and failure prioritization.
- Masked sensitive data (authorization headers, cookies, API tokens) before rendering or exporting.
- Dedicated report route (`/dashboard/projects/[projectId]/runs/[runId]/report`) and JSON export endpoint (`/api/projects/[projectId]/runs/[runId]/report?export=json`).

### 7.7 Artifact Viewer & Media Explorer
- Unified presentation layer for physical files (screenshots, videos, traces) and synthesized diagnostic evidence (console error logs, network failures, API request/response payloads, Web Vitals, A11y violations, SEO findings).
- Responsive two-column viewer with category filtering (`All`, `Images`, `Logs`, `JSON`, `Trace`, `Video`), search filter, and keyboard navigation.
- Specialized viewers: Screenshot zoom/pan/transparency, formatted JSON with search/copy, monospace logs with line numbers, HTML5 video player, and Playwright trace downloader.
- Security isolation: Strict sandboxed `<iframe>` (`sandbox=""`) for HTML artifacts; automatic secret redaction for API and network logs.
- Dedicated route: `/dashboard/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts`.

---

## 8. Non-Functional Requirements

- **Reliability & Determinism**: Test worker sandboxes must be completely stateless. No cache or browser state leakage between runs.
- **Execution Latency**: Queue pickup latency under 1.5 seconds under normal load.
- **Scalability**: Decoupled queue architecture able to handle horizontal scaling of worker nodes from 1 to 50+ concurrent instances.
- **Security**: AES-256-GCM encryption for stored secrets; ephemeral execution containers isolated from the host system.
- **Data Retention**: Free tier: 7 days of logs/artifacts; Pro tier: 30 days; Enterprise: 90+ days.
