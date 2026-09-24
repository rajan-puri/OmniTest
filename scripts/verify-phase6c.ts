import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import { db } from "../apps/web/src/lib/db";
import { compareScreenshots } from "../apps/web/src/lib/visual/visual-comparator";
import {
  getTestBaseline,
  saveBaselineFromBuffer,
  setBaselineFromArtifact,
  deleteBaseline,
  getBaselinePath,
} from "../apps/web/src/lib/visual/baseline-manager";
import { formatByteSize, getArtifactCategory, compileResultArtifacts } from "../apps/web/src/lib/artifacts/artifact-helper";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";
import { generateRunReport } from "../apps/web/src/lib/reports/report-generator";

function createSolidColorPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

function modifyRect(
  sourceBuffer: Buffer,
  rect: { x: number; y: number; width: number; height: number },
  r: number,
  g: number,
  b: number
): Buffer {
  const png = PNG.sync.read(sourceBuffer);
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    for (let x = rect.x; x < rect.x + rect.width; x++) {
      const idx = (png.width * y + x) * 4;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

async function verifyPhase6C() {
  console.log("=== OmniTest Phase 6C: Visual Regression Testing Acceptance Verification ===\n");

  // ==========================================
  // Test 1: Real Image Comparison Engine (pixelmatch + pngjs)
  // ==========================================
  console.log("1. Testing Real Pixel Comparison Engine (No fake/random scores)...");

  const width = 200;
  const height = 200;
  const totalPixels = width * height; // 40,000 pixels

  const baseBuffer = createSolidColorPng(width, height, 255, 255, 255); // White image
  const identicalBuffer = createSolidColorPng(width, height, 255, 255, 255); // Identical white image

  // 1a. Identical images -> 0% diff
  const identicalResult = compareScreenshots(baseBuffer, identicalBuffer, { threshold: 0.1 });
  if (identicalResult.status !== "PASSED") throw new Error(`Identical comparison status expected PASSED, got ${identicalResult.status}`);
  if (identicalResult.metrics.changedPixels !== 0) throw new Error(`Changed pixels expected 0, got ${identicalResult.metrics.changedPixels}`);
  if (identicalResult.metrics.differencePercentage !== 0) throw new Error(`Difference % expected 0, got ${identicalResult.metrics.differencePercentage}`);
  if (!identicalResult.passed) throw new Error("Expected passed=true for identical images");
  console.log("   ✓ Identical images yield exact 0% difference and PASSED status");

  // 1b. Intentional visual change -> 400 pixels changed (20x20 box)
  // 400 / 40,000 = 1.0000%
  const modifiedBuffer = modifyRect(baseBuffer, { x: 50, y: 50, width: 20, height: 20 }, 0, 0, 0); // Black box
  const diffResult = compareScreenshots(baseBuffer, modifiedBuffer, { threshold: 0.1 });

  if (diffResult.status !== "FAILED") throw new Error(`Expected FAILED, got ${diffResult.status}`);
  if (diffResult.metrics.changedPixels !== 400) throw new Error(`Expected 400 changed pixels, got ${diffResult.metrics.changedPixels}`);
  if (diffResult.metrics.differencePercentage !== 1) throw new Error(`Expected 1.0000%, got ${diffResult.metrics.differencePercentage}%`);
  if (!diffResult.diffBuffer || diffResult.diffBuffer.length === 0) throw new Error("Expected diff PNG buffer to be generated");
  console.log("   ✓ Changed image correctly detects exact pixel count (400 / 40,000 = 1.0%) and generates diff PNG");

  // 1c. Ignore Regions (masking dynamic content, ads, timestamps)
  const ignoreRegionResult = compareScreenshots(baseBuffer, modifiedBuffer, {
    threshold: 0.1,
    ignoreRegions: [{ x: 50, y: 50, width: 20, height: 20, label: "dynamic-widget" }],
  });

  if (ignoreRegionResult.status !== "PASSED") throw new Error(`Expected PASSED with ignore region, got ${ignoreRegionResult.status}`);
  if (ignoreRegionResult.metrics.changedPixels !== 0) throw new Error(`Expected 0 changed pixels with ignore region, got ${ignoreRegionResult.metrics.changedPixels}`);
  if (ignoreRegionResult.metrics.differencePercentage !== 0) throw new Error(`Expected 0% difference with ignore region, got ${ignoreRegionResult.metrics.differencePercentage}`);
  console.log("   ✓ Ignore regions mask changes and prevent false visual regression failures");

  // 1d. Dimension mismatch validation
  const differentDimBuffer = createSolidColorPng(100, 100, 255, 255, 255);
  const mismatchResult = compareScreenshots(baseBuffer, differentDimBuffer);
  if (mismatchResult.status !== "DIMENSION_MISMATCH") throw new Error(`Expected DIMENSION_MISMATCH, got ${mismatchResult.status}`);
  if (mismatchResult.passed) throw new Error("Dimension mismatch must not pass");
  if (!mismatchResult.errorMessage?.includes("200x200") || !mismatchResult.errorMessage?.includes("100x100")) {
    throw new Error(`Dimension mismatch error message missing exact dimensions: ${mismatchResult.errorMessage}`);
  }
  console.log("   ✓ Dimension mismatch correctly flagged (200x200 vs 100x100) without crashing");

  // ==========================================
  // Test 2: Baseline Management System
  // ==========================================
  console.log("\n2. Testing Baseline Management System...");

  // Setup test organization and project in DB
  const org = await db.organization.upsert({
    where: { slug: "visual-test-org" },
    update: {},
    create: { name: "Visual Testing Org", slug: "visual-test-org" },
  });

  const project = await db.project.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "visual-project",
      },
    },
    update: {},
    create: {
      name: "Visual Verification Project",
      slug: "visual-project",
      organizationId: org.id,
      baseUrl: "http://localhost:3000",
    },
  });

  const suite = await db.testSuite.upsert({
    where: { id: "visual-test-suite" },
    update: {},
    create: {
      id: "visual-test-suite",
      projectId: project.id,
      name: "Visual Regression Suite",
    },
  });

  const testRecord = await db.test.create({
    data: {
      suiteId: suite.id,
      title: "Hero Banner Visual Regression Test",
      description: "Verifies visual rendering and pixel consistency of the Hero banner",
      type: "UI",
      config: JSON.stringify({
        visualRegression: {
          enabled: true,
          threshold: 0.1,
          viewport: { width: 1280, height: 720 },
        },
        steps: [
          { id: "step_1", action: "goto", target: "https://example.com" },
        ],
      }),
    },
  });

  // 2a. Initial state: No baseline exists
  const initialBaseline = await getTestBaseline(testRecord.id);
  if (initialBaseline.exists) throw new Error("Expected no baseline to exist initially");
  console.log("   ✓ New test starts in NO_BASELINE state");

  // 2b. Explicit Baseline Creation
  const baselineImg = createSolidColorPng(1280, 720, 30, 41, 59); // Slate blue 1280x720
  const savedBaseline = await saveBaselineFromBuffer(testRecord.id, baselineImg, {
    userEmail: "engineer@example.com",
  });

  if (!savedBaseline.exists) throw new Error("Expected saved baseline to exist");
  if (savedBaseline.width !== 1280 || savedBaseline.height !== 720) {
    throw new Error(`Expected 1280x720 dimensions, got ${savedBaseline.width}x${savedBaseline.height}`);
  }
  const checkBaseline = await getTestBaseline(testRecord.id);
  if (!checkBaseline.exists || checkBaseline.width !== 1280) {
    throw new Error("Baseline retrieval failed after saving");
  }
  console.log("   ✓ Explicit baseline creation saves PNG and stores dimensions (1280x720)");

  // 2c. Safe Baseline Deletion
  const deleteSuccess = await deleteBaseline(testRecord.id);
  if (!deleteSuccess) throw new Error("Expected deleteBaseline to succeed");
  const postDelete = await getTestBaseline(testRecord.id);
  if (postDelete.exists) throw new Error("Baseline should not exist after deletion");
  console.log("   ✓ Safe baseline deletion cleans up file and clears metadata");

  // Re-create baseline for execution tests
  await saveBaselineFromBuffer(testRecord.id, baselineImg, { userEmail: "lead@example.com" });

  // ==========================================
  // Test 3: Artifact Viewer & Helper Integration
  // ==========================================
  console.log("\n3. Testing Visual Artifacts in Artifact System...");

  if (getArtifactCategory("VISUAL_BASELINE") !== "image") throw new Error("VISUAL_BASELINE must be categorized as image");
  if (getArtifactCategory("VISUAL_CURRENT") !== "image") throw new Error("VISUAL_CURRENT must be categorized as image");
  if (getArtifactCategory("VISUAL_DIFF") !== "image") throw new Error("VISUAL_DIFF must be categorized as image");
  console.log("   ✓ VISUAL_BASELINE, VISUAL_CURRENT, and VISUAL_DIFF are recognized image artifacts");

  // Create mock run & result with visual artifacts
  const mockRun = await db.testRun.create({
    data: {
      projectId: project.id,
      suiteId: suite.id,
      status: "FAILED",
      trigger: "MANUAL",
      targetUrl: "https://example.com",
      passedTests: 0,
      failedTests: 1,
    },
  });

  const mockVisualMetrics = {
    visualComparison: {
      status: "FAILED",
      metrics: {
        totalPixels: 921600,
        changedPixels: 2450,
        differencePercentage: 0.2658,
        thresholdPercentage: 0.1,
        passed: false,
        baselineWidth: 1280,
        baselineHeight: 720,
        currentWidth: 1280,
        currentHeight: 720,
      },
      baselineUrl: `/artifacts/baselines/${testRecord.id}/baseline.png`,
      currentUrl: `/artifacts/runs/${mockRun.id}/visual_current.png`,
      diffUrl: `/artifacts/runs/${mockRun.id}/visual_diff.png`,
      errorMessage: "Visual regression difference of 0.2658% exceeded threshold of 0.1%. (2,450 / 921,600 changed pixels)",
      viewport: { width: 1280, height: 720 },
      screenshotMode: "viewport",
      createdAt: new Date().toISOString(),
    },
  };

  const mockResult = await db.testResult.create({
    data: {
      testRunId: mockRun.id,
      testId: testRecord.id,
      testTitle: testRecord.title,
      testType: "UI",
      status: "FAILED",
      durationMs: 1420,
      errorMessage: mockVisualMetrics.visualComparison.errorMessage,
      stepResults: JSON.stringify([{ stepId: "step_1", action: "goto", status: "PASSED", durationMs: 400 }]),
      metrics: JSON.stringify(mockVisualMetrics),
    },
  });

  // Create database artifacts
  const baseArt = await db.artifact.create({
    data: {
      testRunId: mockRun.id,
      testResultId: mockResult.id,
      type: "VISUAL_CURRENT",
      fileName: "visual_current.png",
      s3Key: `/artifacts/runs/${mockRun.id}/visual_current.png`,
      s3Bucket: "local-storage",
      contentType: "image/png",
      sizeBytes: BigInt(85420),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  const diffArt = await db.artifact.create({
    data: {
      testRunId: mockRun.id,
      testResultId: mockResult.id,
      type: "VISUAL_DIFF",
      fileName: "visual_diff.png",
      s3Key: `/artifacts/runs/${mockRun.id}/visual_diff.png`,
      s3Bucket: "local-storage",
      contentType: "image/png",
      sizeBytes: BigInt(64210),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  // Test setBaselineFromArtifact
  // Create an actual dummy file so setBaselineFromArtifact can read it
  const webDir = path.join(process.cwd(), "apps", "web");
  const dummyCurrentDir = path.join(webDir, "public", "artifacts", "runs", mockRun.id);
  fs.mkdirSync(dummyCurrentDir, { recursive: true });
  const dummyCurrentPath = path.join(dummyCurrentDir, "visual_current.png");
  fs.writeFileSync(dummyCurrentPath, baselineImg);

  // Update artifact s3Key to point to absolute file
  await db.artifact.update({
    where: { id: baseArt.id },
    data: { s3Key: dummyCurrentPath },
  });

  const adoptedBaseline = await setBaselineFromArtifact(testRecord.id, baseArt.id, "reviewer@example.com");
  if (!adoptedBaseline.exists || adoptedBaseline.width !== 1280) {
    throw new Error("setBaselineFromArtifact failed to adopt artifact as baseline");
  }
  console.log("   ✓ setBaselineFromArtifact successfully promotes run screenshot to official baseline");

  // Compile artifacts and verify categorization
  const compiledArtifacts = compileResultArtifacts(project.id, mockRun.id, {
    ...mockResult,
    artifacts: [baseArt, diffArt],
  });

  const foundCurrent = compiledArtifacts.find((a) => a.type === "VISUAL_CURRENT");
  const foundDiff = compiledArtifacts.find((a) => a.type === "VISUAL_DIFF");
  if (!foundCurrent || !foundDiff) throw new Error("Compiled artifacts missing visual artifacts");
  console.log("   ✓ Artifact Viewer successfully lists and categorizes VISUAL_CURRENT and VISUAL_DIFF artifacts");

  // ==========================================
  // Test 4: Run Report Integration (Phase 6A + 6C)
  // ==========================================
  console.log("\n4. Testing Run Report Integration with Visual Failures...");

  const runWithRelations = await db.testRun.findUnique({
    where: { id: mockRun.id },
    include: {
      project: { select: { id: true, name: true, slug: true, baseUrl: true } },
      suite: { select: { id: true, name: true } },
      testResults: {
        include: {
          artifacts: { select: { id: true, type: true, fileName: true } },
        },
      },
    },
  });

  if (!runWithRelations) throw new Error("Mock run not found for report generation");
  const report = generateRunReport(runWithRelations);

  if (report.failures.length !== 1) throw new Error(`Expected 1 failure, got ${report.failures.length}`);
  const failItem = report.failures[0];
  if (!failItem.failureReason.includes("Visual regression difference")) {
    throw new Error(`Report failure reason does not surface visual regression: ${failItem.failureReason}`);
  }
  if (!failItem.detailsSnippet?.includes("changed pixels")) {
    throw new Error(`Report details snippet missing changed pixels: ${failItem.detailsSnippet}`);
  }
  console.log("   ✓ Run Report surfaces visual diff details, percentage, and changed pixel counts");

  // ==========================================
  // Clean up test data
  // ==========================================
  await deleteBaseline(testRecord.id);
  await db.artifact.deleteMany({ where: { testRunId: mockRun.id } });
  await db.testResult.deleteMany({ where: { testRunId: mockRun.id } });
  await db.testRun.deleteMany({ where: { projectId: project.id } });
  await db.test.delete({ where: { id: testRecord.id } });
  await db.testSuite.delete({ where: { id: suite.id } });
  await db.project.delete({ where: { id: project.id } });
  await db.organization.delete({ where: { id: org.id } });

  // Clean up created dummy run artifacts
  try {
    fs.rmSync(dummyCurrentDir, { recursive: true, force: true });
  } catch {}

  console.log("\n========================================================");
  console.log("🎉 ALL PHASE 6C VISUAL REGRESSION VERIFICATIONS PASSED!");
  console.log("========================================================\n");
}

verifyPhase6C()
  .catch((err) => {
    console.error("\n❌ Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
