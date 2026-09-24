import { db } from "../apps/web/src/lib/db";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";
import { validateTestSpec } from "../apps/web/src/lib/runner/validator";

async function runPhase3Acceptance() {
  console.log("=== OmniTest Phase 3: Core Testing Engine Acceptance Verification ===\n");

  // 1. Create a test organization & project
  console.log("1. Setting up Test Environment...");
  const org = await db.organization.create({
    data: {
      name: "Playwright Verification Corp",
      slug: `pw-corp-${Date.now()}`,
    },
  });

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      name: "OmniTest Webapp",
      slug: "omnitest-webapp",
      baseUrl: "https://example.com",
    },
  });

  const suite = await db.testSuite.create({
    data: {
      projectId: project.id,
      name: "Smoke Suite",
      description: "Critical verification workflows",
    },
  });
  console.log(`   ✓ Organization, Project, and Suite created (Suite ID: ${suite.id})`);

  // 2. Acceptance Test 1: "Homepage loads" (PASSING TEST)
  console.log("\n2. Creating Acceptance Test: \"Homepage loads\"...");
  const passingSpec = validateTestSpec({
    version: "1.0",
    name: "Homepage loads",
    description: "Navigate to URL, verify page loads, and capture screenshot",
    timeoutSeconds: 30,
    steps: [
      {
        id: "step_nav",
        action: "goto",
        target: "https://example.com",
      },
      {
        id: "step_assert_url",
        action: "assert_url",
        target: "example.com",
      },
      {
        id: "step_assert_heading",
        action: "assert_visible",
        target: "h1",
      },
      {
        id: "step_screenshot",
        action: "screenshot",
        value: "homepage_verified",
      },
    ],
  });

  const test1 = await db.test.create({
    data: {
      suiteId: suite.id,
      title: passingSpec.name,
      description: passingSpec.description,
      type: "UI",
      config: JSON.stringify({
        version: passingSpec.version,
        steps: passingSpec.steps,
        viewport: passingSpec.viewport,
      }),
      timeoutSeconds: 30,
    },
  });
  console.log(`   ✓ Test "Homepage loads" created with ID: ${test1.id}`);

  // 3. Execute "Homepage loads" in child process via orchestrator
  console.log("\n3. Executing Test via Child Process Playwright Runner...");
  const execution1 = await orchestrateTestRun({
    testId: test1.id,
    projectId: project.id,
    trigger: "MANUAL",
    targetUrl: "https://example.com",
  });

  console.log(`   ✓ Execution Complete!`);
  console.log(`   • Run ID: ${execution1.run.id}`);
  console.log(`   • Status: ${execution1.run.status}`);
  console.log(`   • Duration: ${execution1.run.durationMs}ms`);
  console.log(`   • Steps Passed: ${execution1.result.passedSteps}/${execution1.result.totalSteps}`);
  console.log(`   • Screenshots captured: ${execution1.result.artifacts.length}`);
  execution1.result.artifacts.forEach((art) => {
    console.log(`     - [${art.type}] ${art.fileName} (${art.url}, ${art.sizeBytes} bytes)`);
  });

  if (execution1.run.status !== "PASSED") {
    throw new Error(`Expected "Homepage loads" to PASS, but got: ${execution1.run.status}`);
  }
  if (execution1.result.artifacts.length === 0) {
    throw new Error(`Expected screenshot artifact to be captured!`);
  }

  // 4. Acceptance Test 2: Failing Test with failure evidence & screenshot capture
  console.log("\n4. Testing Failure Handling & Auto-Screenshot Capture...");
  const failingSpec = validateTestSpec({
    version: "1.0",
    name: "Failing Assertion Check",
    description: "Verifies that assertion errors trigger failure status and error capture",
    timeoutSeconds: 15,
    steps: [
      {
        id: "step_f1",
        action: "goto",
        target: "https://example.com",
      },
      {
        id: "step_f2",
        action: "assert_text",
        target: "h1",
        value: "This Heading Definitely Does Not Exist 98765",
        options: { timeoutMs: 3000 },
      },
    ],
  });

  const test2 = await db.test.create({
    data: {
      suiteId: suite.id,
      title: failingSpec.name,
      description: failingSpec.description,
      type: "UI",
      config: JSON.stringify({
        version: failingSpec.version,
        steps: failingSpec.steps,
      }),
      timeoutSeconds: 15,
    },
  });

  const execution2 = await orchestrateTestRun({
    testId: test2.id,
    projectId: project.id,
    trigger: "MANUAL",
    targetUrl: "https://example.com",
  });

  console.log(`   ✓ Failing Test Execution Complete!`);
  console.log(`   • Status: ${execution2.run.status}`);
  console.log(`   • Error Summary: ${execution2.run.errorSummary}`);
  console.log(`   • Failure Evidence Screenshots: ${execution2.result.artifacts.length}`);

  if (execution2.run.status !== "FAILED") {
    throw new Error(`Expected test to FAIL, but got: ${execution2.run.status}`);
  }
  if (!execution2.run.errorSummary) {
    throw new Error("Expected failure error summary to be recorded!");
  }

  // 5. Cleanup test artifacts from database
  console.log("\n5. Cleaning up verification database records...");
  await db.artifact.deleteMany({ where: { testRunId: { in: [execution1.run.id, execution2.run.id] } } });
  await db.testResult.deleteMany({ where: { testRunId: { in: [execution1.run.id, execution2.run.id] } } });
  await db.testRun.deleteMany({ where: { projectId: project.id } });
  await db.test.deleteMany({ where: { suiteId: suite.id } });
  await db.testSuite.delete({ where: { id: suite.id } });
  await db.project.delete({ where: { id: project.id } });
  await db.organization.delete({ where: { id: org.id } });
  console.log("   ✓ Cleaned up test database records.");

  console.log("\n🎉 ALL PHASE 3 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
}

runPhase3Acceptance()
  .catch((err) => {
    console.error("Phase 3 verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
