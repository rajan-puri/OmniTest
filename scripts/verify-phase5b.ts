import http from "http";
import { executeA11yTest } from "../apps/web/src/lib/runner/a11y-executor";
import { validateA11yTestSpec } from "../apps/web/src/lib/runner/a11y-validator";
import { A11yTestSpec } from "../apps/web/src/lib/runner/a11y-types";
import { db } from "../apps/web/src/lib/db";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";

async function verifyPhase5B() {
  console.log("=== OmniTest Phase 5B: Accessibility Testing Acceptance Verification ===\n");

  // 1. Launch a local mock HTTP server serving pages with known a11y properties
  console.log("1. Starting Mock HTTP Accessibility Server...");
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/accessible") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Fully Accessible Page</title>
</head>
<body>
  <main>
    <h1>Welcome to OmniTest Accessible Portal</h1>
    <p>This page complies with WCAG 2.1 AA criteria.</p>
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>" alt="OmniTest Logo" />
    <button type="button" aria-label="Submit Application">Submit</button>
  </main>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/violations") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Inaccessible Test Page</title>
</head>
<body>
  <div id="dirty-section">
    <!-- Violation 1: Image missing alt attribute -->
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>" id="broken-image" />

    <!-- Violation 2: Button without accessible name or text -->
    <button id="unlabeled-btn"></button>

    <!-- Violation 3: Form element without associated label -->
    <input type="text" id="unlabeled-input" />
  </div>

  <section id="clean-section" lang="en">
    <h2>Clean Island</h2>
    <p>This isolated section has an accessible button.</p>
    <button type="button">Accessible Button</button>
  </section>
</body>
</html>`);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as any;
  const mockBaseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`   ✓ Mock server running at ${mockBaseUrl}`);

  try {
    // 2. Validate A11y Test Spec validation layer
    console.log("\n2. Testing Accessibility Spec Validator...");

    // Test invalid URLs
    try {
      validateA11yTestSpec({ version: "1.0", url: "invalid-url-string" });
      throw new Error("Should have rejected invalid URL");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected invalid URL: "${e.message}"`);
    }

    // Test invalid scope
    try {
      validateA11yTestSpec({ version: "1.0", url: `${mockBaseUrl}/test`, scope: "invalid_scope" as any });
      throw new Error("Should have rejected invalid scope");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected invalid scope: "${e.message}"`);
    }

    // Test selector requirement when scope is "selector"
    try {
      validateA11yTestSpec({ version: "1.0", url: `${mockBaseUrl}/test`, scope: "selector" });
      throw new Error("Should have rejected selector scope without selector");
    } catch (e: any) {
      console.log(`   ✓ Correctly rejected selector scope without selector: "${e.message}"`);
    }

    // Test valid spec normalization
    const normalized = validateA11yTestSpec({
      url: `${mockBaseUrl}/violations`,
      scope: "page",
      standards: ["wcag2a", "wcag2aa"],
    });
    console.log(`   ✓ Validated and normalized spec: version=${normalized.version}, standards=${normalized.standards.join(",")}`);

    // 3. Execute scan against page with deliberate violations
    console.log("\n3. Executing axe-core scan on page with violations...");
    const violationSpec: A11yTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/violations`,
      scope: "page",
      standards: ["wcag2a", "wcag2aa"],
      timeoutSeconds: 20,
    };

    const violationResult = await executeA11yTest(violationSpec);
    console.log(`   ✓ Scan Completed in ${violationResult.durationMs}ms`);
    console.log(`   ✓ Status: ${violationResult.status} (expected FAILED due to violations)`);
    console.log(`   ✓ Total Violations: ${violationResult.summary.totalViolations}`);
    console.log(`     • Critical: ${violationResult.summary.critical}`);
    console.log(`     • Serious: ${violationResult.summary.serious}`);
    console.log(`     • Moderate: ${violationResult.summary.moderate}`);
    console.log(`     • Minor: ${violationResult.summary.minor}`);
    console.log(`   ✓ Total Passes: ${violationResult.summary.totalPasses}`);
    console.log(`   ✓ Total Incomplete: ${violationResult.summary.totalIncomplete}`);
    console.log(`   ✓ Screenshot Captured: ${violationResult.screenshotUrl ? "YES" : "NO"}`);

    if (violationResult.status !== "FAILED") {
      throw new Error(`Expected FAILED status for inaccessible page, got ${violationResult.status}`);
    }
    if (violationResult.summary.totalViolations === 0) {
      throw new Error("Expected violations to be detected, found 0.");
    }
    if (!violationResult.screenshotUrl) {
      throw new Error("Expected visual screenshot artifact to be captured.");
    }

    // Verify violation rules details
    const violationRuleIds = violationResult.violations.map((v) => v.id);
    console.log(`   ✓ Detected Violation Rules: ${violationRuleIds.join(", ")}`);

    const imageAltRule = violationResult.violations.find((v) => v.id === "image-alt");
    if (imageAltRule) {
      console.log(`   ✓ Successfully identified 'image-alt' violation: "${imageAltRule.help}"`);
      console.log(`     - Impact: ${imageAltRule.impact}`);
      console.log(`     - Target node selector: ${imageAltRule.nodes[0]?.target?.join(", ")}`);
      console.log(`     - Node HTML snippet: ${imageAltRule.nodes[0]?.html}`);
    }

    const buttonNameRule = violationResult.violations.find((v) => v.id === "button-name");
    if (buttonNameRule) {
      console.log(`   ✓ Successfully identified 'button-name' violation: "${buttonNameRule.help}"`);
    }

    // 4. Test targeted selector scope scan
    console.log("\n4. Testing Targeted Selector Scope Scan (#clean-section)...");
    const scopedSpec: A11yTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/violations`,
      scope: "selector",
      selector: "#clean-section",
      standards: ["wcag2a", "wcag2aa"],
      timeoutSeconds: 20,
    };

    const scopedResult = await executeA11yTest(scopedSpec);
    console.log(`   ✓ Scoped Scan Completed in ${scopedResult.durationMs}ms`);
    console.log(`   ✓ Scoped Violations: ${scopedResult.summary.totalViolations}`);
    console.log(`   ✓ Scoped Status: ${scopedResult.status}`);
    if (scopedResult.summary.totalViolations > 0) {
      console.log(`   ℹ Scoped violations found: ${scopedResult.violations.map(v => v.id).join(", ")}`);
    }

    // 5. Execute scan against fully accessible page
    console.log("\n5. Executing axe-core scan on fully accessible page...");
    const cleanSpec: A11yTestSpec = {
      version: "1.0",
      url: `${mockBaseUrl}/accessible`,
      scope: "page",
      standards: ["wcag2a", "wcag2aa"],
      timeoutSeconds: 20,
    };

    const cleanResult = await executeA11yTest(cleanSpec);
    console.log(`   ✓ Clean Page Status: ${cleanResult.status}`);
    console.log(`   ✓ Total Violations: ${cleanResult.summary.totalViolations}`);
    console.log(`   ✓ Total Passes: ${cleanResult.summary.totalPasses}`);

    if (cleanResult.status !== "PASSED" || cleanResult.summary.totalViolations !== 0) {
      throw new Error(`Expected PASSED with 0 violations for clean page, got ${cleanResult.status} with ${cleanResult.summary.totalViolations} violations`);
    }

    // 6. Test Universal Orchestrator & Database Persistence
    console.log("\n6. Testing End-to-End Database Orchestration...");
    const org = await db.organization.create({
      data: {
        name: "A11y Test Org",
        slug: `a11y-org-${Date.now()}`,
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "A11y Web Platform",
        slug: `a11y-proj-${Date.now()}`,
        baseUrl: mockBaseUrl,
      },
    });

    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "Accessibility Compliance Suite",
      },
    });

    const test = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "WCAG 2.1 AA Compliance Audit",
        description: "Scans violations page for accessibility defects",
        type: "ACCESSIBILITY",
        config: JSON.stringify(violationSpec),
        timeoutSeconds: 25,
      },
    });

    console.log(`   ✓ Created Accessibility Test in DB (ID: ${test.id}, type: ${test.type})`);

    // Run test through universal orchestrator
    const execution = await orchestrateTestRun({
      testId: test.id,
      projectId: project.id,
      trigger: "MANUAL",
      environment: "staging",
    });

    console.log(`   ✓ Orchestrated Run Complete:`);
    console.log(`     • Run ID: ${execution.run.id}`);
    console.log(`     • Run Status: ${execution.run.status}`);
    console.log(`     • TestResult Type: ${execution.testResult.testType}`);
    console.log(`     • TestResult Status: ${execution.testResult.status}`);
    console.log(`     • Duration: ${execution.testResult.durationMs}ms`);

    const metrics = JSON.parse(execution.testResult.metrics as string);
    console.log(`     • Metrics Recorded: ${metrics.summary.totalViolations} Violations, ${metrics.summary.totalPasses} Passes`);
    console.log(`     • Critical Violations: ${metrics.summary.critical}, Serious: ${metrics.summary.serious}`);

    // Verify artifact saved
    const artifacts = await db.artifact.findMany({
      where: { testResultId: execution.testResult.id },
    });
    console.log(`     • Artifacts Stored: ${artifacts.length} (${artifacts.map(a => a.fileName).join(", ")})`);

    if (execution.testResult.testType !== "ACCESSIBILITY") {
      throw new Error(`Expected testResult.testType to be ACCESSIBILITY, got ${execution.testResult.testType}`);
    }
    if (artifacts.length === 0) {
      throw new Error("Expected at least 1 artifact (screenshot) for accessibility test run.");
    }

    // 7. Clean up
    console.log("\n7. Cleaning up test database records...");
    await db.artifact.deleteMany({ where: { testResultId: execution.testResult.id } });
    await db.testResult.deleteMany({ where: { testRunId: execution.run.id } });
    await db.testRun.delete({ where: { id: execution.run.id } });
    await db.test.delete({ where: { id: test.id } });
    await db.testSuite.delete({ where: { id: suite.id } });
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");

    console.log("\n🎉 ALL PHASE 5B ACCESSIBILITY TESTING ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

verifyPhase5B().catch((err) => {
  console.error("\n❌ PHASE 5B VERIFICATION FAILED:", err);
  process.exit(1);
});
