# Product Development Roadmap — OmniTest

This document defines the strict, phased execution plan for **OmniTest**. In accordance with core engineering principles, development is executed phase by phase. **No future-phase feature may be started until the current phase passes all acceptance criteria.**

---

## Roadmap Overview

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5
Blueprint   Landing      SaaS        Core Engine  Recorder    Testing Modules
            Page         Foundation  (Playwright)             (API, a11y, Perf)
   │
   ▼
Phase 6 ──▶ Phase 7 ──▶ Phase 8 ──▶ Phase 9 ──▶ Phase 10 ──▶ Phase 11
Reports &   CLI &        AI Failure  Billing &    Security &   Beta &
Visual Diff GitHub App   Diagnostics Subscriptions Scale      Public Launch
```

---

## Phase 0: Product Blueprint & Technical Architecture [COMPLETED]
- **Objective**: Establish the uncompromised source of truth, architectural blueprints, schema contracts, API specifications, and security policies for the entire platform.
- **Scope**: Documentation, system design diagrams, database schema definitions, API contracts, security models, and phased roadmaps. No production application code.
- **Deliverables**:
  - `README.md`
  - `PRD.md`
  - `ARCHITECTURE.md`
  - `ROADMAP.md`
  - `SECURITY.md`
  - `API.md`
  - `docs/user-journeys.md`
  - `docs/testing-engines.md`
  - `docs/database-schema.md`
- **Dependencies**: None.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Complete documentation set created without contradictions. (PASSED)
  2. Clear demarcation between MVP and post-MVP capabilities. (PASSED)
  3. All 8 user journeys, 12 database entities, and REST API endpoints explicitly detailed. (PASSED)
  4. Human developer reviews and approves blueprint before proceeding. (PASSED)

---

## Phase 1: SaaS Marketing Landing Page [COMPLETED]
- **Objective**: Launch a world-class, responsive, high-converting public landing page communicating OmniTest's value proposition, features, interactive test demo preview, and waitlist/signup CTA.
- **Scope**:
  - Public marketing site built with Next.js App Router and Tailwind CSS.
  - Interactive hero section illustrating unified testing (UI, API, a11y, Perf).
  - Feature breakdown, interactive code/spec preview, pricing preview, and FAQ.
  - Transparent pricing tiers (Developer, Team Pro, Enterprise).
  - Accessible accordion FAQ and developer CLI workflow showcase.
- **Deliverables**:
  - `apps/web` application with Next.js 14 App Router, Tailwind CSS, and Lucide React.
  - 14 semantic, responsive, accessible sections.
  - Interactive test execution studio preview (`InteractivePreview`).
  - Pixel diff visual regression studio simulation (`VisualTestingSection`).
  - Full SEO metadata, OpenGraph cards, Twitter cards, and responsive viewport.
- **Dependencies**: Phase 0 approval.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Responsive layout with dark-mode developer aesthetic and zero visual overlap. (PASSED)
  2. Accessible semantic HTML, ARIA attributes, and reduced-motion compliance. (PASSED)
  3. Interactive UI demonstrations (multi-engine preview, diff slider, pricing toggle, accordion FAQ) functioning with zero errors. (PASSED)
  4. Typecheck, ESLint, and Next.js production build pass with 0 errors. (PASSED)

---

## Phase 2: SaaS Foundation & Multi-Tenant Core [COMPLETED]
- **Objective**: Implement core user authentication, multi-tenant organization workspaces, RBAC, project management, and persistent database foundation.
- **Scope**:
  - Prisma schema with complete multi-tenant models (`users`, `organizations`, `members`, `projects`, `test_suites`, `tests`, `test_runs`, `test_results`, `artifacts`, `integrations`, `subscriptions`, `usage_records`).
  - Prisma migration `20260923131744_init_saas_schema` applied to local database.
  - Secure bcrypt password hashing and JWT session management via HTTP-only cookies.
  - Next.js edge route protection middleware guarding `/dashboard/*` routes.
  - REST API endpoints for auth (`register`, `login`, `logout`, `me`), organizations, projects CRUD, and user profile.
  - Authenticated dashboard layout with full navigation (Overview, Projects, Tests, Test Runs, Reports, Integrations, Settings), organization switcher, and responsive UI.
  - Complete project lifecycle management (create project, list projects, open project dashboard, edit project, delete project).
- **Deliverables**:
  - `apps/web/prisma/schema.prisma` & migration files.
  - `apps/web/src/lib/db.ts` & `apps/web/src/lib/auth.ts`.
  - `apps/web/src/middleware.ts`.
  - `apps/web/src/app/api/*` routes.
  - `apps/web/src/app/dashboard/*` and `apps/web/src/app/(auth)/*` pages.
  - `scripts/verify-phase2.ts` end-to-end automated verification suite.
- **Dependencies**: Phase 1.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. User can sign up with email, password, and organization name. (PASSED)
  2. User can log in with verified bcrypt credentials and receives secure session token. (PASSED)
  3. User can create new organizations and switch workspaces. (PASSED)
  4. User can create projects with base URL, repository URL, and description. (PASSED)
  5. User can open project dashboard with suites, runs, and settings. (PASSED)
  6. User can log out and session is destroyed. (PASSED)
  7. User can log back in and see persisted projects. (PASSED)
  8. Typecheck, ESLint, Next.js production build, and automated verification script pass with 0 errors. (PASSED)

---

## Phase 3: Core Testing Engine & Worker Pipeline
- **Objective**: Build the foundational test execution pipeline powered by Playwright, orchestrated with isolated execution, step validation, and artifact capture.
- **Scope**:
  - Modular Playwright headless Chromium runner with network intercept, console error tracking, and step-by-step execution.
  - Process isolation via dedicated child worker process (`worker-process.ts`).
  - Standardized JSON test specification format (`TestDefinition`) supporting `goto`, `click`, `fill`, `press`, `wait`, `screenshot`, `assert_url`, `assert_text`, and `assert_visible`.
  - Artifact capture for manual screenshots and automatic failure-state screenshots.
  - Interactive dashboard UI for test authoring, step reordering, execution waterfall timeline, failure diagnostic inspection, and artifact viewing.
- **Deliverables**:
  - `apps/web/src/lib/runner/` (types, validator, executor, worker-process, orchestrator).
  - API endpoints: `POST /api/projects/[id]/tests`, `GET/PATCH/DELETE /api/tests/[id]`, `POST /api/tests/[id]/run`, `GET /api/runs/[id]`.
  - Dashboard pages: Step Builder (`/dashboard/projects/[id]/tests/new`), Test Runner & Diagnostics (`/dashboard/tests/[id]`), Suite Catalog, Runs directory.
  - Acceptance verification script (`scripts/verify-phase3.ts`).
- **Dependencies**: Phase 2.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Multi-step Playwright test can be authored and defined with serializable schema. (PASSED)
  2. Isolated execution runner executes steps outside the main Next.js API process. (PASSED)
  3. Supports all core actions: goto, click, fill, press, wait, screenshot, assert_url, assert_text, assert_visible. (PASSED)
  4. Acceptance test "Homepage loads" navigates, verifies heading, and captures screenshot. (PASSED)
  5. Captures pass/fail state, step execution waterfall, duration, console errors, network failures, and failure screenshots. (PASSED)
  6. Typecheck, ESLint, Next.js production build, and automated verification script pass with 0 errors. (PASSED)

---

## Phase 4: Test Authoring & Bi-Directional Test Recorder
- **Objective**: Provide an interactive browser-based test recorder and visual step editor allowing developers and QA to author robust automated test suites with resilient selectors.
- **Scope**:
  - In-browser instrumented recorder capturing navigations, clicks, text inputs, keyboard presses, and assertions.
  - Resilient selector engine prioritizing `data-testid`, semantic attributes, meaningful tag/name, and stable text locators over fragile class paths.
  - Interactive recording session management (`/api/recorder/start`, `/api/recorder/[id]`, `/api/recorder/[id]/stop`).
  - Seamless import into Step Builder UI for visual step inspection, reordering, and customization.
  - Non-destructive persistence storing recorded tests using standard `TestSpec` v1.0.
  - Direct execution of recorded tests on headless Chromium runner grid.
- **Deliverables**:
  - `apps/web/src/lib/recorder/` (`script.ts`, `manager.ts`).
  - `apps/web/src/app/api/recorder/` (session start, poll/interact, stop endpoints).
  - `apps/web/src/components/recorder/TestRecorder.tsx`.
  - Upgraded test creation workflow with interactive recording modal.
  - Automated acceptance test script (`scripts/verify-phase4.ts`).
- **Dependencies**: Phase 3.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Users can launch an instrumented browser recording session from dashboard. (PASSED)
  2. Recorder captures navigations, clicks, typing, keyboard presses, and assertions into resilient selectors. (PASSED)
  3. Captured steps convert cleanly to valid `TestStep[]` compliant with `TestSpec` v1.0. (PASSED)
  4. Developers can inspect, edit, reorder, and save generated steps without modifying existing tests. (PASSED)
  5. Recorded test executes and passes in the Playwright execution engine. (PASSED)
  6. Typecheck, ESLint, Next.js production build, and all verification suites pass with 0 errors. (PASSED)

---

## Phase 5A: Native API Testing Module
- **Objective**: Deliver a full-featured API testing module integrated into the OmniTest test execution, persistence, and dashboard architecture.
- **Scope**:
  - Request builder supporting `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
  - Configurable query params, request headers, JSON request body with validation, and authentication (Bearer, Basic, API Key).
  - Dedicated API execution engine (`api-executor.ts`) independent from browser workers.
  - Comprehensive response viewer displaying HTTP status, response time, response size, formatted JSON body, headers, and assertion evaluation diffs.
  - Extensible assertion suite (Status code, Response time SLA, JSON property path/equality/containment, Response body text, Headers).
  - Secret masking protecting credentials in logs and dashboards.
  - Unified data model and test-run orchestration supporting both Browser and API tests seamlessly.
- **Deliverables**:
  - `apps/web/src/lib/runner/` (`api-types.ts`, `api-validator.ts`, `api-executor.ts`).
  - `apps/web/src/components/api/` (`ApiRequestBuilder.tsx`, `ApiResponseViewer.tsx`).
  - Updated New Test & Test Runner views with test type selection and visual badges.
  - Automated verification test suite (`scripts/verify-phase5a.ts`).
- **Dependencies**: Phase 3 and Phase 4.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Developers can configure HTTP method, URL, params, headers, JSON body, and auth. (PASSED)
  2. Common API auth patterns supported with credential masking in logs/UI. (PASSED)
  3. API execution engine runs independently outside React components with configurable timeouts. (PASSED)
  4. Response viewer renders status, response time, headers, formatted JSON body, and assertion diffs. (PASSED)
  5. API assertions accurately evaluate status, duration, JSON paths, text, and headers. (PASSED)
  6. API tests integrate directly with existing Project -> Suite -> Test -> Run -> Result data model. (PASSED)
  7. Visual distinction cleanly differentiates Browser and API tests across dashboard views. (PASSED)
  8. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 5B: Automated Accessibility Scanning (`axe-core`)
- **Objective**: Deliver automated WCAG accessibility audits integrated into the OmniTest headless browser architecture, providing actionable rule violations, node selectors, severity classification, and remediation guidance.
- **Scope**:
  - Headless Chromium runner injecting `axe-core` to scan full pages or targeted selector regions.
  - Standardized `A11yTestSpec` specification with configurable WCAG compliance levels (`wcag2a`, `wcag2aa`, `wcag2aaa`, `wcag21a`, `wcag21aa`, `best-practice`).
  - Severity classification engine grouping findings into `critical`, `serious`, `moderate`, and `minor` tiers.
  - Non-blocking visual screenshot evidence capture attached to execution runs as stored artifacts.
  - Dedicated interactive Accessibility Result Viewer with expandable rule drawers, impacted DOM node selectors, and sanitized/escaped HTML evidence snippets.
  - Unified orchestration through Project &rarr; Test Suite &rarr; Test &rarr; Test Run &rarr; Test Result hierarchy.
  - Visual badges and icons (`Eye`) differentiating accessibility audits across dashboard directories.
- **Deliverables**:
  - `apps/web/src/lib/runner/` (`a11y-types.ts`, `a11y-validator.ts`, `a11y-executor.ts`).
  - `apps/web/src/components/a11y/` (`A11yTestConfig.tsx`, `A11yResultViewer.tsx`).
  - Upgraded dashboard pages (`/dashboard/projects/[id]/tests/new`, `/dashboard/tests/[id]`, `/dashboard/tests`, `/dashboard/projects/[id]`).
  - Automated acceptance test script (`scripts/verify-phase5b.ts`).
- **Dependencies**: Phase 5A.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Accessibility test type supported in test definitions with configurable URL, scope, and WCAG standards. (PASSED)
  2. Playwright runner injects axe-core and evaluates compliance rules without browser crashes. (PASSED)
  3. Violations categorized into standard impact tiers (critical, serious, moderate, minor) with accurate node tallies. (PASSED)
  4. Node selectors and HTML evidence cleanly extracted and displayed without XSS vulnerabilities. (PASSED)
  5. Scoped selector scans evaluate specific DOM subtrees independently from full pages. (PASSED)
  6. Visual screenshot artifact captured and stored in database run records. (PASSED)
  7. Accessibility tests execute and record metrics through universal test orchestrator. (PASSED)
  8. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

## Phase 5C: Automated Web Performance & Core Web Vitals
- **Objective**: Deliver automated web performance audits integrated into the OmniTest headless Chromium browser architecture, capturing real Core Web Vitals (LCP, CLS), page timing metrics (FCP, TTFB, DOM Content Loaded, Load Event, Total Load), resource network metrics, and deterministic threshold evaluations without fabricated scores.
- **Scope**:
  - Headless Chromium runner collecting real browser `PerformanceObserver` and Navigation Timing API Level 2 entries.
  - Core Web Vitals measurement (LCP, CLS); INP honestly recorded as unavailable in non-interactive synthetic page loads.
  - Additional page metrics: FCP, TTFB, DOM Content Loaded, Load Event End, and Total Page Load Duration.
  - Network and subresource analysis: request counts, failed requests (network/DNS/HTTP 4xx/5xx), transferred bytes, and resource type breakdown (JavaScript, CSS, Images, Fonts, Other).
  - Configurable deterministic threshold rules (`lt`, `lte`, `gt`, `gte`, `eq`) evaluated against real measurements.
  - Multi-run consistency with optional warmup run and median aggregation across measurement runs.
  - Non-blocking visual screenshot evidence capture attached to execution runs as stored artifacts.
  - Interactive Performance Result Viewer with Core Web Vitals cards, timing breakdown, network analysis, threshold evaluation table, and synthetic audit disclosure notices.
  - Unified orchestration through Project &rarr; Test Suite &rarr; Test &rarr; Test Run &rarr; Test Result hierarchy.
  - Visual badges and icons (`Zap`) differentiating performance audits across dashboard views.
- **Deliverables**:
  - `apps/web/src/lib/runner/` (`perf-types.ts`, `perf-validator.ts`, `perf-executor.ts`).
  - `apps/web/src/components/performance/` (`PerformanceTestConfig.tsx`, `PerformanceResultViewer.tsx`).
  - Upgraded dashboard pages (`/dashboard/projects/[id]/tests/new`, `/dashboard/tests/[id]`, `/dashboard/tests`, `/dashboard/projects/[id]`).
  - Automated acceptance test script (`scripts/verify-phase5c.ts`).
- **Dependencies**: Phase 5B.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Performance test type supported in test definitions with configurable URL, device viewport, runs, and thresholds. (PASSED)
  2. Real browser runner collects authentic timing metrics without fabricated values. (PASSED)
  3. LCP and CLS captured via PerformanceObserver; INP honestly marked unavailable. (PASSED)
  4. FCP, TTFB, DOM Content Loaded, and Load Event End extracted from browser APIs. (PASSED)
  5. Total requests, failed requests, and transferred bytes calculated from network activity. (PASSED)
  6. Thresholds evaluate deterministically producing PASS or FAIL based on target conditions. (PASSED)
  7. Multi-run mode aggregates metrics using mathematical median across measurement runs. (PASSED)
  8. Visual screenshot artifact captured and stored in database run records. (PASSED)
  9. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 5D: Automated Technical SEO Testing
- **Objective**: Deliver automated technical SEO audits integrated into the OmniTest headless Chromium browser architecture, inspecting document metadata, crawlability signals, heading hierarchy, image semantics, link health, structured data, and robots/sitemap availability without arbitrary fake scores.
- **Scope**:
  - Headless Chromium runner inspecting real DOM elements, response headers (`X-Robots-Tag`), redirect chains, and server responses.
  - Page title inspection: existence, non-empty validation, length heuristic analysis.
  - Meta description inspection: existence, non-empty validation, length heuristic analysis.
  - Canonical URL inspection: single declaration check, absolute vs relative format, self-referential check.
  - Robots directives inspection: `noindex`, `nofollow`, `noarchive`, `nosnippet`, and `X-Robots-Tag` header parsing.
  - Headings hierarchy analysis: H1 existence and count (single H1 recommendation), empty headings, hierarchy jump detection.
  - Image semantics analysis: alt attributes, missing alt detection, decorative vs content classification, dimensions, lazy-loading indicators.
  - Link health analysis: directly referenced anchor validation, missing href, empty text, internal vs external counts, and HTTP reachability sampling.
  - Social metadata analysis: Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and Twitter Cards (`twitter:card`, `twitter:title`, `twitter:image`).
  - Structured data analysis: JSON-LD script blocks detection, syntax validation, `@type` extraction, and Microdata/RDFa detection.
  - Technical signals: HTML `lang` attribute, mobile viewport meta tag configuration, and layout width overflow checks.
  - Host robots.txt analysis: fetch `/robots.txt`, parseability, disallow directive checks for target path, and sitemap discovery with size limits.
  - Sitemap verification: discover sitemap from robots.txt, availability check, XML parseability check, and URL counts with size limits.
  - Configurable deterministic assertions: `titleRequired`, `metaDescriptionRequired`, `canonicalRequired`, `h1Required`, `noindexDisallowed`, `expectedStatusCode`, `structuredDataRequired`, `maxRedirects`, and `noBrokenLinks`.
  - Pass/Fail semantics: Test passes if all assertions succeed; recommendations/heuristics generate warnings without failing tests.
  - Non-blocking visual screenshot capture attached as an `Artifact` record (`type: "SCREENSHOT"`).
  - Interactive SEO Result Viewer with categories filter, severity badges (Error, Warning, Info, Pass), sanitized HTML evidence drawers, and screenshot modal.
  - Unified orchestration through Project &rarr; Test Suite &rarr; Test &rarr; Test Run &rarr; Test Result hierarchy.
  - Visual badges and icons (`Search`) differentiating SEO audits across dashboard views.
- **Deliverables**:
  - `apps/web/src/lib/runner/` (`seo-types.ts`, `seo-validator.ts`, `seo-executor.ts`).
  - `apps/web/src/components/seo/` (`SeoTestConfig.tsx`, `SeoResultViewer.tsx`).
  - Upgraded dashboard pages (`/dashboard/projects/[id]/tests/new`, `/dashboard/tests/[id]`, `/dashboard/tests`, `/dashboard/projects/[id]`).
  - Automated acceptance test script (`scripts/verify-phase5d.ts`).
- **Dependencies**: Phase 5C.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. SEO test type supported in test definitions with configurable URL, check categories, and deterministic assertions. (PASSED)
  2. Real browser runner inspects authentic document DOM, headers, and metadata without arbitrary fake scores. (PASSED)
  3. Page title, meta description, and canonical URL evaluated with factual length heuristics. (PASSED)
  4. Headings hierarchy accurately tallies H1-H6 tags, detects missing/multiple H1s, and identifies skips. (PASSED)
  5. Image semantics distinguish decorative graphics (`alt=""`) from content images missing alt text. (PASSED)
  6. Sampled direct links checked for HTTP status and broken destinations with timeout limits. (PASSED)
  7. Open Graph and Twitter Card tags detected and cataloged. (PASSED)
  8. JSON-LD structured data detected, syntax validated, and schema types extracted without XXE risks. (PASSED)
  9. Robots.txt and discovered sitemaps fetched and parsed with strict size and timeout limits. (PASSED)
  10. Assertions evaluate deterministically producing PASS or FAIL based on target expectations. (PASSED)
  11. Visual screenshot artifact captured and stored in database run records. (PASSED)
  12. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 6A: Unified Reporting System [COMPLETED]
- **Objective**: Deliver a unified, deterministic reporting engine aggregating execution telemetry across all five OmniTest testing engines (`UI`, `API`, `ACCESSIBILITY`, `PERFORMANCE`, and `SEO`), with interactive dashboard viewer, failure diagnostics, multi-engine breakdown filtering, and secure JSON exports.
- **Scope**:
  - Pure deterministic report compiler (`report-generator.ts`) compiling `TestRun` and `TestResult` records without redundant database tables.
  - Comprehensive high-level summary: total tests, passed, failed, errors (timeouts/unhandled aborts), skipped, deterministic pass rate, execution duration, and ISO timestamps.
  - Interactive Testing Engine Breakdown: individual cards for UI, API, Accessibility, Performance, and SEO displaying test counts, pass rates, and filtering the results view.
  - Failure & Error Diagnostics: automated failure snippet extraction identifying step failures, HTTP status/assertion mismatches, axe-core WCAG violations, performance metric breaches, and SEO requirement failures.
  - Results Table: searchable by title/error, filterable by status tabs and engine type, sortable (Failures first, duration, title A-Z), with expandable diagnostic drawers and test inspection links.
  - Security & Credential Scrubbing: automated redaction of sensitive request/response headers (`authorization`, `cookie`, `set-cookie`, `x-api-key`, `*token*`, `*secret*`) before returning or exporting reports.
  - Dedicated Report Routes:
    - Dedicated web route: `/dashboard/projects/[projectId]/runs/[runId]/report` with auto-polling while runs are active.
    - Export endpoint: `/api/projects/[projectId]/runs/[runId]/report?export=json` with attachment download headers and organization authorization checks.
  - Navigation Upgrades:
    - `/dashboard/reports`: Upgraded from static placeholder into active organization-wide quality reports directory.
    - `/dashboard/runs` & `/dashboard/projects/[id]`: Added direct "View Report" actions to execution cards.
- **Deliverables**:
  - `apps/web/src/lib/reports/` (`report-types.ts`, `report-generator.ts`).
  - `apps/web/src/components/reports/` (`ReportHeader.tsx`, `ReportSummaryCards.tsx`, `ReportTypeBreakdown.tsx`, `ReportFailuresSection.tsx`, `ReportResultsTable.tsx`, `RunReportViewer.tsx`).
  - `apps/web/src/app/api/projects/[projectId]/runs/[runId]/report/route.ts`.
  - `apps/web/src/app/dashboard/projects/[projectId]/runs/[runId]/report/page.tsx`.
  - Upgraded `/dashboard/reports/page.tsx`, `/dashboard/runs/page.tsx`, and `/dashboard/projects/[id]/page.tsx`.
  - Automated acceptance test script (`scripts/verify-phase6a.ts`).
- **Dependencies**: Phase 5 (all engines).
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Unified report generated deterministically from existing TestRun and TestResult records without schema modifications. (PASSED)
  2. Aggregates results across all 5 engines (UI, API, Accessibility, Performance, SEO) with separate engine tallies. (PASSED)
  3. Computes accurate total tests, passed, failed, errors, skipped, duration, and deterministic pass rate percentage. (PASSED)
  4. Engine cards dynamically filter the results table and failure sections. (PASSED)
  5. Search input filters tests by title, type, and error messages in real-time. (PASSED)
  6. Failure section extracts engine-specific failure snippets and links directly to test inspection pages. (PASSED)
  7. Sensitive headers (authorization, cookies, tokens, API keys) scrubbed before display and export. (PASSED)
  8. JSON export available via API endpoint with proper attachment headers. (PASSED)
  9. Unauthorized users or cross-organization access properly rejected with 401/404. (PASSED)
  10. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 6B: Artifact Viewer & Media Explorer [COMPLETED]
- **Objective**: Deliver a unified, developer-centric Artifact Viewer for inspecting all visual, textual, and structured diagnostics across all five testing engines (`UI`, `API`, `ACCESSIBILITY`, `PERFORMANCE`, and `SEO`).
- **Scope**:
  - Reused existing `model Artifact` and `TestResult` storage architecture without creating duplicate tables or storage mechanisms.
  - Multi-engine artifact synthesis (`compileResultArtifacts`) combining physical disk/S3 artifacts (screenshots, traces, video) and structured runtime evidence (console error logs, network failure traces, API request/response payloads, axe-core JSON audits, Web Vitals metrics, and technical SEO findings).
  - Specialized Viewers:
    - **Screenshots**: Pan & zoom (fit, actual 100%, + / -), background switcher (dark, light, checkerboard for alpha channels), natural dimension detection, fullscreen mode.
    - **JSON & Evidence**: Syntax-highlighted formatted JSON, line numbers, search within JSON, copy button with inline feedback, minify/format toggle.
    - **Logs & Text**: Monospace terminal viewer with 3-digit line numbering, search filtering, word-wrap toggle, and one-click copy.
    - **HTML Documents**: Strict sandboxed `<iframe>` (`sandbox=""`) ensuring isolated rendering with zero access to parent DOM, cookies, local storage, or authentication.
    - **Playwright Traces**: Trace archive inspector with one-click download, copyable `npx playwright show-trace` local execution helper, and web trace viewer links.
    - **Video Recordings**: Native HTML5 video player with seek bar, playback controls, time display, volume, and fullscreen.
    - **Rich Evidence**: Visual scorecards and breakdown drawers for API transactions (masked credentials), Network failures, Core Web Vitals, A11y violations, and SEO metadata.
  - Two-Column Responsive Layout (`ArtifactViewerLayout`): Filter pills (`All`, `Images`, `Logs`, `JSON`, `Trace`, `Video`), search bar, keyboard navigation (`ArrowLeft` / `ArrowRight`), prev/next controls, and download actions.
  - Security & Privacy: Automatic scrubbing of sensitive headers (`authorization`, `cookie`, `set-cookie`, `x-api-key`, `*token*`, `*secret*`) before display or download. Multi-tenant RBAC enforced on all artifact endpoints.
  - Routes & APIs:
    - `/dashboard/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts`: Dedicated viewer page.
    - `/api/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts`: List artifacts.
    - `/api/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts/[artifactId]/content`: Stream/download raw artifact content.
- **Deliverables**:
  - `apps/web/src/lib/artifacts/` (`artifact-types.ts`, `artifact-helper.ts`).
  - `apps/web/src/components/artifacts/` (`ArtifactList.tsx`, `ArtifactViewerLayout.tsx`, `ScreenshotViewer.tsx`, `JsonViewer.tsx`, `LogViewer.tsx`, `HtmlViewer.tsx`, `TraceViewer.tsx`, `VideoViewer.tsx`, `EvidenceViewer.tsx`).
  - `apps/web/src/app/api/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts/` (`route.ts`, `[artifactId]/content/route.ts`).
  - `apps/web/src/app/dashboard/projects/[projectId]/runs/[runId]/results/[resultId]/artifacts/page.tsx`.
  - Upgraded test detail and report failure views.
  - Automated acceptance test script (`scripts/verify-phase6b.ts`).
- **Dependencies**: Phase 6A.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Test results expose available artifacts in a reusable list. (PASSED)
  2. Artifact viewer has a stable, authenticated route. (PASSED)
  3. Screenshots can be viewed with zoom, background toggle, and dimensions metadata. (PASSED)
  4. Text/log artifacts can be viewed with line numbers, search, and copy. (PASSED)
  5. JSON artifacts can be formatted, searched, and copied. (PASSED)
  6. Supported video artifacts can be played with native HTML5 controls. (PASSED)
  7. Trace artifacts can be downloaded with local CLI helper commands. (PASSED)
  8. API, Network, Performance, A11y, and SEO evidence can be inspected. (PASSED)
  9. Artifact search, category filtering, and prev/next keyboard navigation work smoothly. (PASSED)
  10. Sensitive headers are redacted and HTML artifacts are strictly isolated in sandboxed iframes. (PASSED)
  11. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 6C: Visual Regression Testing [COMPLETED]
- **Objective**: Deliver automated, pixel-accurate visual regression testing powered by `pixelmatch` and `pngjs` with explicit baseline approval workflows, ignore regions, anti-aliasing sensitivity controls, four-mode comparison viewer, and seamless reporting integration.
- **Scope**:
  - Deterministic Pixel-by-Pixel Diff Engine (`visual-comparator.ts`):
    - Decodes baseline and current PNG buffers using `pngjs`.
    - Dimension Mismatch Protection: Detects viewport/image dimension changes (e.g. 1280x720 vs 1440x900), flagging `DIMENSION_MISMATCH` with exact pixel dimensions rather than crashing or skewing pixels.
    - Ignore Regions: Bounding box masks (`VisualIgnoreRegion[]`) and dynamic selector bounding boxes (`ignoreSelectors`) that mask volatile elements, timestamps, and live feeds before comparison.
    - Pixelmatch diff calculation with configurable sensitivity (`diffPixelThreshold: 0.1`) and magenta-red diff highlighting.
    - Deterministic Metrics: Calculates total pixels, changed pixels, difference percentage (`(changed / total) * 100`), threshold percentage, and pass/fail state.
  - Explicit Baseline Management (`baseline-manager.ts`):
    - Baselines are immutable and NEVER automatically overwritten on test failure.
    - Initial candidate screenshots saved as `VISUAL_CURRENT` in `NO_BASELINE` state with one-click "Set as Baseline".
    - Safety confirmation modal before updating/accepting baselines.
    - Promotes run screenshots to golden baseline files (`/artifacts/baselines/[testId]/baseline.png`) and links to `db.artifact` with `type: "VISUAL_BASELINE"`.
    - Stores metadata: dimensions, author email, timestamps, and artifact linkage.
  - Interactive Four-Mode Visual Comparison Viewer (`VisualComparisonViewer.tsx`):
    - **Side-by-Side**: Baseline and Current screenshots aligned with dimension and status metadata.
    - **Diff View**: Visual difference overlay highlighting exact changed pixels in magenta.
    - **Split Slider**: Draggable interactive divider (`⟷`) wiping between Before and After.
    - **Opacity Overlay**: Adjustable slider (0% to 100%) blending baseline and current to expose subtle layout shifts.
    - Action bar: Set/Update baseline with safety confirmation modal, download diff image.
    - Metric strip: Diff %, Threshold %, Changed Pixels, Total Pixels, Current and Baseline dimensions.
  - Result & Report Integration:
    - `VisualRegressionCard`: Compact summary card embedded in Test Result, Run Report, and Test Detail pages.
    - Phase 6A Run Report: Surfaces visual regression failures with changed pixel counts and diff percentages in the failure section.
    - Phase 6B Artifact Viewer: Full first-class support for `VISUAL_BASELINE`, `VISUAL_CURRENT`, and `VISUAL_DIFF` artifacts.
  - Routes & APIs:
    - `/dashboard/projects/[projectId]/runs/[runId]/results/[resultId]/visual-comparison`: Dedicated visual comparison page.
    - `GET /api/projects/[projectId]/tests/[testId]/visual-regression/baseline`: Retrieve active baseline.
    - `POST /api/projects/[projectId]/tests/[testId]/visual-regression/baseline`: Set or update baseline from artifact with RBAC check.
    - `DELETE /api/projects/[projectId]/tests/[testId]/visual-regression/baseline`: Remove active baseline.
    - `GET /api/projects/[projectId]/runs/[runId]/results/[resultId]/visual-comparison`: Fetch comparison telemetry and artifact URLs.
- **Deliverables**:
  - `apps/web/src/lib/visual/` (`visual-types.ts`, `visual-comparator.ts`, `baseline-manager.ts`).
  - `apps/web/src/components/visual/` (`VisualComparisonViewer.tsx`, `VisualRegressionCard.tsx`).
  - `apps/web/src/app/api/projects/[projectId]/tests/[testId]/visual-regression/baseline/route.ts`.
  - `apps/web/src/app/api/projects/[projectId]/runs/[runId]/results/[resultId]/visual-comparison/route.ts`.
  - `apps/web/src/app/dashboard/projects/[projectId]/runs/[runId]/results/[resultId]/visual-comparison/page.tsx`.
  - Integrated `executor.ts`, `orchestrator.ts`, `report-generator.ts`, `ReportResultsTable.tsx`, `ArtifactList.tsx`, and `ArtifactViewerLayout.tsx`.
  - Automated acceptance test script (`scripts/verify-phase6c.ts`).
- **Dependencies**: Phase 6A, Phase 6B.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Image comparison operates on real pixel data using pixelmatch and pngjs with zero fake/random scores. (PASSED)
  2. Identical screenshots produce exact 0% difference and PASSED status. (PASSED)
  3. Modified screenshots detect exact changed pixel counts and produce visual diff PNG buffers. (PASSED)
  4. Ignore regions mask specified areas and prevent false positive diffs. (PASSED)
  5. Dimension mismatch cleanly flagged with exact dimensions. (PASSED)
  6. First-run test without baseline enters NO_BASELINE state without falsely failing or crashing. (PASSED)
  7. Baselines are created and updated only via explicit user action with safety confirmation. (PASSED)
  8. Four-mode comparison viewer supports Side-by-Side, Diff View, Split Slider, and Opacity Overlay. (PASSED)
  9. Run report surfaces visual failure reasons with exact diff percentages and changed pixels. (PASSED)
  10. Visual artifacts (VISUAL_BASELINE, VISUAL_CURRENT, VISUAL_DIFF) integrated into Artifact Viewer. (PASSED)
  11. Typecheck, ESLint, Next.js build, and all verification test suites pass with 0 errors. (PASSED)

---

## Phase 6D: Historical Trends & Flakiness Tracking [COMPLETED]
- **Objective**: Deliver a comprehensive test and run execution history system enabling developers to understand how tests and projects behave over time, analyze execution durations, spot performance regressions, monitor flakiness indices, and compare runs side by side.
- **Scope**:
  - Reused existing `TestRun`, `TestResult`, `Artifact`, `Test`, and `Project` Prisma models without creating redundant tables or duplicate data stores.
  - Added database indexes (`@@index([projectId, createdAt])`, `@@index([status])`, `@@index([testRunId])`, `@@index([testId, createdAt])`, `@@index([status])`, `@@index([testType])`, `@@index([testResultId])`) for fast history querying.
  - Dedicated History Query & Analytics Engine (`history-service.ts`):
    - Server-side multi-field filtering: search (title, commit, branch, target), status, engine type, date ranges (`today`, `7d`, `30d`, `custom`), sorting (`newest`, `oldest`, `duration`, `status`).
    - Server-side pagination with exact total counts and page limits.
    - Aggregated KPIs: total executions, pass count, fail/timeout counts, pass rate %, average/min/max durations.
    - Lightweight, zero-dependency SVG visualizations: duration sparkline with average baseline, hover cards, pass/fail sequence micro-blocks, and activity timeline.
    - Performance Regression Detection: Evaluates latest run against historical baseline, flagging `isSlower: true` with percentage variance when significant slowdowns occur.
    - Flakiness Detection: Calculates deterministic flakiness score (0-100) based on status flip frequencies between consecutive runs.
    - Run Comparison Engine (`compareTestRuns`): Compares Run A vs Run B identifying regressions (passed &rarr; failed), resolved fixes (failed &rarr; passed), unchanged test duration variance, and visual regression differential.
  - Multi-Tenant Authorization & Security: Strict organization membership verification on all endpoints. Cross-tenant queries and cross-project run comparisons are rejected server-side.
  - Artifact & Visual Regression Continuity: Seamlessly extracts and surfaces visual comparison metrics (difference %, changed pixels, visual status) and maps artifact URLs for direct inspection.
  - Developer-Grade UI:
    - Dedicated Route: `/dashboard/projects/[projectId]/history` with live search, status pills, engine selectors, date range filters, and sort options.
    - `HistorySummaryCards`: KPI overview cards (Total Runs, Pass Rate %, Failures, Average Duration).
    - `HistoryTrends`: Zero-dependency SVG sparklines with interactive point hover cards and stability/flakiness gauge.
    - `HistoryTable`: High-density responsive data table linking to Run Reports, Artifact Viewer, Visual Comparison, and Test Details.
    - `RunComparisonView`: Side-by-side run regression and performance variance inspector.
    - `TestDetailHistory`: Integrated history section on `/dashboard/tests/[testId]` showing recent executions, stability metrics, and slowdown alerts.
- **Deliverables**:
  - `apps/web/src/lib/history/` (`history-types.ts`, `history-service.ts`).
  - `apps/web/src/components/history/` (`HistorySummaryCards.tsx`, `HistoryTrends.tsx`, `HistoryFilters.tsx`, `HistoryTable.tsx`, `RunComparisonView.tsx`, `TestHistoryViewer.tsx`, `TestDetailHistory.tsx`).
  - `apps/web/src/app/api/projects/[projectId]/history/route.ts`.
  - `apps/web/src/app/api/projects/[projectId]/tests/[testId]/history/route.ts`.
  - `apps/web/src/app/api/projects/[projectId]/runs/compare/route.ts`.
  - `apps/web/src/app/dashboard/projects/[projectId]/history/page.tsx`.
  - Upgraded `/dashboard/projects/[projectId]/page.tsx` and `/dashboard/tests/[testId]/page.tsx`.
  - Automated acceptance test script (`scripts/verify-phase6d.ts`).
- **Dependencies**: Phase 6A, Phase 6B, Phase 6C.
- **Status**: Completed and verified.
- **Acceptance Criteria**:
  1. Test history queried deterministically from existing models with optimized indexing. (PASSED)
  2. Server-side pagination isolates records across pages with exact total counts. (PASSED)
  3. Status, test type, search, and date range filters operate server-side. (PASSED)
  4. Sorting by duration and date strictly orders results. (PASSED)
  5. Test-specific history accurately computes pass/fail sequence and consecutive failures. (PASSED)
  6. Performance slowdown detection accurately compares latest run against baseline and flags regressions. (PASSED)
  7. Deterministic flakiness score calculates status flip frequency without synthetic data. (PASSED)
  8. Artifact references, counts, and URLs correctly mapped into history items. (PASSED)
  9. Visual regression metrics (diff %, changed pixels, status) surfaced in history entries. (PASSED)
  10. Run comparison engine identifies test regressions, resolved fixes, and visual metric deltas. (PASSED)
  11. Multi-tenant project isolation strictly enforced across all history queries and comparisons. (PASSED)
  12. Typecheck, ESLint, Next.js build, and all 10 verification test suites pass with 0 errors. (PASSED)

---

## Phase 7: Developer CLI & GitHub CI Integration
- **Objective**: Deliver a seamless developer experience via an official CLI and turnkey GitHub App integration for pull request workflows.
- **Scope**:
  - `@omnitest/cli` package published to npm: Run tests locally, stream cloud runs, or upload local results.
  - GitHub App integration: Check Runs API integration posting granular statuses per suite.
  - Automatic GitHub PR comment with run summary, failed assertions, and video links.
- **Deliverables**:
  - Standalone `cli/` codebase with CLI commands (`omnitest run`, `omnitest init`).
  - GitHub Webhook handler and PR check updater.
- **Dependencies**: Phase 3 and Phase 5.
- **Acceptance Criteria**:
  1. Developer can run `npx omnitest run` in local terminal and execute tests.
  2. Opening a PR in a linked GitHub repo triggers a suite run and marks PR check green/red.
  3. PR comment displays test breakdown, duration, and direct links to trace viewer.

---

## Phase 8: AI-Assisted Test Diagnostics & Auto-Healing
- **Objective**: Supercharge debugging through LLM-driven root-cause failure analysis and automated selector healing.
- **Scope**:
  - AI failure triage: On test failure, analyze stack trace, DOM diff, and console logs to generate concise, human-readable explanations.
  - Auto-healing locators: When a DOM element selector fails, search the current DOM snapshot for semantically equivalent elements and suggest updated locators.
- **Deliverables**:
  - Background AI diagnostic worker service.
  - "AI Insights" card in test failure dashboard with suggested fixes.
- **Dependencies**: Phase 6.
- **Acceptance Criteria**:
  1. Failed test generates a root cause summary within 5 seconds of failure.
  2. Accurately distinguishes between network timeouts, backend 500s, and UI selector changes.
  3. Suggested locator fixes can be accepted with one click to update test definition.

---

## Phase 9: Subscription Billing, Metering & Usage Quotas
- **Objective**: Implement Stripe-powered SaaS billing, subscription tiers (Free, Pro, Enterprise), metered concurrency usage, and hard quota enforcement.
- **Scope**:
  - Stripe Checkout integration for subscription upgrades.
  - Stripe Customer Portal for billing management and invoice downloads.
  - Concurrency slot tracking and monthly test execution minute metering.
  - Quota enforcement middleware blocking executions when account limits are breached.
- **Deliverables**:
  - `packages/billing` Stripe service integration.
  - Usage tracking service and customer billing portal UI.
- **Dependencies**: Phase 2 and Phase 3.
- **Acceptance Criteria**:
  1. Free users are constrained to free-tier quotas (e.g. 100 test runs/month, 1 concurrency slot).
  2. Upgrading to Pro via Stripe immediately unlocks higher concurrency and test minutes.
  3. Stripe subscription cancel/past_due webhooks downgrade or restrict account access correctly.

---

## Phase 10: Enterprise Security, Audit Logs & High-Availability Scaling
- **Objective**: Harden platform security, add enterprise audit logging, enable SSO/SAML, and scale worker infrastructure horizontally.
- **Scope**:
  - Enterprise audit logs tracking all actions (run triggered, member invited, secret modified).
  - SAML / Okta SSO integration via WorkOS or Auth.js.
  - Horizontal auto-scaling of worker fleet on Kubernetes / AWS ECS based on queue depth.
  - Self-hosted runner agent support for on-prem enterprise VPCs.
- **Deliverables**:
  - Audit logging system and compliance export.
  - Enterprise SSO configuration screens.
  - Kubernetes Helm chart / Terraform specs for worker fleet.
- **Dependencies**: Phase 9.
- **Acceptance Criteria**:
  1. Organization admins can view and filter comprehensive audit log entries.
  2. Enterprise users can authenticate via SAML SSO.
  3. Worker fleet automatically scales out under heavy queue load and scales in to zero.

---

## Phase 11: Beta Hardening & Public Launch
- **Objective**: Perform comprehensive stress testing, security pentesting, final polish, developer documentation, and public launch.
- **Scope**:
  - Load testing API and runner fleet under 1,000 concurrent test executions.
  - End-to-end regression testing across all supported browser engines.
  - Public developer documentation site (`docs.omnitest.dev`).
  - Product Hunt, Hacker News, and general availability launch.
- **Deliverables**:
  - Production launch checklist verification.
  - Public docs and starter templates for popular frameworks (Next.js, Vite, Remix).
- **Dependencies**: All preceding phases.
- **Acceptance Criteria**:
  1. Zero critical or high security vulnerabilities in audit.
  2. 99.9% uptime maintained during private beta.
  3. Public self-serve onboarding operating flawlessly end-to-end.
