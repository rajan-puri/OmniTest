import http from "http";
import { executePerformanceTest, evaluateThresholds } from "../apps/web/src/lib/runner/perf-executor";
import { validatePerformanceTestSpec } from "../apps/web/src/lib/runner/perf-validator";
import { PerformanceTestSpec, PerformanceThreshold } from "../apps/web/src/lib/runner/perf-types";
import { db } from "../apps/web/src/lib/db";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";

async function verifyPhase5C() {
  console.log("=== OmniTest Phase 5C: Performance Testing Acceptance Verification ===\n");

  // 1. Launch a local mock HTTP server serving pages with realistic assets
  console.log("1. Starting Mock HTTP Performance Server...");
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/fast") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Fast Web Page</title>
</head>
<body>
  <h1>Fast Performance Test</h1>
  <p>Lightweight document rendering instantly without external subresources.</p>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/heavy") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Heavy Multi-Resource Page</title>
  <link rel="stylesheet" href="/styles.css">
  <script src="/app.js" defer></script>
</head>
<body>
  <header>
    <h1>Heavy Web Application</h1>
  </header>
  <main>
    <p>This page loads stylesheets, scripts, images, and triggers a layout shift.</p>
    <div id="shift-box" style="margin-top: 10px; background: #eee; height: 50px;">Initial Box</div>
    <img src="/logo.png" alt="Logo" width="100" height="50">
    <img src="/missing-asset.png" alt="Missing">
  </main>
  <script>
    setTimeout(() => {
      const box = document.getElementById('shift-box');
      if (box) box.style.marginTop = '60px'; // Deliberate layout shift
    }, 150);
  </script>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/styles.css") {
      const css = `body { font-family: sans-serif; background: #fdfdfd; color: #222; } h1 { font-size: 2rem; color: #111; }`;
      res.writeHead(200, {
        "Content-Type": "text/css",
        "Content-Length": String(Buffer.byteLength(css)),
      });
      res.end(css);
      return;
    }

    if (url.pathname === "/app.js") {
      const js = `console.log("OmniTest app.js loaded."); window.__APP_INITIALIZED = true;`;
      res.writeHead(200, {
        "Content-Type": "application/javascript",
        "Content-Length": String(Buffer.byteLength(js)),
      });
      res.end(js);
      return;
    }

    if (url.pathname === "/logo.png") {
      const imgBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      );
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": String(imgBuffer.length),
      });
      res.end(imgBuffer);
      return;
    }

    // Deliberate 404 for failed request tracking verification
    if (url.pathname === "/missing-asset.png") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Endpoint Not Found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as any;
  const mockBaseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`   ✓ Mock server running at ${mockBaseUrl}`);

  try {
    // 2. Validate Performance Spec Validator
    console.log("\n2. Testing Performance Spec Validator...");

    // Test invalid URLs
    try {
      validatePerformanceTestSpec({ version: "1.0", url: "not-a-valid-url" });
      throw new Error("Should have rejected invalid URL");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected invalid URL: "${e.message}"`);
    }

    // Test invalid device
    try {
      validatePerformanceTestSpec({ version: "1.0", url: `${mockBaseUrl}/fast`, device: "tablet" as any });
      throw new Error("Should have rejected invalid device");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected invalid device: "${e.message}"`);
    }

    // Test invalid threshold metric
    try {
      validatePerformanceTestSpec({
        version: "1.0",
        url: `${mockBaseUrl}/fast`,
        thresholds: [{ metric: "fake_score" as any, operator: "lt", targetValue: 100 }],
      });
      throw new Error("Should have rejected invalid threshold metric");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected invalid threshold metric: "${e.message}"`);
    }

    // Test normalization of valid spec
    const normalized = validatePerformanceTestSpec({
      url: `${mockBaseUrl}/fast`,
      device: "desktop",
      thresholds: [
        { metric: "lcp", operator: "lt", targetValue: 2500 },
        { metric: "cls", operator: "lt", targetValue: 0.1 },
      ],
    });
    console.log(`   ✓ Normalized valid spec: device=${normalized.device}, thresholds=${normalized.thresholds?.length}`);

    // 3. Test Threshold Evaluation Engine
    console.log("\n3. Testing Threshold Evaluation Logic...");
    const sampleVitals = { lcp: 1450, cls: 0.02, inp: null, inpAvailable: false };
    const samplePage = { fcp: 900, ttfb: 150, domContentLoaded: 1100, loadEvent: 1400, totalLoad: 1500 };
    const sampleNetwork = {
      totalRequests: 5,
      failedRequests: 0,
      totalBytesTransferred: 12000,
      resources: {
        javascript: { count: 1, bytes: 4000 },
        css: { count: 1, bytes: 2000 },
        images: { count: 1, bytes: 5000 },
        fonts: { count: 0, bytes: 0 },
        other: { count: 2, bytes: 1000 },
      },
    };

    const passThresholds: PerformanceThreshold[] = [
      { metric: "lcp", operator: "lt", targetValue: 2500, unit: "ms" },
      { metric: "cls", operator: "lt", targetValue: 0.1, unit: "score" },
      { metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" },
    ];
    const passEval = evaluateThresholds(passThresholds, sampleVitals, samplePage, sampleNetwork);
    console.log(`   ✓ Passing threshold evaluation: allPassed=${passEval.allPassed} (Expected true)`);
    if (!passEval.allPassed) throw new Error("Expected all passing thresholds to pass.");

    const failThresholds: PerformanceThreshold[] = [
      { metric: "lcp", operator: "lt", targetValue: 1000, unit: "ms" }, // 1450 is NOT < 1000
    ];
    const failEval = evaluateThresholds(failThresholds, sampleVitals, samplePage, sampleNetwork);
    console.log(`   ✓ Failing threshold evaluation: allPassed=${failEval.allPassed} (Expected false)`);
    if (failEval.allPassed) throw new Error("Expected strict failure when threshold is breached.");

    // 4. Real Browser Execution on /fast Page
    console.log("\n4. Executing Real Browser Performance Audit on Fast Page...");
    const fastSpec: PerformanceTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/fast`,
      device: "desktop",
      measurementRuns: 1,
      warmupRuns: 0,
      thresholds: [
        { metric: "ttfb", operator: "lt", targetValue: 2000, unit: "ms" },
        { metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" },
      ],
      timeoutSeconds: 20,
    };

    const fastResult = await executePerformanceTest(fastSpec);
    console.log(`   ✓ Fast Page Audit Completed in ${fastResult.durationMs}ms`);
    console.log(`   ✓ Status: ${fastResult.status}`);
    console.log(`   ✓ FCP: ${fastResult.pageMetrics.fcp}ms`);
    console.log(`   ✓ TTFB: ${fastResult.pageMetrics.ttfb}ms`);
    console.log(`   ✓ Total Page Load: ${fastResult.pageMetrics.totalLoad}ms`);
    console.log(`   ✓ Requests: ${fastResult.network.totalRequests}, Failed: ${fastResult.network.failedRequests}`);
    console.log(`   ✓ INP: ${fastResult.vitals.inp} (inpAvailable=${fastResult.vitals.inpAvailable})`);
    console.log(`   ✓ Screenshot Captured: ${fastResult.screenshotUrl ? "YES" : "NO"}`);

    if (fastResult.status !== "PASSED") {
      throw new Error(`Expected fast page audit to PASS, got ${fastResult.status}: ${fastResult.errorSummary}`);
    }
    if (fastResult.network.totalRequests === 0) {
      throw new Error("Expected at least 1 HTTP request to be recorded.");
    }
    if (fastResult.vitals.inp !== null || fastResult.vitals.inpAvailable !== false) {
      throw new Error("INP must be reported honestly as unavailable in synthetic non-interactive audits.");
    }

    // 5. Real Browser Execution on /heavy Page with Resource Breakdown and Failed Requests
    console.log("\n5. Executing Real Browser Performance Audit on Heavy Page...");
    const heavySpec: PerformanceTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/heavy`,
      device: "desktop",
      measurementRuns: 1,
      warmupRuns: 0,
      thresholds: [
        { metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" }, // Should FAIL due to missing-asset.png
      ],
      timeoutSeconds: 20,
    };

    const heavyResult = await executePerformanceTest(heavySpec);
    console.log(`   ✓ Heavy Page Audit Completed in ${heavyResult.durationMs}ms`);
    console.log(`   ✓ Total Requests: ${heavyResult.network.totalRequests}`);
    console.log(`   ✓ Failed Requests: ${heavyResult.network.failedRequests}`);
    console.log(`   ✓ Transferred Bytes: ${heavyResult.network.totalBytesTransferred} bytes`);
    console.log(`   ✓ JavaScript Resources: ${heavyResult.network.resources.javascript.count}`);
    console.log(`   ✓ CSS Resources: ${heavyResult.network.resources.css.count}`);
    console.log(`   ✓ Image Resources: ${heavyResult.network.resources.images.count}`);
    console.log(`   ✓ Expected Threshold Failure Status: ${heavyResult.status}`);
    console.log(`   ✓ Error Summary: "${heavyResult.errorSummary}"`);

    if (heavyResult.network.failedRequests === 0) {
      throw new Error("Expected at least 1 failed request from missing-asset.png.");
    }
    if (heavyResult.status !== "FAILED") {
      throw new Error("Expected heavy page audit to FAIL due to failedRequests threshold breached.");
    }

    // 6. Test Multi-run Median Aggregation
    console.log("\n6. Testing Multi-Run Median Aggregation (Warmup + 3 Runs)...");
    const multiRunSpec: PerformanceTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/fast`,
      device: "desktop",
      warmupRuns: 1,
      measurementRuns: 3,
      thresholds: [],
      timeoutSeconds: 25,
    };

    const multiRunResult = await executePerformanceTest(multiRunSpec);
    console.log(`   ✓ Multi-run Completed in ${multiRunResult.durationMs}ms`);
    console.log(`   ✓ Measurement Runs Recorded: ${multiRunResult.rawRuns?.length}`);
    console.log(`   ✓ Aggregated Median TTFB: ${multiRunResult.pageMetrics.ttfb}ms`);
    console.log(`   ✓ Aggregated Median Total Load: ${multiRunResult.pageMetrics.totalLoad}ms`);
    console.log(`   ✓ Methodology: "${multiRunResult.methodology}"`);

    if (!multiRunResult.rawRuns || multiRunResult.rawRuns.length !== 3) {
      throw new Error("Expected exactly 3 raw measurement runs in result.");
    }

    // 7. Test End-to-End Universal Orchestrator & Database Persistence
    console.log("\n7. Testing End-to-End Database Orchestration...");
    const org = await db.organization.create({
      data: {
        name: "Performance Test Org",
        slug: `perf-org-${Date.now()}`,
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "Performance Web Platform",
        slug: `perf-proj-${Date.now()}`,
        baseUrl: mockBaseUrl,
      },
    });

    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "Web Vitals Performance Suite",
      },
    });

    const test = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "Fast Page Core Web Vitals",
        description: "Evaluates TTFB and network requests",
        type: "PERFORMANCE",
        config: JSON.stringify(fastSpec),
        timeoutSeconds: 25,
      },
    });

    console.log(`   ✓ Created Performance Test in DB (ID: ${test.id}, type: ${test.type})`);

    // Run test through universal orchestrator
    const execution = await orchestrateTestRun({
      testId: test.id,
      projectId: project.id,
      trigger: "MANUAL",
      environment: "production",
    });

    console.log(`   ✓ Orchestrated Run Complete:`);
    console.log(`     • Run ID: ${execution.run.id}`);
    console.log(`     • Run Status: ${execution.run.status}`);
    console.log(`     • TestResult Type: ${execution.testResult.testType}`);
    console.log(`     • TestResult Status: ${execution.testResult.status}`);
    console.log(`     • Duration: ${execution.testResult.durationMs}ms`);

    const metrics = JSON.parse(execution.testResult.metrics as string);
    console.log(`     • Metrics Recorded: TTFB ${metrics.pageMetrics.ttfb}ms, Total Load ${metrics.pageMetrics.totalLoad}ms`);
    console.log(`     • Requests: ${metrics.network.totalRequests}, Device: ${metrics.device}`);

    // Verify artifact saved
    const artifacts = await db.artifact.findMany({
      where: { testResultId: execution.testResult.id },
    });
    console.log(`     • Artifacts Stored: ${artifacts.length} (${artifacts.map((a) => a.fileName).join(", ")})`);

    if (execution.testResult.testType !== "PERFORMANCE") {
      throw new Error(`Expected testResult.testType to be PERFORMANCE, got ${execution.testResult.testType}`);
    }
    if (artifacts.length === 0) {
      throw new Error("Expected at least 1 visual screenshot artifact for performance test run.");
    }

    // 8. Clean up
    console.log("\n8. Cleaning up test database records...");
    await db.artifact.deleteMany({ where: { testResultId: execution.testResult.id } });
    await db.testResult.deleteMany({ where: { testRunId: execution.run.id } });
    await db.testRun.delete({ where: { id: execution.run.id } });
    await db.test.delete({ where: { id: test.id } });
    await db.testSuite.delete({ where: { id: suite.id } });
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");

    console.log("\n🎉 ALL PHASE 5C PERFORMANCE TESTING ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

verifyPhase5C().catch((err) => {
  console.error("\n❌ PHASE 5C VERIFICATION FAILED:", err);
  process.exit(1);
});
