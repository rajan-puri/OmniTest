import { db } from "../apps/web/src/lib/db";
import { generateRunReport, formatDuration, maskSensitiveHeaders } from "../apps/web/src/lib/reports/report-generator";
import { RunReport, TestEngineType } from "../apps/web/src/lib/reports/report-types";

async function verifyPhase6A() {
  console.log("=== OmniTest Phase 6A: Unified Reporting System Acceptance Verification ===\n");

  // ==========================================
  // Test 1: Pure Engine Unit Tests & Helpers
  // ==========================================
  console.log("1. Testing Formatting and Sensitive Data Masking Helpers...");

  // 1a. Duration formatting
  if (formatDuration(0) !== "0ms") throw new Error(`formatDuration(0) failed: ${formatDuration(0)}`);
  if (formatDuration(450) !== "450ms") throw new Error(`formatDuration(450) failed: ${formatDuration(450)}`);
  if (formatDuration(1500) !== "1.5s") throw new Error(`formatDuration(1500) failed: ${formatDuration(1500)}`);
  if (formatDuration(65400) !== "1m 5s") throw new Error(`formatDuration(65400) failed: ${formatDuration(65400)}`);
  console.log("   ✓ formatDuration correctly formats millisecond values");

  // 1b. Header masking
  const testHeaders = {
    "content-type": "application/json",
    authorization: "Bearer super-secret-jwt-token-12345",
    "x-api-key": "secret-api-key-999",
    cookie: "session_id=abcdef123456",
    "user-agent": "OmniTest-Runner/1.0",
  };
  const maskedHeaders = maskSensitiveHeaders(testHeaders);
  if (!maskedHeaders.authorization.includes("...") || maskedHeaders.authorization.includes("jwt-token")) {
    throw new Error(`authorization header was not masked: ${maskedHeaders.authorization}`);
  }
  if (maskedHeaders["x-api-key"] !== "************") {
    throw new Error(`x-api-key was not masked: ${maskedHeaders["x-api-key"]}`);
  }
  if (maskedHeaders.cookie !== "************") {
    throw new Error(`cookie was not masked: ${maskedHeaders.cookie}`);
  }
  if (maskedHeaders["content-type"] !== "application/json") {
    throw new Error(`benign header was altered: ${maskedHeaders["content-type"]}`);
  }
  console.log("   ✓ maskSensitiveHeaders scrubs authorization, cookies, and api keys");

  // ==========================================
  // Test 2: In-Memory Multi-Engine Aggregation
  // ==========================================
  console.log("\n2. Testing Multi-Engine Report Aggregation (All 5 Testing Engines)...");

  const mockMockRun: any = {
    id: "run-multi-engine-001",
    projectId: "proj-123",
    project: {
      id: "proj-123",
      name: "Acme Web Platform",
      slug: "acme-web",
      baseUrl: "https://acme.example.com",
    },
    suite: {
      id: "suite-core",
      name: "Full Regression Suite",
    },
    status: "FAILED",
    trigger: "MANUAL",
    environment: "staging",
    targetUrl: "https://staging.acme.example.com",
    gitCommitHash: "abc1234",
    gitBranch: "main",
    durationMs: 8450,
    startedAt: new Date("2026-09-23T10:00:00Z"),
    completedAt: new Date("2026-09-23T10:00:08.450Z"),
    testResults: [
      // UI Test (Passed)
      {
        id: "res-ui-1",
        testId: "test-ui-1",
        testTitle: "User Login Journey",
        testType: "UI",
        status: "PASSED",
        durationMs: 2300,
        errorMessage: null,
        metrics: JSON.stringify({
          stepsTotal: 4,
          stepsPassed: 4,
          stepsFailed: 0,
        }),
        artifacts: [{ id: "art-1", type: "SCREENSHOT", fileName: "login.png" }],
        createdAt: new Date("2026-09-23T10:00:02Z"),
      },
      // UI Test (Failed)
      {
        id: "res-ui-2",
        testId: "test-ui-2",
        testTitle: "Checkout Modal Flow",
        testType: "UI",
        status: "FAILED",
        durationMs: 1450,
        errorMessage: "Step 3 (click) failed: Selector '#checkout-btn' timed out after 5000ms",
        metrics: JSON.stringify({
          stepsTotal: 3,
          stepsPassed: 2,
          stepsFailed: 1,
        }),
        artifacts: [{ id: "art-2", type: "SCREENSHOT", fileName: "checkout-fail.png" }],
        createdAt: new Date("2026-09-23T10:00:03Z"),
      },
      // API Test (Passed)
      {
        id: "res-api-1",
        testId: "test-api-1",
        testTitle: "GET /api/v1/users",
        testType: "API",
        status: "PASSED",
        durationMs: 180,
        errorMessage: null,
        metrics: JSON.stringify({
          httpStatus: 200,
          assertionsTotal: 3,
          assertionsPassed: 3,
          assertionsFailed: 0,
          requestHeaders: { authorization: "Bearer secret-token-xyz" },
        }),
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:04Z"),
      },
      // API Test (Failed)
      {
        id: "res-api-2",
        testId: "test-api-2",
        testTitle: "POST /api/v1/auth/login",
        testType: "API",
        status: "FAILED",
        durationMs: 95,
        errorMessage: "Assertion failed: status expected 200 but received 401",
        metrics: JSON.stringify({
          httpStatus: 401,
          assertionsTotal: 2,
          assertionsPassed: 1,
          assertionsFailed: 1,
        }),
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:04Z"),
      },
      // Accessibility Test (Passed)
      {
        id: "res-a11y-1",
        testId: "test-a11y-1",
        testTitle: "Pricing Page Accessibility Standards",
        testType: "ACCESSIBILITY",
        status: "PASSED",
        durationMs: 820,
        errorMessage: null,
        metrics: JSON.stringify({
          violationsCount: 0,
          passesCount: 28,
        }),
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:05Z"),
      },
      // Performance Test (Failed)
      {
        id: "res-perf-1",
        testId: "test-perf-1",
        testTitle: "Storefront LCP & Core Web Vitals",
        testType: "PERFORMANCE",
        status: "FAILED",
        durationMs: 1540,
        errorMessage: "Threshold violated: lcp expected <= 2500ms but received 3420ms",
        metrics: JSON.stringify({
          lcpMs: 3420,
          cls: 0.04,
          fidMs: 15,
          score: 68,
        }),
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:06Z"),
      },
      // SEO Test (Passed)
      {
        id: "res-seo-1",
        testId: "test-seo-1",
        testTitle: "Homepage Technical SEO & OpenGraph",
        testType: "SEO",
        status: "PASSED",
        durationMs: 760,
        errorMessage: null,
        metrics: JSON.stringify({
          title: "Acme Web Platform — Modern Solutions",
          canonical: "https://acme.example.com/",
          ogTitle: "Acme Web Platform",
          score: 95,
        }),
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:07Z"),
      },
      // System Error / Timeout test
      {
        id: "res-sys-err",
        testId: "test-ui-crash",
        testTitle: "Background Worker Sync",
        testType: "UI",
        status: "TIMED_OUT",
        durationMs: 30000,
        errorMessage: "Execution timed out after 30000ms: browser page disconnected",
        metrics: null,
        artifacts: [],
        createdAt: new Date("2026-09-23T10:00:08Z"),
      },
    ],
  };

  const report = generateRunReport(mockMockRun);

  // Assert Report Identification
  if (report.testRunId !== "run-multi-engine-001") throw new Error("testRunId mismatch");
  if (report.project.name !== "Acme Web Platform") throw new Error("project name mismatch");
  if (report.suite?.name !== "Full Regression Suite") throw new Error("suite name mismatch");

  // Assert Report Summary
  // Total tests = 8: passed = 4, failed = 3, errors = 1, skipped = 0
  console.log(`   Summary Counts: Total=${report.summary.totalTests}, Passed=${report.summary.passedTests}, Failed=${report.summary.failedTests}, Errors=${report.summary.errorTests}`);
  if (report.summary.totalTests !== 8) throw new Error(`Expected 8 total tests, got ${report.summary.totalTests}`);
  if (report.summary.passedTests !== 4) throw new Error(`Expected 4 passed tests, got ${report.summary.passedTests}`);
  if (report.summary.failedTests !== 3) throw new Error(`Expected 3 failed tests, got ${report.summary.failedTests}`);
  if (report.summary.errorTests !== 1) throw new Error(`Expected 1 error test, got ${report.summary.errorTests}`);

  // Deterministic Pass Rate: 4 passed / (4 passed + 3 failed + 1 error) = 4 / 8 = 50.0%
  console.log(`   Pass Rate: ${report.summary.passRate}%`);
  if (report.summary.passRate !== 50.0) throw new Error(`Expected 50.0% pass rate, got ${report.summary.passRate}`);

  // Engine Breakdown Assertions
  const uiBreakdown = report.breakdown.find((b) => b.type === "UI");
  const apiBreakdown = report.breakdown.find((b) => b.type === "API");
  const a11yBreakdown = report.breakdown.find((b) => b.type === "ACCESSIBILITY");
  const perfBreakdown = report.breakdown.find((b) => b.type === "PERFORMANCE");
  const seoBreakdown = report.breakdown.find((b) => b.type === "SEO");

  if (!uiBreakdown || uiBreakdown.total !== 3 || uiBreakdown.passed !== 1 || uiBreakdown.failed !== 1 || uiBreakdown.errors !== 1) {
    throw new Error(`UI breakdown incorrect: ${JSON.stringify(uiBreakdown)}`);
  }
  if (!apiBreakdown || apiBreakdown.total !== 2 || apiBreakdown.passed !== 1 || apiBreakdown.failed !== 1) {
    throw new Error(`API breakdown incorrect: ${JSON.stringify(apiBreakdown)}`);
  }
  if (!a11yBreakdown || a11yBreakdown.total !== 1 || a11yBreakdown.passed !== 1) {
    throw new Error(`A11y breakdown incorrect: ${JSON.stringify(a11yBreakdown)}`);
  }
  if (!perfBreakdown || perfBreakdown.total !== 1 || perfBreakdown.failed !== 1) {
    throw new Error(`Performance breakdown incorrect: ${JSON.stringify(perfBreakdown)}`);
  }
  if (!seoBreakdown || seoBreakdown.total !== 1 || seoBreakdown.passed !== 1) {
    throw new Error(`SEO breakdown incorrect: ${JSON.stringify(seoBreakdown)}`);
  }
  console.log("   ✓ All 5 testing engine breakdown buckets correctly aggregated");

  // Failure & Error extraction assertions
  if (report.failures.length !== 3) {
    throw new Error(`Expected 3 assertion failures, got ${report.failures.length}`);
  }
  if (report.errors.length !== 1) {
    throw new Error(`Expected 1 timeout/system error, got ${report.errors.length}`);
  }
  if (!report.errors[0].failureReason.includes("timed out")) {
    throw new Error(`Expected timeout error reason, got: ${report.errors[0].failureReason}`);
  }

  const apiItem = report.items.find((i) => i.id === "res-api-1");
  if (!apiItem?.metrics?.requestHeaders?.authorization?.includes("...") || apiItem?.metrics?.requestHeaders?.authorization?.includes("secret-token")) {
    throw new Error(`Authorization header was not scrubbed in report items: ${JSON.stringify(apiItem?.metrics)}`);
  }
  console.log("   ✓ Sensitive request headers scrubbed in report item metrics");

  // ==========================================
  // Test 3: Database & Multi-Model Integration
  // ==========================================
  console.log("\n3. Testing Database Run Persistence & Live Report Generation...");

  // Find or create test organization and project
  let user = await db.user.findFirst({
    include: { memberships: { include: { organization: true } } },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: "reports-qa@omnitest.dev",
        name: "OmniTest QA Lead",
      },
      include: { memberships: { include: { organization: true } } },
    });
  }

  let org = user.memberships[0]?.organization;
  if (!org) {
    org = await db.organization.create({
      data: {
        name: "OmniTest QA Lab",
        slug: "omnitest-qa-lab",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
  }

  // Create an active project
  const project = await db.project.create({
    data: {
      name: "Phase 6A Report Test Project",
      slug: `report-test-${Date.now()}`,
      organizationId: org.id,
      baseUrl: "https://example.com",
    },
  });

  // Create test run with diverse results in DB
  const testRun = await db.testRun.create({
    data: {
      projectId: project.id,
      status: "FAILED",
      trigger: "TEST_SUITE",
      environment: "production",
      targetUrl: "https://example.com",
      durationMs: 4200,
      startedAt: new Date(Date.now() - 4200),
      completedAt: new Date(),
    },
  });

  // Create 3 TestResult records in DB
  await db.testResult.create({
    data: {
      testRunId: testRun.id,
      testTitle: "API Status Check",
      testType: "API",
      status: "PASSED",
      durationMs: 140,
      metrics: JSON.stringify({ httpStatus: 200 }),
    },
  });

  await db.testResult.create({
    data: {
      testRunId: testRun.id,
      testTitle: "SEO Title & Meta Inspection",
      testType: "SEO",
      status: "FAILED",
      durationMs: 910,
      errorMessage: "Title tag contains only 12 characters, minimum recommended is 30",
      metrics: JSON.stringify({ title: "Short Title" }),
    },
  });

  await db.testResult.create({
    data: {
      testRunId: testRun.id,
      testTitle: "A11y Color Contrast Check",
      testType: "ACCESSIBILITY",
      status: "PASSED",
      durationMs: 650,
      metrics: JSON.stringify({ violationsCount: 0 }),
    },
  });

  // Query back using the exact relation query used by the report API route
  const fetchedRun = await db.testRun.findUnique({
    where: { id: testRun.id },
    include: {
      project: {
        select: { id: true, name: true, slug: true, baseUrl: true },
      },
      suite: {
        select: { id: true, name: true },
      },
      testResults: {
        include: {
          artifacts: {
            select: { id: true, type: true, fileName: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!fetchedRun) throw new Error("Failed to fetch testRun from database");

  const dbReport = generateRunReport(fetchedRun);
  console.log(`   Generated DB Report: ID=${dbReport.id}, TotalTests=${dbReport.summary.totalTests}, PassRate=${dbReport.summary.passRate}%`);
  if (dbReport.summary.totalTests !== 3) throw new Error(`Expected 3 total tests from DB, got ${dbReport.summary.totalTests}`);
  if (dbReport.summary.passedTests !== 2) throw new Error(`Expected 2 passed tests, got ${dbReport.summary.passedTests}`);
  if (dbReport.summary.failedTests !== 1) throw new Error(`Expected 1 failed test, got ${dbReport.summary.failedTests}`);
  if (dbReport.summary.passRate !== 66.7) throw new Error(`Expected 66.7% pass rate, got ${dbReport.summary.passRate}`);

  // Verify JSON export structure
  const exportedJson = JSON.stringify(dbReport, null, 2);
  const parsedExport = JSON.parse(exportedJson);
  if (!parsedExport.summary || !parsedExport.breakdown || !parsedExport.items) {
    throw new Error("Exported JSON missing fundamental report sections");
  }
  console.log("   ✓ JSON Report Export is valid and conforms to RunReport contract");

  // ==========================================
  // Clean up DB test records
  // ==========================================
  await db.testResult.deleteMany({ where: { testRunId: testRun.id } });
  await db.testRun.delete({ where: { id: testRun.id } });
  await db.project.delete({ where: { id: project.id } });
  console.log("   ✓ Database test fixtures cleaned up");

  console.log("\n=======================================================");
  console.log(" OmniTest Phase 6A: Reporting System Verification PASSED");
  console.log("=======================================================\n");
}

verifyPhase6A().catch((err) => {
  console.error("\n❌ Phase 6A Verification Failed:", err);
  process.exit(1);
});
