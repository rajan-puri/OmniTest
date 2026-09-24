import { db } from "../apps/web/src/lib/db";
import {
  getProjectTestHistory,
  compareTestRuns,
  calculateFlakiness,
} from "../apps/web/src/lib/history/history-service";

async function verifyPhase6D() {
  console.log("=== OmniTest Phase 6D: Test History & Run History Acceptance Verification ===\n");

  const orgSlug = `test-org-phase6d-${Date.now()}`;
  const projectSlug = `test-proj-phase6d-${Date.now()}`;

  // 1. Setup isolated organization & project in DB
  console.log("1. Setting up isolated test organization and project...");
  const org = await db.organization.create({
    data: {
      name: "Phase 6D History Org",
      slug: orgSlug,
    },
  });

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      name: "Phase 6D History Project",
      slug: projectSlug,
      baseUrl: "https://example.com",
    },
  });

  const suite = await db.testSuite.create({
    data: {
      projectId: project.id,
      name: "Core Regression Suite",
    },
  });

  console.log(`   ✓ Created test org (${org.slug}) and project (${project.id})`);

  try {
    // ==========================================
    // Test 2: Empty History Handling
    // ==========================================
    console.log("\n2. Testing Empty History Handling...");
    const emptyHistory = await getProjectTestHistory(project.id);

    if (emptyHistory.pagination.total !== 0) {
      throw new Error(`Expected total 0, got ${emptyHistory.pagination.total}`);
    }
    if (emptyHistory.items.length !== 0) {
      throw new Error(`Expected items [] for empty project, got length ${emptyHistory.items.length}`);
    }
    if (emptyHistory.summary.passRate !== 0) {
      throw new Error(`Expected passRate 0 for empty history, got ${emptyHistory.summary.passRate}`);
    }
    if (emptyHistory.summary.avgDurationMs !== 0) {
      throw new Error(`Expected avgDurationMs 0 for empty history, got ${emptyHistory.summary.avgDurationMs}`);
    }
    console.log("   ✓ Empty history returns valid empty contract with 0 totals and zeroed summary KPIs");

    // ==========================================
    // Test 3: Create Multi-Engine Tests & Multi-Run Execution Records
    // ==========================================
    console.log("\n3. Creating Multi-Engine Automated Tests and Execution Records...");

    const testCheckout = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "User Checkout Flow",
        type: "UI",
        config: JSON.stringify({ steps: [{ action: "goto", target: "/checkout" }] }),
      },
    });

    const testApi = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "Payment Gateway API",
        type: "API",
        config: JSON.stringify({ method: "POST", url: "/api/pay" }),
      },
    });

    const testVisual = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "Hero Banner Visual Consistency",
        type: "UI",
        config: JSON.stringify({ visualRegression: { enabled: true, threshold: 0.1 } }),
      },
    });

    const testA11y = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "Accessibility WCAG Audit",
        type: "ACCESSIBILITY",
        config: JSON.stringify({ scope: "page" }),
      },
    });

    // Create 4 runs across dates:
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const today = new Date();

    // Run 1: 2 days ago (All Passed baseline)
    const run1 = await db.testRun.create({
      data: {
        projectId: project.id,
        suiteId: suite.id,
        status: "PASSED",
        trigger: "MANUAL",
        environment: "staging",
        targetUrl: "https://example.com",
        totalTests: 3,
        passedTests: 3,
        failedTests: 0,
        durationMs: 950,
        createdAt: twoDaysAgo,
      },
    });

    const res1Checkout = await db.testResult.create({
      data: {
        testRunId: run1.id,
        testId: testCheckout.id,
        testTitle: testCheckout.title,
        testType: "UI",
        status: "PASSED",
        durationMs: 300,
        createdAt: twoDaysAgo,
      },
    });

    const res1Api = await db.testResult.create({
      data: {
        testRunId: run1.id,
        testId: testApi.id,
        testTitle: testApi.title,
        testType: "API",
        status: "PASSED",
        durationMs: 150,
        createdAt: twoDaysAgo,
      },
    });

    const res1Visual = await db.testResult.create({
      data: {
        testRunId: run1.id,
        testId: testVisual.id,
        testTitle: testVisual.title,
        testType: "UI",
        status: "PASSED",
        durationMs: 500,
        metrics: JSON.stringify({
          visualComparison: {
            status: "PASSED",
            differencePercentage: 0.0,
            changedPixels: 0,
            thresholdPercentage: 0.1,
          },
        }),
        createdAt: twoDaysAgo,
      },
    });

    // Run 2: 1 day ago (Checkout and Visual Passed, API Failed, with Artifact)
    const run2 = await db.testRun.create({
      data: {
        projectId: project.id,
        suiteId: suite.id,
        status: "FAILED",
        trigger: "CLI",
        environment: "staging",
        targetUrl: "https://example.com",
        totalTests: 3,
        passedTests: 2,
        failedTests: 1,
        durationMs: 1400,
        gitCommitHash: "c0ffee123456",
        gitBranch: "feature/checkout",
        createdAt: oneDayAgo,
      },
    });

    await db.testResult.create({
      data: {
        testRunId: run2.id,
        testId: testCheckout.id,
        testTitle: testCheckout.title,
        testType: "UI",
        status: "PASSED",
        durationMs: 350,
        createdAt: oneDayAgo,
      },
    });

    const res2Api = await db.testResult.create({
      data: {
        testRunId: run2.id,
        testId: testApi.id,
        testTitle: testApi.title,
        testType: "API",
        status: "FAILED",
        durationMs: 250,
        errorMessage: "Expected HTTP 200, received 502 Bad Gateway",
        createdAt: oneDayAgo,
      },
    });

    // Attach artifact to API failure
    await db.artifact.create({
      data: {
        testRunId: run2.id,
        testResultId: res2Api.id,
        type: "LOG_STDOUT",
        fileName: "api_failure.log",
        s3Key: "test/api_failure.log",
        s3Bucket: "test-bucket",
        contentType: "text/plain",
        sizeBytes: BigInt(1024),
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Run 3: Today (Visual Diff Regression Detected + Checkout Slowdown)
    const run3 = await db.testRun.create({
      data: {
        projectId: project.id,
        suiteId: suite.id,
        status: "FAILED",
        trigger: "WEBHOOK_GITHUB",
        environment: "production",
        targetUrl: "https://example.com",
        totalTests: 4,
        passedTests: 2,
        failedTests: 2,
        durationMs: 2800,
        gitCommitHash: "deadbeef9999",
        gitBranch: "main",
        createdAt: today,
      },
    });

    // Checkout: Slowdown run (1200ms vs 300ms baseline)
    await db.testResult.create({
      data: {
        testRunId: run3.id,
        testId: testCheckout.id,
        testTitle: testCheckout.title,
        testType: "UI",
        status: "PASSED",
        durationMs: 1200,
        createdAt: today,
      },
    });

    // API: Fixed! (Passed)
    await db.testResult.create({
      data: {
        testRunId: run3.id,
        testId: testApi.id,
        testTitle: testApi.title,
        testType: "API",
        status: "PASSED",
        durationMs: 180,
        createdAt: today,
      },
    });

    // Visual: Regression! 2.45% diff
    const res3Visual = await db.testResult.create({
      data: {
        testRunId: run3.id,
        testId: testVisual.id,
        testTitle: testVisual.title,
        testType: "UI",
        status: "FAILED",
        durationMs: 620,
        errorMessage: "Visual regression diff exceeded threshold: 2.45% > 0.10%",
        metrics: JSON.stringify({
          visualComparison: {
            status: "FAILED",
            differencePercentage: 2.45,
            changedPixels: 980,
            thresholdPercentage: 0.1,
          },
        }),
        createdAt: today,
      },
    });

    // Attach Visual Diff artifact
    await db.artifact.create({
      data: {
        testRunId: run3.id,
        testResultId: res3Visual.id,
        type: "VISUAL_DIFF",
        fileName: "visual_diff_run3.png",
        s3Key: "test/visual_diff_run3.png",
        s3Bucket: "test-bucket",
        contentType: "image/png",
        sizeBytes: BigInt(45200),
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // A11y: Timed Out
    await db.testResult.create({
      data: {
        testRunId: run3.id,
        testId: testA11y.id,
        testTitle: testA11y.title,
        testType: "ACCESSIBILITY",
        status: "TIMED_OUT",
        durationMs: 800,
        errorMessage: "Scan timed out after 60000ms",
        createdAt: today,
      },
    });

    console.log("   ✓ Successfully seeded 3 runs and 10 test execution results with varied engines, dates, and artifacts");

    // ==========================================
    // Test 4: Project History Query & Summaries
    // ==========================================
    console.log("\n4. Testing Full Project History Query & Aggregations...");
    const fullHistory = await getProjectTestHistory(project.id);

    if (fullHistory.pagination.total !== 9) {
      throw new Error(`Expected 9 total executions, got ${fullHistory.pagination.total}`);
    }
    if (fullHistory.items.length !== 9) {
      throw new Error(`Expected 9 items returned on page 1, got ${fullHistory.items.length}`);
    }
    if (fullHistory.summary.passedExecutions !== 6) {
      throw new Error(`Expected 6 passed executions, got ${fullHistory.summary.passedExecutions}`);
    }
    if (fullHistory.summary.failedExecutions !== 2) {
      throw new Error(`Expected 2 failed executions, got ${fullHistory.summary.failedExecutions}`);
    }
    if (fullHistory.summary.timedOutExecutions !== 1) {
      throw new Error(`Expected 1 timed out execution, got ${fullHistory.summary.timedOutExecutions}`);
    }
    if (fullHistory.summary.passRate !== 67) {
      throw new Error(`Expected 67% pass rate (6/9), got ${fullHistory.summary.passRate}%`);
    }
    console.log(`   ✓ Aggregations match exact DB counts: Total=9, Passed=6, Failed=2, TimedOut=1 (PassRate: 67%, Avg: ${fullHistory.summary.avgDurationMs}ms)`);

    // ==========================================
    // Test 5: Server-Side Pagination
    // ==========================================
    console.log("\n5. Testing Server-Side Pagination...");
    const page1 = await getProjectTestHistory(project.id, { page: 1, pageSize: 4 });
    const page2 = await getProjectTestHistory(project.id, { page: 2, pageSize: 4 });
    const page3 = await getProjectTestHistory(project.id, { page: 3, pageSize: 4 });

    if (page1.items.length !== 4) throw new Error(`Page 1 should have 4 items, got ${page1.items.length}`);
    if (page2.items.length !== 4) throw new Error(`Page 2 should have 4 items, got ${page2.items.length}`);
    if (page3.items.length !== 1) throw new Error(`Page 3 should have remaining 1 item, got ${page3.items.length}`);
    if (page1.pagination.totalPages !== 3) throw new Error(`Total pages should be 3, got ${page1.pagination.totalPages}`);

    // Ensure page 1 and page 2 items are completely distinct
    const page1Ids = new Set(page1.items.map((i) => i.id));
    for (const item of page2.items) {
      if (page1Ids.has(item.id)) throw new Error(`Pagination leakage: Item ${item.id} appeared in both page 1 and 2`);
    }
    console.log("   ✓ Server-side pagination partitions records cleanly without overlap (4, 4, 1 = 9)");

    // ==========================================
    // Test 6: Multi-Field Filtering (Status, Engine Type, Search)
    // ==========================================
    console.log("\n6. Testing Multi-Field Filtering...");

    // 6a. Status Filter
    const failedHistory = await getProjectTestHistory(project.id, { status: "FAILED" });
    if (failedHistory.pagination.total !== 2) {
      throw new Error(`Expected 2 failed results, got ${failedHistory.pagination.total}`);
    }
    for (const item of failedHistory.items) {
      if (item.status !== "FAILED") throw new Error(`Filter status failed: item status is ${item.status}`);
    }
    console.log("   ✓ Status filter (FAILED) returned only failed test runs");

    // 6b. Engine Type Filter
    const apiHistory = await getProjectTestHistory(project.id, { testType: "API" });
    if (apiHistory.pagination.total !== 3) {
      throw new Error(`Expected 3 API results, got ${apiHistory.pagination.total}`);
    }
    for (const item of apiHistory.items) {
      if (item.testType !== "API") throw new Error(`Filter testType failed: item type is ${item.testType}`);
    }
    console.log("   ✓ TestType filter (API) returned all 3 API executions");

    // 6c. Search Filter
    const searchHistory = await getProjectTestHistory(project.id, { search: "c0ffee123456" });
    if (searchHistory.pagination.total !== 2) {
      throw new Error(`Expected 2 results matching commit c0ffee123456, got ${searchHistory.pagination.total}`);
    }
    console.log("   ✓ Search filter by git commit hash correctly resolved matching executions");

    // ==========================================
    // Test 7: Date Range Filtering
    // ==========================================
    console.log("\n7. Testing Date Range Filtering...");
    const todayHistory = await getProjectTestHistory(project.id, { dateRange: "today" });
    if (todayHistory.pagination.total !== 4) {
      throw new Error(`Expected 4 results created today, got ${todayHistory.pagination.total}`);
    }
    console.log("   ✓ Date range filter (today) correctly isolated today's 4 executions");

    // ==========================================
    // Test 8: Sorting (Duration & Date)
    // ==========================================
    console.log("\n8. Testing Server-Side Sorting...");
    const slowestHistory = await getProjectTestHistory(project.id, {
      sortBy: "durationMs",
      sortOrder: "desc",
    });

    for (let i = 0; i < slowestHistory.items.length - 1; i++) {
      if (slowestHistory.items[i].durationMs < slowestHistory.items[i + 1].durationMs) {
        throw new Error(
          `Sorting duration desc failed at index ${i}: ${slowestHistory.items[i].durationMs} < ${slowestHistory.items[i + 1].durationMs}`
        );
      }
    }
    if (slowestHistory.items[0].durationMs !== 1200) {
      throw new Error(`Slowest item expected 1200ms, got ${slowestHistory.items[0].durationMs}ms`);
    }
    console.log("   ✓ Sorting by duration desc strictly ordered items (top: 1200ms)");

    // ==========================================
    // Test 9: Test-Specific History, Trends, & Slowdown Detection
    // ==========================================
    console.log("\n9. Testing Test-Specific History & Trend Analysis...");
    const checkoutHistory = await getProjectTestHistory(project.id, { testId: testCheckout.id });

    if (checkoutHistory.pagination.total !== 3) {
      throw new Error(`Checkout test should have 3 executions, got ${checkoutHistory.pagination.total}`);
    }
    if (!checkoutHistory.trends) {
      throw new Error("Expected trends to be computed for test history");
    }

    // Checkout runs: 300ms, 350ms, 1200ms -> latest is 1200ms vs historical avg ~617ms
    if (!checkoutHistory.trends.isSlower) {
      throw new Error("Expected checkout test to be flagged as isSlower=true (1200ms vs historical)");
    }
    if (checkoutHistory.trends.durationChangePct <= 0) {
      throw new Error(`Expected positive durationChangePct, got ${checkoutHistory.trends.durationChangePct}%`);
    }
    console.log(`   ✓ Performance slowdown successfully detected: isSlower=true (+${checkoutHistory.trends.durationChangePct}%)`);

    // Flakiness calculation verification
    const stableFlakiness = calculateFlakiness(["PASSED", "PASSED", "PASSED", "PASSED"]);
    if (stableFlakiness !== 0) throw new Error(`Expected 0% flakiness for stable runs, got ${stableFlakiness}%`);

    const flipFlakiness = calculateFlakiness(["PASSED", "FAILED", "PASSED", "FAILED"]);
    if (flipFlakiness !== 100) throw new Error(`Expected 100% flakiness for alternating runs, got ${flipFlakiness}%`);
    console.log("   ✓ Deterministic flakiness score verified (0% for uniform, 100% for alternating)");

    // ==========================================
    // Test 10: Artifact Reference Integration
    // ==========================================
    console.log("\n10. Testing Artifact Reference Integration...");
    const artifactItem = fullHistory.items.find((i) => i.id === res2Api.id);
    if (!artifactItem) throw new Error("Could not find res2Api item");
    if (!artifactItem.hasArtifacts) throw new Error("Expected hasArtifacts=true for res2Api");
    if (artifactItem.artifactCount !== 1) throw new Error(`Expected 1 artifact, got ${artifactItem.artifactCount}`);
    if (!artifactItem.artifacts[0].url.includes("api_failure.log")) {
      throw new Error(`Artifact URL missing filename: ${artifactItem.artifacts[0].url}`);
    }
    console.log("   ✓ Artifact references, counts, and URLs correctly mapped into history items");

    // ==========================================
    // Test 11: Visual Regression History Integration
    // ==========================================
    console.log("\n11. Testing Visual Regression History Integration...");
    const visualItem = fullHistory.items.find((i) => i.id === res3Visual.id);
    if (!visualItem) throw new Error("Could not find res3Visual item");
    if (!visualItem.visualRegression) throw new Error("Expected visualRegression object on visual result");
    if (visualItem.visualRegression.status !== "FAILED") {
      throw new Error(`Expected visual status FAILED, got ${visualItem.visualRegression.status}`);
    }
    if (visualItem.visualRegression.differencePercentage !== 2.45) {
      throw new Error(`Expected 2.45% diff, got ${visualItem.visualRegression.differencePercentage}%`);
    }
    if (visualItem.visualRegression.changedPixels !== 980) {
      throw new Error(`Expected 980 changed pixels, got ${visualItem.visualRegression.changedPixels}`);
    }
    console.log("   ✓ Visual regression historical metrics surfaced: status=FAILED, diff=2.45%, pixels=980");

    // ==========================================
    // Test 12: Run Comparison Engine (Run 1 vs Run 3)
    // ==========================================
    console.log("\n12. Testing Run Comparison Engine (Run 1 vs Run 3)...");
    const comparison = await compareTestRuns(project.id, run1.id, run3.id);

    // Run 1: 950ms -> Run 3: 2800ms
    if (comparison.durationDeltaMs !== 1850) {
      throw new Error(`Expected duration delta 1850ms, got ${comparison.durationDeltaMs}`);
    }
    if (!comparison.statusChanged) {
      throw new Error("Expected statusChanged=true between Run 1 (PASSED) and Run 3 (FAILED)");
    }
    if (comparison.regressions.length === 0) {
      throw new Error("Expected at least 1 regression detected in comparison");
    }

    const visualRegression = comparison.regressions.find((r) => r.testId === testVisual.id);
    if (!visualRegression) throw new Error("Expected visual test to be detected as regression");
    if (visualRegression.baseStatus !== "PASSED" || visualRegression.targetStatus !== "FAILED") {
      throw new Error(`Unexpected regression status transition: ${visualRegression.baseStatus} -> ${visualRegression.targetStatus}`);
    }

    if (comparison.visualDiffs.length === 0) {
      throw new Error("Expected visualDiffs array to contain compared visual tests");
    }
    console.log(`   ✓ Run comparison identified regressions (Passed -> Failed), visual metric deltas, and duration delta (+${comparison.durationDeltaPct}%)`);

    // ==========================================
    // Test 13: Security & Multi-Tenant Project Isolation
    // ==========================================
    console.log("\n13. Testing Security & Multi-Tenant Project Isolation...");

    const otherOrg = await db.organization.create({
      data: {
        name: "Foreign Organization",
        slug: `foreign-org-${Date.now()}`,
      },
    });

    const foreignProject = await db.project.create({
      data: {
        organizationId: otherOrg.id,
        name: "Foreign Project",
        slug: `foreign-proj-${Date.now()}`,
      },
    });

    // Querying foreign project should yield 0 results from this project
    const foreignHistory = await getProjectTestHistory(foreignProject.id);
    if (foreignHistory.pagination.total !== 0) {
      throw new Error("Cross-tenant leakage: Foreign project returned results from another project");
    }

    // Comparing runs across mismatched projects must fail
    try {
      await compareTestRuns(foreignProject.id, run1.id, run3.id);
      throw new Error("Cross-project comparison should have been rejected!");
    } catch (e: any) {
      if (!e.message.includes("not found in this project")) {
        throw new Error(`Expected security rejection message, got: ${e.message}`);
      }
    }
    console.log("   ✓ Multi-tenant boundaries strictly enforced: cross-project history querying and comparison blocked");

    // Clean up foreign org
    await db.project.delete({ where: { id: foreignProject.id } });
    await db.organization.delete({ where: { id: otherOrg.id } });
  } finally {
    // Clean up test org and project
    console.log("\n14. Cleaning up Phase 6D test fixtures...");
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");
  }

  console.log("\n========================================================");
  console.log("🎉 ALL PHASE 6D TEST HISTORY VERIFICATIONS PASSED!");
  console.log("========================================================\n");
}

verifyPhase6D()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
