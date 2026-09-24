# REST API Reference Specification — OmniTest

All REST API endpoints are prefixed with `/api/v1`. Responses are formatted in JSON unless specified otherwise (e.g., SSE streams). Standard HTTP response codes are utilized throughout.

---

## 1. Global Standards & Error Format

### 1.1 Error Response Contract
All error responses adhere to the RFC 7807 Problem Details contract:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested test run does not exist or you do not have permission to view it.",
    "statusCode": 404,
    "details": [
      { "field": "runId", "issue": "UUID is not recognized" }
    ],
    "timestamp": "2026-09-23T12:30:00.000Z"
  }
}
```

### 1.2 Authentication Schemes
- **User Session / Bearer JWT**: `Authorization: Bearer <user_jwt_token>` or via secure HTTP-only cookies.
- **Project API Token**: `Authorization: Bearer omt_live_<token>` (used by CLI, CI/CD, and scripts).
- **Webhook HMAC**: Third-party headers (`X-Hub-Signature-256`, `Stripe-Signature`).

---

## 2. Authentication & User Endpoints

### 2.1 Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Purpose**: Create a new user account and default organization.
- **Auth**: Public
- **Request Shape**:
```json
{
  "email": "user@example.com",
  "password": "Password123!Safe",
  "fullName": "Jane Doe",
  "organizationName": "Acme Engineering"
}
```
- **Response Shape (201 Created)**:
```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "user@example.com",
    "fullName": "Jane Doe"
  },
  "organization": {
    "id": "org_c1e54a9d-5a7c-48be-850f-e2f416e788e0",
    "name": "Acme Engineering",
    "slug": "acme-engineering",
    "role": "OWNER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.2 Login User
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Purpose**: Authenticate user and issue session token.
- **Auth**: Public
- **Request Shape**:
```json
{
  "email": "user@example.com",
  "password": "Password123!Safe"
}
```
- **Response Shape (200 OK)**:
```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "user@example.com",
    "fullName": "Jane Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.3 Get Current User Session
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Purpose**: Retrieve profile and organization memberships of current user.
- **Auth**: User Session
- **Response Shape (200 OK)**:
```json
{
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "user@example.com",
    "fullName": "Jane Doe"
  },
  "organizations": [
    {
      "id": "org_c1e54a9d-5a7c-48be-850f-e2f416e788e0",
      "name": "Acme Engineering",
      "slug": "acme-engineering",
      "role": "OWNER"
    }
  ]
}
```

---

## 3. Organizations & Members

### 3.1 List Organization Members
- **Method**: `GET`
- **Path**: `/api/v1/organizations/:orgId/members`
- **Purpose**: Fetch all members and their roles for an organization.
- **Auth**: User Session (Member or above)
- **Response Shape (200 OK)**:
```json
{
  "members": [
    {
      "id": "mem_01",
      "userId": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "fullName": "Jane Doe",
      "email": "user@example.com",
      "role": "OWNER",
      "joinedAt": "2026-09-01T10:00:00Z"
    }
  ]
}
```

### 3.2 Invite Organization Member
- **Method**: `POST`
- **Path**: `/api/v1/organizations/:orgId/members/invite`
- **Purpose**: Send an invitation email with a joining link.
- **Auth**: User Session (Owner or Admin)
- **Request Shape**:
```json
{
  "email": "teammate@example.com",
  "role": "MEMBER"
}
```
- **Response Shape (201 Created)**:
```json
{
  "invitationId": "inv_7d9b2a1e-84fc-4876-b605-6c7c25c345a1",
  "email": "teammate@example.com",
  "role": "MEMBER",
  "status": "PENDING",
  "expiresAt": "2026-09-30T10:00:00Z"
}
```

---

## 4. Projects & Environments

### 4.1 List Projects
- **Method**: `GET`
- **Path**: `/api/v1/organizations/:orgId/projects`
- **Purpose**: Retrieve all projects under an organization.
- **Auth**: User Session
- **Response Shape (200 OK)**:
```json
{
  "projects": [
    {
      "id": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
      "name": "E-Commerce Webapp",
      "slug": "ecommerce-webapp",
      "repositoryUrl": "https://github.com/acme/store",
      "defaultBranch": "main",
      "createdAt": "2026-09-02T14:22:00Z",
      "stats": {
        "totalRuns": 142,
        "passingRate": 98.6
      }
    }
  ]
}
```

### 4.2 Create Project
- **Method**: `POST`
- **Path**: `/api/v1/organizations/:orgId/projects`
- **Purpose**: Initialize a new project with default settings.
- **Auth**: User Session (Owner or Admin)
- **Request Shape**:
```json
{
  "name": "E-Commerce Webapp",
  "slug": "ecommerce-webapp",
  "repositoryUrl": "https://github.com/acme/store",
  "defaultBranch": "main"
}
```
- **Response Shape (201 Created)**:
```json
{
  "project": {
    "id": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
    "name": "E-Commerce Webapp",
    "slug": "ecommerce-webapp",
    "repositoryUrl": "https://github.com/acme/store",
    "defaultBranch": "main",
    "createdAt": "2026-09-23T12:00:00Z"
  }
}
```

### 4.3 Manage Project Secrets / Environment Variables
- **Method**: `POST`
- **Path**: `/api/v1/projects/:projectId/variables`
- **Purpose**: Store or update encrypted project environment variables.
- **Auth**: User Session (Owner or Admin)
- **Request Shape**:
```json
{
  "key": "STAGING_API_TOKEN",
  "value": "secret_abc123_xyz",
  "environment": "staging",
  "isSecret": true
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "key": "STAGING_API_TOKEN",
  "environment": "staging",
  "isSecret": true,
  "updatedAt": "2026-09-23T12:05:00Z"
}
```

---

## 5. Test Suites & Tests

### 5.1 List Test Suites
- **Method**: `GET`
- **Path**: `/api/v1/projects/:projectId/suites`
- **Purpose**: Fetch all test suites configured for a project.
- **Auth**: User Session or Project API Key
- **Response Shape (200 OK)**:
```json
{
  "suites": [
    {
      "id": "ste_4a7d6e81-9f20-410a-8bf8-d32849b21fa7",
      "name": "Checkout Workflow",
      "description": "Critical path checkout and payment gateway tests",
      "testCount": 6,
      "tags": ["smoke", "critical", "checkout"]
    }
  ]
}
```

### 5.2 Create Test Suite
- **Method**: `POST`
- **Path**: `/api/v1/projects/:projectId/suites`
- **Purpose**: Create a new test suite grouping related tests.
- **Auth**: User Session or Project API Key
- **Request Shape**:
```json
{
  "name": "Checkout Workflow",
  "description": "Critical path checkout and payment gateway tests",
  "tags": ["smoke", "critical"]
}
```
- **Response Shape (201 Created)**:
```json
{
  "suite": {
    "id": "ste_4a7d6e81-9f20-410a-8bf8-d32849b21fa7",
    "name": "Checkout Workflow",
    "description": "Critical path checkout and payment gateway tests",
    "tags": ["smoke", "critical"],
    "createdAt": "2026-09-23T12:10:00Z"
  }
}
```

### 5.3 Define Test (Browser UI or API)
- **Method**: `POST`
- **Path**: `/api/v1/suites/:suiteId/tests`
- **Purpose**: Add an individual test definition (UI workflow or REST API assertion test) to a suite.
- **Auth**: User Session or Project API Key
- **Request Shape (Browser Test)**:
```json
{
  "title": "Guest User Can Add Item to Cart and Pay via Stripe",
  "type": "UI",
  "config": {
    "browser": "chromium",
    "viewport": { "width": 1280, "height": 720 },
    "steps": [
      { "action": "goto", "target": "https://staging.acme.shop/products" },
      { "action": "click", "target": "[data-testid='add-to-cart']" },
      { "action": "assert_text", "target": ".cart-badge", "value": "1" }
    ]
  },
  "timeoutSeconds": 60
}
```
- **Request Shape (API Test)**:
```json
{
  "title": "Users Service Health & Auth Validation",
  "type": "API",
  "config": {
    "method": "GET",
    "url": "https://api.example.com/v1/users",
    "params": [{ "key": "limit", "value": "10", "enabled": true }],
    "headers": [{ "key": "Accept", "value": "application/json", "enabled": true }],
    "bodyType": "none",
    "auth": { "type": "bearer", "bearerToken": "omt_staging_sec_token" },
    "assertions": [
      { "id": "a1", "type": "status_equals", "expected": "200" },
      { "id": "a2", "type": "response_time_lt", "expected": "1000" },
      { "id": "a3", "type": "header_exists", "property": "content-type" },
      { "id": "a4", "type": "json_property_exists", "property": "users.0.id" }
    ],
    "timeoutMs": 10000
  },
  "timeoutSeconds": 30
}
```
- **Request Shape (Accessibility Test)**:
```json
{
  "title": "Homepage WCAG 2.1 AA Compliance Audit",
  "type": "ACCESSIBILITY",
  "config": {
    "version": "1.0",
    "url": "https://staging.acme.shop",
    "scope": "page",
    "standards": ["wcag2a", "wcag2aa", "best-practice"],
    "timeoutSeconds": 30
  },
  "timeoutSeconds": 30
}
```
- **Request Shape (Performance Test)**:
```json
{
  "title": "Homepage Core Web Vitals & Load Audit",
  "type": "PERFORMANCE",
  "config": {
    "version": "1.0",
    "url": "https://staging.acme.shop",
    "device": "desktop",
    "warmupRuns": 0,
    "measurementRuns": 1,
    "thresholds": [
      { "metric": "lcp", "operator": "lt", "targetValue": 2500, "unit": "ms" },
      { "metric": "cls", "operator": "lt", "targetValue": 0.1, "unit": "score" },
      { "metric": "failedRequests", "operator": "eq", "targetValue": 0, "unit": "count" }
    ],
    "timeoutSeconds": 30
  },
  "timeoutSeconds": 30
}
```
- **Request Shape (SEO Test)**:
```json
{
  "title": "Homepage Technical SEO Audit",
  "type": "SEO",
  "config": {
    "version": "1.0",
    "url": "https://staging.acme.shop",
    "timeoutSeconds": 30,
    "checks": {
      "technical": true,
      "metadata": true,
      "indexability": true,
      "headings": true,
      "images": true,
      "links": true,
      "social": true,
      "structuredData": true,
      "robotsTxt": true,
      "sitemap": true,
      "mobile": true
    },
    "assertions": {
      "titleRequired": true,
      "metaDescriptionRequired": true,
      "canonicalRequired": true,
      "h1Required": true,
      "noindexDisallowed": false,
      "expectedStatusCode": 200,
      "structuredDataRequired": false,
      "noBrokenLinks": false
    }
  },
  "timeoutSeconds": 30
}
```
- **Response Shape (201 Created)**:
```json
{
  "test": {
    "id": "tst_1e2d3c4b-5a6f-7e8d-9c0b-1a2b3c4d5e6f",
    "suiteId": "ste_4a7d6e81-9f20-410a-8bf8-d32849b21fa7",
    "title": "Homepage Core Web Vitals & Load Audit",
    "type": "PERFORMANCE",
    "timeoutSeconds": 30,
    "createdAt": "2026-09-23T12:12:00Z"
  }
}
```

---

## 6. Test Runs & Executions

### 6.1 Trigger Test Run
- **Method**: `POST`
- **Path**: `/api/v1/runs`
- **Purpose**: Queue a new test run for a project or suite.
- **Auth**: User Session or Project API Key
- **Request Shape**:
```json
{
  "projectId": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
  "suiteId": "ste_4a7d6e81-9f20-410a-8bf8-d32849b21fa7",
  "trigger": "MANUAL",
  "environment": "staging",
  "targetUrl": "https://staging.acme.shop",
  "git": {
    "commitHash": "9b12a8ff912c",
    "branch": "feature/quick-buy",
    "commitMessage": "Add 1-click checkout button"
  },
  "options": {
    "retries": 1,
    "parallelism": 2,
    "browsers": ["chromium", "firefox"]
  }
}
```
- **Response Shape (202 Accepted)**:
```json
{
  "runId": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "status": "QUEUED",
  "queuePosition": 1,
  "createdAt": "2026-09-23T12:15:00Z",
  "dashboardUrl": "https://app.omnitest.dev/runs/run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c"
}
```

### 6.2 Get Run Details
- **Method**: `GET`
- **Path**: `/api/v1/runs/:runId`
- **Purpose**: Fetch status, summary counters, and execution metadata for a run.
- **Auth**: User Session or Project API Key
- **Response Shape (200 OK)**:
```json
{
  "id": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "projectId": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
  "status": "PASSED",
  "trigger": "MANUAL",
  "environment": "staging",
  "totalTests": 6,
  "passedCount": 6,
  "failedCount": 0,
  "skippedCount": 0,
  "durationMs": 14250,
  "startedAt": "2026-09-23T12:15:02Z",
  "completedAt": "2026-09-23T12:15:16Z"
}
```

### 6.3 Real-Time Run Event Stream
- **Method**: `GET`
- **Path**: `/api/v1/runs/:runId/stream`
- **Purpose**: Server-Sent Events (SSE) stream emitting step-by-step progress and logs.
- **Auth**: User Session or Project API Key
- **Response Format**: `text/event-stream`
- **Payload Example**:
```
event: step_started
data: {"testId":"tst_1e2d","stepIndex":1,"action":"navigate","url":"/products"}

event: step_completed
data: {"testId":"tst_1e2d","stepIndex":1,"status":"passed","durationMs":340}

event: run_finished
data: {"status":"PASSED","durationMs":14250}
```

### 6.4 Cancel Run
- **Method**: `POST`
- **Path**: `/api/v1/runs/:runId/cancel`
- **Purpose**: Abort an in-flight or queued test run.
- **Auth**: User Session or Project API Key
- **Response Shape (200 OK)**:
```json
{
  "runId": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "status": "CANCELLED"
}
```

### 6.5 Batch Execute Project Tests (CLI & CI Orchestration)
- **Method**: `POST`
- **Path**: `/api/projects/:projectId/run`
- **Purpose**: Batch triggers tests in a project with optional filters (`testIds`, `type`, `visual`) and targetUrl override for CLI and CI workflows.
- **Auth**: User Session or `Authorization: Bearer <token>`
- **Request Shape**:
```json
{
  "testIds": ["tst_1e2d3c4b-5a6f-7e8d-9c0b-1a2b3c4d5e6f"],
  "type": "UI",
  "visual": false,
  "environment": "staging",
  "targetUrl": "https://staging.acme.shop"
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "runId": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "projectId": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
  "status": "PASSED",
  "totalTests": 1,
  "passedTests": 1,
  "failedTests": 0,
  "durationMs": 420,
  "results": [
    {
      "id": "res_01",
      "runId": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "testId": "tst_1e2d3c4b-5a6f-7e8d-9c0b-1a2b3c4d5e6f",
      "testTitle": "Guest User Can Add Item to Cart",
      "testType": "UI",
      "status": "PASSED",
      "durationMs": 420,
      "errorMessage": null,
      "artifacts": []
    }
  ]
}
```

---

## 7. Test Results & Artifacts

### 7.1 List Test Results for a Run
- **Method**: `GET`
- **Path**: `/api/v1/runs/:runId/results`
- **Purpose**: Get granular assertion results, timings, and error traces for each test in a run.
- **Auth**: User Session or Project API Key
- **Response Shape (200 OK)**:
```json
{
  "results": [
    {
      "id": "res_01",
      "testId": "tst_1e2d3c4b",
      "testTitle": "Guest User Can Add Item to Cart and Pay via Stripe",
      "status": "PASSED",
      "durationMs": 4120,
      "browser": "chromium",
      "error": null,
      "artifacts": [
        {
          "id": "art_01",
          "type": "VIDEO",
          "fileName": "run-video.webm",
          "sizeBytes": 1420500
        },
        {
          "id": "art_02",
          "type": "PLAYWRIGHT_TRACE",
          "fileName": "trace.zip",
          "sizeBytes": 850200
        }
      ]
    }
  ]
}
```

### 7.2 Get Presigned Download URL for an Artifact
- **Method**: `GET`
- **Path**: `/api/v1/artifacts/:artifactId/download-url`
- **Purpose**: Generate short-lived signed S3 URL to stream video or download trace zip.
- **Auth**: User Session or Project API Key
- **Response Shape (200 OK)**:
```json
{
  "artifactId": "art_01",
  "url": "https://omnitest-artifacts.s3.us-east-1.amazonaws.com/runs/run_01/video.webm?X-Amz-Signature=...",
  "expiresInSeconds": 900
}
```

### 7.3 Get Unified Run Quality Report
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/:runId/report`
- **Purpose**: Retrieve a comprehensive unified quality report aggregating all 5 testing engines (UI, API, Accessibility, Performance, SEO) with summary pass rates, engine breakdown, and failure diagnostics.
- **Auth**: User Session (Project / Organization Member)
- **Response Shape (200 OK)**:
```json
{
  "report": {
    "id": "rep_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "testRunId": "01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "project": {
      "id": "prj_e91c7849-cfa2-4752-944a-1e7a469bbdf2",
      "name": "Acme Web Platform",
      "slug": "acme-web",
      "baseUrl": "https://staging.acme.shop"
    },
    "suite": {
      "id": "ste_4a7d6e81-9f20-410a-8bf8-d32849b21fa7",
      "name": "Full Regression Suite"
    },
    "status": "PASSED",
    "trigger": "MANUAL",
    "environment": "staging",
    "targetUrl": "https://staging.acme.shop",
    "gitCommitHash": "9b12a8ff912c",
    "gitBranch": "main",
    "summary": {
      "totalTests": 5,
      "passedTests": 5,
      "failedTests": 0,
      "errorTests": 0,
      "skippedTests": 0,
      "passRate": 100.0,
      "durationMs": 4250,
      "formattedDuration": "4.3s",
      "startedAt": "2026-09-23T12:15:02Z",
      "completedAt": "2026-09-23T12:15:06Z",
      "isRunning": false,
      "generatedAt": "2026-09-23T12:15:07Z"
    },
    "breakdown": [
      { "type": "UI", "label": "Browser / UI", "total": 1, "passed": 1, "failed": 0, "errors": 0, "skipped": 0, "passRate": 100.0 },
      { "type": "API", "label": "API / Integration", "total": 1, "passed": 1, "failed": 0, "errors": 0, "skipped": 0, "passRate": 100.0 },
      { "type": "ACCESSIBILITY", "label": "Accessibility (a11y)", "total": 1, "passed": 1, "failed": 0, "errors": 0, "skipped": 0, "passRate": 100.0 },
      { "type": "PERFORMANCE", "label": "Performance & Vitals", "total": 1, "passed": 1, "failed": 0, "errors": 0, "skipped": 0, "passRate": 100.0 },
      { "type": "SEO", "label": "Technical SEO", "total": 1, "passed": 1, "failed": 0, "errors": 0, "skipped": 0, "passRate": 100.0 }
    ],
    "failures": [],
    "errors": [],
    "items": []
  }
}
```

### 7.4 Export Run Quality Report (JSON Download)
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/:runId/report?export=json`
- **Purpose**: Download standardized, sanitized `RunReport` JSON file with credential masking and attachment content disposition headers.
- **Auth**: User Session (Project / Organization Member)
- **Headers Returned**:
  - `Content-Type: application/json; charset=utf-8`
  - `Content-Disposition: attachment; filename="omnitest-report-[runId].json"`

### 7.5 List Artifacts for Test Result
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/:runId/results/:resultId/artifacts`
- **Purpose**: List all captured physical artifacts (screenshots, traces, video) and synthesized runtime diagnostics (console logs, network failures, API payloads, Web Vitals, A11y violations, SEO findings).
- **Auth**: User Session (Project / Organization Member)
- **Response Shape (200 OK)**:
```json
{
  "project": { "id": "prj_e91c7849", "name": "Acme Web", "slug": "acme-web" },
  "testRun": { "id": "run_01a2b3c4", "status": "FAILED", "trigger": "MANUAL", "environment": "staging", "createdAt": "2026-09-24T12:00:00Z" },
  "testResult": { "id": "res_9b1deb4d", "testId": "tst_1e2d", "testTitle": "Checkout Modal Flow", "testType": "UI", "status": "FAILED", "durationMs": 1420, "errorMessage": "Selector timed out", "createdAt": "2026-09-24T12:00:02Z" },
  "artifacts": [
    {
      "id": "art_01",
      "testRunId": "run_01a2b3c4",
      "testResultId": "res_9b1deb4d",
      "type": "SCREENSHOT",
      "fileName": "checkout_failure.png",
      "contentType": "image/png",
      "sizeBytes": 154200,
      "formattedSize": "150.6 KB",
      "url": "/artifacts/runs/run_01a2b3c4/checkout_failure.png",
      "downloadUrl": "/api/projects/prj_e91c7849/runs/run_01a2b3c4/results/res_9b1deb4d/artifacts/art_01/content?download=true",
      "createdAt": "2026-09-24T12:00:02Z",
      "isVirtual": false,
      "metadata": { "engine": "UI" }
    }
  ]
}
```

### 7.6 Retrieve or Download Artifact Content
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/:runId/results/:resultId/artifacts/:artifactId/content`
- **Query Params**:
  - `download=true` (optional): Forces download with `Content-Disposition: attachment; filename="[fileName]"`
- **Purpose**: Stream binary media (images, traces, video) or return sanitized, masked text/JSON evidence.
- **Auth**: User Session (Project / Organization Member)
- **Response Format**: Binary stream (`image/png`, `application/zip`, `video/webm`) or UTF-8 text (`application/json`, `text/plain`).

### 7.7 Visual Regression Baseline Management
- **Paths**:
  - `GET /api/projects/:projectId/tests/:testId/visual-regression/baseline`
  - `POST /api/projects/:projectId/tests/:testId/visual-regression/baseline`
  - `DELETE /api/projects/:projectId/tests/:testId/visual-regression/baseline`
- **Purpose**: Retrieve, update (from candidate artifact or buffer), or delete the active visual baseline image for a test.
- **Auth**: User Session (Project / Organization Member)
- **POST Request Shape**:
```json
{
  "artifactId": "art_visual_current_uuid",
  "runId": "run_01a2b3c4",
  "resultId": "res_9b1deb4d"
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "message": "Baseline updated successfully.",
  "baseline": {
    "testId": "tst_1e2d3c4b",
    "exists": true,
    "url": "/artifacts/baselines/tst_1e2d3c4b/baseline.png",
    "width": 1280,
    "height": 720,
    "sizeBytes": 85420,
    "updatedAt": "2026-09-24T12:00:00.000Z",
    "updatedBy": "lead@example.com"
  }
}
```

### 7.8 Visual Comparison Details
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/:runId/results/:resultId/visual-comparison`
- **Purpose**: Fetch detailed pixel diff metrics, baseline, current, and diff artifact URLs for a test result.
- **Auth**: User Session (Project / Organization Member)
- **Response Shape (200 OK)**:
```json
{
  "projectId": "prj_e91c7849",
  "runId": "run_01a2b3c4",
  "resultId": "res_9b1deb4d",
  "testId": "tst_1e2d3c4b",
  "testTitle": "Landing Page Visual Consistency",
  "status": "FAILED",
  "visualComparison": {
    "status": "FAILED",
    "metrics": {
      "totalPixels": 921600,
      "changedPixels": 2450,
      "differencePercentage": 0.2658,
      "thresholdPercentage": 0.1,
      "passed": false,
      "baselineWidth": 1280,
      "baselineHeight": 720,
      "currentWidth": 1280,
      "currentHeight": 720
    },
    "currentUrl": "/artifacts/runs/run_01a2b3c4/visual_current.png",
    "diffUrl": "/artifacts/runs/run_01a2b3c4/visual_diff.png",
    "baselineUrl": "/artifacts/baselines/tst_1e2d3c4b/baseline.png",
    "currentArtifactId": "art_curr_01",
    "diffArtifactId": "art_diff_01",
    "errorMessage": "Visual regression difference of 0.2658% exceeded threshold of 0.1%.",
    "viewport": { "width": 1280, "height": 720 },
    "screenshotMode": "viewport"
  },
  "baseline": {
    "exists": true,
    "width": 1280,
    "height": 720,
    "url": "/artifacts/baselines/tst_1e2d3c4b/baseline.png"
  },
  "artifacts": [ ... ]
}
```

---

## 8. Webhook Ingestion

### 8.1 GitHub App Webhook Ingestion
- **Method**: `POST`
- **Path**: `/api/v1/webhooks/github`
- **Purpose**: Handle GitHub `pull_request`, `push`, and `check_run` events.
- **Auth**: Webhook HMAC Header `X-Hub-Signature-256`
- **Response Shape (200 OK)**:
```json
{
  "received": true,
  "action": "queued_test_run",
  "runId": "run_01a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c"
}
```

### 8.2 Stripe Webhook Ingestion
- **Method**: `POST`
- **Path**: `/api/v1/webhooks/stripe`
- **Purpose**: Handle subscription updates, invoices, and quota adjustments.
- **Auth**: Webhook Header `Stripe-Signature`
- **Response Shape (200 OK)**:
```json
{
  "received": true
}
```

---

## 9. Subscriptions & Usage

### 9.1 Get Organization Usage
- **Method**: `GET`
- **Path**: `/api/v1/organizations/:orgId/usage`
- **Purpose**: Get current billing cycle usage metrics (test minutes, active concurrent slots).
- **Auth**: User Session (Owner or Admin)
- **Response Shape (200 OK)**:
```json
{
  "cycleStart": "2026-09-01T00:00:00Z",
  "cycleEnd": "2026-10-01T00:00:00Z",
  "plan": "PRO",
  "metrics": {
    "testMinutesUsed": 412,
    "testMinutesQuota": 2500,
    "concurrencyLimit": 5,
    "concurrencyPeak": 4
  }
}
```

---

## 10. Test History & Run Comparison

### 10.1 Query Project Test History
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/history`
- **Purpose**: Query paginated, filterable test execution history across a project.
- **Auth**: User Session (Organization Member)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `pageSize`: Items per page (default: 20, max: 100)
  - `status`: Filter by status (`ALL`, `PASSED`, `FAILED`, `TIMED_OUT`)
  - `testType`: Filter by engine type (`ALL`, `UI`, `API`, `ACCESSIBILITY`, `PERFORMANCE`, `SEO`)
  - `dateRange`: Date range preset (`all`, `today`, `7d`, `30d`, `custom`)
  - `startDate`, `endDate`: Custom ISO date boundaries
  - `search`: Substring search in test title, commit hash, branch, or target URL
  - `sortBy`: Sort property (`createdAt`, `durationMs`, `status`)
  - `sortOrder`: `asc` or `desc`
- **Response Shape (200 OK)**:
```json
{
  "items": [
    {
      "id": "res_12345",
      "runId": "run_67890",
      "testId": "tst_abcde",
      "testTitle": "Checkout Flow",
      "testType": "UI",
      "status": "PASSED",
      "durationMs": 420,
      "createdAt": "2026-09-24T18:00:00.000Z",
      "hasArtifacts": true,
      "artifactCount": 2,
      "artifacts": [
        {
          "id": "art_1",
          "type": "SCREENSHOT",
          "fileName": "checkout_step1.png",
          "url": "/artifacts/runs/run_67890/checkout_step1.png"
        }
      ],
      "visualRegression": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 120,
    "totalPages": 6
  },
  "summary": {
    "totalExecutions": 120,
    "passedExecutions": 108,
    "failedExecutions": 10,
    "timedOutExecutions": 2,
    "passRate": 90,
    "avgDurationMs": 480,
    "minDurationMs": 120,
    "maxDurationMs": 1800
  },
  "trends": {
    "passFailTrend": ["PASSED", "PASSED", "FAILED"],
    "durationTrend": [
      {
        "runId": "run_67890",
        "resultId": "res_12345",
        "date": "2026-09-24T18:00:00.000Z",
        "durationMs": 420,
        "status": "PASSED"
      }
    ],
    "consecutiveFailures": 0,
    "isSlower": false,
    "durationChangePct": -5,
    "flakinessScore": 12
  }
}
```

### 10.2 Query Test-Specific History & Stability
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/tests/:testId/history`
- **Purpose**: Retrieve historical executions and stability metrics for a single automated test.
- **Auth**: User Session (Organization Member)
- **Response Shape (200 OK)**:
```json
{
  "test": {
    "id": "tst_abcde",
    "title": "Checkout Flow",
    "type": "UI"
  },
  "items": [...],
  "pagination": {...},
  "summary": {...},
  "trends": {...}
}
```

### 10.3 Compare Two Historical Test Runs
- **Method**: `GET`
- **Path**: `/api/projects/:projectId/runs/compare?baseRunId=:baseRunId&targetRunId=:targetRunId`
- **Purpose**: Compare two test runs in detail to identify regressions, resolved fixes, duration variance, and visual metric shifts.
- **Auth**: User Session (Organization Member)
- **Response Shape (200 OK)**:
```json
{
  "baseRun": {
    "id": "run_111",
    "status": "PASSED",
    "durationMs": 950,
    "totalTests": 3,
    "passedTests": 3,
    "failedTests": 0,
    "createdAt": "2026-09-22T10:00:00.000Z"
  },
  "targetRun": {
    "id": "run_222",
    "status": "FAILED",
    "durationMs": 2800,
    "totalTests": 4,
    "passedTests": 2,
    "failedTests": 2,
    "createdAt": "2026-09-24T10:00:00.000Z"
  },
  "durationDeltaMs": 1850,
  "durationDeltaPct": 195,
  "statusChanged": true,
  "regressions": [
    {
      "testId": "tst_visual",
      "title": "Hero Banner Visual Consistency",
      "type": "UI",
      "baseStatus": "PASSED",
      "targetStatus": "FAILED",
      "baseDurationMs": 500,
      "targetDurationMs": 620,
      "errorSummary": "Visual regression diff exceeded threshold: 2.45% > 0.10%"
    }
  ],
  "fixes": [],
  "unchanged": [],
  "visualDiffs": [
    {
      "testId": "tst_visual",
      "title": "Hero Banner Visual Consistency",
      "baseDiffPct": 0.0,
      "targetDiffPct": 2.45,
      "baseStatus": "PASSED",
      "targetStatus": "FAILED"
    }
  ],
  "summary": {
    "totalCompared": 3,
    "regressionsCount": 1,
    "fixesCount": 0,
    "unchangedCount": 2,
    "speedupPct": -195
  }
}
```
