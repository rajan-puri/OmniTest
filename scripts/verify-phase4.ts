import { db } from "../apps/web/src/lib/db";
import { recorderManager } from "../apps/web/src/lib/recorder/manager";
import { validateTestSpec } from "../apps/web/src/lib/runner/validator";
import { executePlaywrightTest } from "../apps/web/src/lib/runner/executor";
import path from "path";

async function verifyPhase4() {
  console.log("=== OmniTest Phase 4: Test Recorder Acceptance Verification ===\n");

  const runId = `verify_phase4_${Date.now()}`;
  const artifactDir = path.join(process.cwd(), "apps/web/public/artifacts/runs");

  try {
    // 1. Ensure test org & project exist
    console.log("1. Setting up Test Environment...");
    const org = await db.organization.create({
      data: {
        name: "Recorder Test Org",
        slug: `rec-org-${Date.now()}`,
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "Recorder Acceptance Project",
        slug: `rec-project-${Date.now()}`,
        baseUrl: "https://example.com",
      },
    });

    console.log(`   ✓ Organization & Project created: ${project.name} (${project.id})`);

    // 2. Start a real recorder browser session
    console.log("\n2. Launching Instrumented Browser Recording Session...");
    const sessionId = `rec_test_${Date.now()}`;
    const session = await recorderManager.startSession(
      sessionId,
      project.id,
      "https://example.com"
    );

    console.log(`   ✓ Browser session launched with ID: ${session.id}`);
    console.log(`   ✓ Initial actions recorded: ${session.actions.length}`);
    for (const act of session.actions) {
      console.log(`     • [${act.action}] target: "${act.target || ""}", value: "${act.value || ""}"`);
    }

    // 3. Simulate user interactions & capture assertions
    console.log("\n3. Capturing User Actions & Stable Selectors...");
    
    // User clicks link or heading
    await session.page.click("h1");
    // Wait brief moment for dispatch binding
    await new Promise((r) => setTimeout(r, 200));

    // Capture an assertion on page content
    const textAssertion = await recorderManager.captureAssertion(
      sessionId,
      "assert_text",
      "h1",
      "Example Domain"
    );
    console.log(`   ✓ Recorded Assertion: [${textAssertion.action}] on "${textAssertion.target}" expected: "${textAssertion.value}"`);

    // Capture visual screenshot assertion
    const screenshotAssertion = await recorderManager.captureAssertion(
      sessionId,
      "screenshot",
      undefined,
      "example_domain_recorded"
    );
    console.log(`   ✓ Recorded Screenshot Checkpoint: "${screenshotAssertion.value}"`);

    // 4. Stop Recording & Generate Test Steps
    console.log("\n4. Stopping Session and Generating Structured Steps...");
    const generatedSteps = await recorderManager.stopSession(sessionId);
    console.log(`   ✓ Generated ${generatedSteps.length} TestStep definitions:`);
    generatedSteps.forEach((st, idx) => {
      console.log(`     ${idx + 1}. [${st.action}] target: "${st.target || ""}", value: "${st.value || ""}"`);
    });

    // 5. Validate that generated steps conform to OmniTest TestSpec v1.0 schema
    console.log("\n5. Validating Generated Test Spec against Schema...");
    const validatedSpec = validateTestSpec({
      version: "1.0",
      name: "Recorded Example Flow",
      description: "Auto-generated test flow from browser recorder session",
      steps: generatedSteps,
    });
    console.log(`   ✓ Validation PASSED: ${validatedSpec.steps.length} valid steps confirmed.`);

    // 6. Execute the generated test with our core runner engine
    console.log("\n6. Running the Generated Test Spec through Execution Engine...");
    const execResult = await executePlaywrightTest(validatedSpec, {
      runId,
      artifactDir,
    });

    console.log(`   ✓ Generated Test Run: ${execResult.status}`);
    console.log(`   • Duration: ${execResult.durationMs}ms`);
    console.log(`   • Steps Passed: ${execResult.passedSteps}/${execResult.totalSteps}`);
    console.log(`   • Artifacts: ${execResult.artifacts.length}`);

    if (execResult.status !== "PASSED") {
      throw new Error(`Execution of recorded test failed: ${execResult.errorSummary}`);
    }

    // 7. Verify non-destructive persistence (Saving test without modifying other tests)
    console.log("\n7. Persisting Recorded Test in Database...");
    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "Recorded User Journeys",
        description: "Suites captured by OmniTest interactive recorder",
      },
    });

    const savedTest = await db.test.create({
      data: {
        suiteId: suite.id,
        title: validatedSpec.name,
        description: validatedSpec.description,
        type: "UI",
        config: JSON.stringify({
          version: validatedSpec.version,
          steps: validatedSpec.steps,
        }),
        timeoutSeconds: 30,
      },
    });

    console.log(`   ✓ Saved test ${savedTest.id} with title "${savedTest.title}".`);

    // Clean up verification records
    console.log("\n8. Cleaning up verification database records...");
    await db.test.delete({ where: { id: savedTest.id } });
    await db.testSuite.delete({ where: { id: suite.id } });
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");

    console.log("\n🎉 ALL PHASE 4 TEST RECORDER ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } catch (error) {
    console.error("\n❌ PHASE 4 VERIFICATION FAILED:", error);
    process.exit(1);
  }
}

verifyPhase4().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
