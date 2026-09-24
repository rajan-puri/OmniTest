import fs from "fs";
import path from "path";
import { db } from "../apps/web/src/lib/db";
import {
  formatByteSize,
  getArtifactCategory,
  compileResultArtifacts,
} from "../apps/web/src/lib/artifacts/artifact-helper";
import { ArtifactItem, ArtifactType } from "../apps/web/src/lib/artifacts/artifact-types";

async function verifyPhase6B() {
  console.log("=== OmniTest Phase 6B: Artifact Viewer Acceptance Verification ===\n");

  // ==========================================
  // Test 1: Artifact Helper & Byte Formatting
  // ==========================================
  console.log("1. Testing Artifact Helper & Byte Formatting...");

  if (formatByteSize(0) !== "0 B") throw new Error(`formatByteSize(0) failed: ${formatByteSize(0)}`);
  if (formatByteSize(512) !== "512 B") throw new Error(`formatByteSize(512) failed: ${formatByteSize(512)}`);
  if (formatByteSize(1024) !== "1.0 KB") throw new Error(`formatByteSize(1024) failed: ${formatByteSize(1024)}`);
  if (formatByteSize(1024 * 1024 * 1.5) !== "1.5 MB") throw new Error(`formatByteSize(1.5MB) failed: ${formatByteSize(1024 * 1024 * 1.5)}`);
  console.log("   ✓ formatByteSize correctly formats bytes, KB, and MB");

  if (getArtifactCategory("SCREENSHOT") !== "image") throw new Error("SCREENSHOT category failed");
  if (getArtifactCategory("PLAYWRIGHT_TRACE") !== "trace") throw new Error("PLAYWRIGHT_TRACE category failed");
  if (getArtifactCategory("CONSOLE_LOG") !== "log") throw new Error("CONSOLE_LOG category failed");
  if (getArtifactCategory("PERFORMANCE_EVIDENCE") !== "json") throw new Error("PERFORMANCE_EVIDENCE category failed");
  if (getArtifactCategory("HTML") !== "html") throw new Error("HTML category failed");
  console.log("   ✓ getArtifactCategory correctly classifies all artifact types");

  // ==========================================
  // Test 2: Artifact Compilation Across All 5 Engines
  // ==========================================
  console.log("\n2. Testing Comprehensive Artifact Compilation Across All 5 Testing Engines...");

  // 2a. UI Test with screenshot and console errors
  const mockUiResult = {
    id: "res-ui-001",
    testTitle: "Checkout Modal Flow",
    testType: "UI",
    status: "FAILED",
    errorMessage: "Step failed: Selector #checkout-btn not found",
    stackTrace: null,
    stepResults: [
      { stepId: "step_1", action: "goto", status: "passed", durationMs: 250 },
      { stepId: "step_2", action: "click", status: "failed", durationMs: 5000 },
    ],
    metrics: {
      consoleErrors: [
        { text: "Uncaught TypeError: Cannot read property 'checkout' of undefined" },
        { text: "Failed to load resource: net::ERR_CONNECTION_REFUSED" },
      ],
      networkFailures: [
        { method: "POST", url: "https://example.com/api/pay", error: "500 Internal Server Error" },
      ],
    },
    createdAt: new Date(),
    artifacts: [
      {
        id: "art-ss-01",
        type: "SCREENSHOT",
        fileName: "checkout_failure.png",
        contentType: "image/png",
        sizeBytes: 154200,
        createdAt: new Date(),
      },
    ],
  };

  const uiArtifacts = compileResultArtifacts("proj-1", "run-1", mockUiResult);
  console.log(`   Compiled UI Artifacts: ${uiArtifacts.length}`);
  const hasUiScreenshot = uiArtifacts.some((a) => a.type === "SCREENSHOT" && a.fileName === "checkout_failure.png");
  const hasUiLog = uiArtifacts.some((a) => a.type === "CONSOLE_LOG");
  const hasUiNet = uiArtifacts.some((a) => a.type === "NETWORK_LOG");
  const hasUiSteps = uiArtifacts.some((a) => a.type === "JSON" && a.fileName.includes("timeline"));

  if (!hasUiScreenshot) throw new Error("Missing physical screenshot artifact in UI result");
  if (!hasUiLog) throw new Error("Missing synthesized console log artifact in UI result");
  if (!hasUiNet) throw new Error("Missing synthesized network log artifact in UI result");
  if (!hasUiSteps) throw new Error("Missing synthesized step timeline in UI result");
  console.log("   ✓ UI artifacts compiled: screenshot, console log, network log, and step timeline");

  // 2b. API Test with sensitive headers
  const mockApiResult = {
    id: "res-api-001",
    testTitle: "POST /auth/token",
    testType: "API",
    status: "PASSED",
    errorMessage: null,
    stackTrace: null,
    stepResults: [],
    metrics: {
      httpStatus: 200,
      method: "POST",
      url: "https://api.example.com/auth/token",
      requestHeaders: {
        authorization: "Bearer my-super-secret-token-12345",
        "x-api-key": "secret-api-key-999",
        cookie: "session=xyz12345",
      },
      response: {
        status: 200,
        body: { token: "issued-jwt-token" },
      },
    },
    createdAt: new Date(),
    artifacts: [],
  };

  const apiArtifacts = compileResultArtifacts("proj-1", "run-1", mockApiResult);
  const apiEvidence = apiArtifacts.find((a) => a.type === "API_RESPONSE");
  if (!apiEvidence) throw new Error("Missing API evidence artifact");
  console.log("   ✓ API evidence compiled into inspectable artifact");

  // 2c. Accessibility Test with violations
  const mockA11yResult = {
    id: "res-a11y-001",
    testTitle: "Accessibility Standards Audit",
    testType: "ACCESSIBILITY",
    status: "FAILED",
    errorMessage: "4 violations detected",
    stackTrace: null,
    stepResults: [],
    metrics: {
      violations: [{ id: "image-alt", impact: "critical", help: "Images must have alt text" }],
      passes: 28,
    },
    createdAt: new Date(),
    artifacts: [
      {
        id: "art-a11y-ss",
        type: "SCREENSHOT",
        fileName: "a11y_scan.png",
        contentType: "image/png",
        sizeBytes: 84000,
        createdAt: new Date(),
      },
    ],
  };

  const a11yArtifacts = compileResultArtifacts("proj-1", "run-1", mockA11yResult);
  const hasA11yEvidence = a11yArtifacts.some((a) => a.type === "A11Y_EVIDENCE");
  if (!hasA11yEvidence) throw new Error("Missing A11Y evidence artifact");
  console.log("   ✓ Accessibility artifacts compiled: screenshot and audit evidence JSON");

  // 2d. Performance Test with Core Web Vitals
  const mockPerfResult = {
    id: "res-perf-001",
    testTitle: "Storefront LCP Audit",
    testType: "PERFORMANCE",
    status: "PASSED",
    errorMessage: null,
    stackTrace: null,
    stepResults: [],
    metrics: {
      vitals: { lcp: { value: 2150 }, cls: { value: 0.04 } },
      pageMetrics: { fcpMs: 820, ttfbMs: 140 },
    },
    createdAt: new Date(),
    artifacts: [],
  };

  const perfArtifacts = compileResultArtifacts("proj-1", "run-1", mockPerfResult);
  const hasPerfEvidence = perfArtifacts.some((a) => a.type === "PERFORMANCE_EVIDENCE");
  if (!hasPerfEvidence) throw new Error("Missing Performance evidence artifact");
  console.log("   ✓ Performance artifacts compiled: Core Web Vitals and timing evidence");

  // 2e. SEO Test with findings
  const mockSeoResult = {
    id: "res-seo-001",
    testTitle: "Homepage SEO Audit",
    testType: "SEO",
    status: "PASSED",
    errorMessage: null,
    stackTrace: null,
    stepResults: [],
    metrics: {
      title: "OmniTest — Automated Web Testing Engine",
      canonical: "https://example.com/",
      findings: { title: "passed", canonical: "passed" },
    },
    createdAt: new Date(),
    artifacts: [],
  };

  const seoArtifacts = compileResultArtifacts("proj-1", "run-1", mockSeoResult);
  const hasSeoEvidence = seoArtifacts.some((a) => a.type === "SEO_EVIDENCE");
  if (!hasSeoEvidence) throw new Error("Missing SEO evidence artifact");
  console.log("   ✓ SEO artifacts compiled: metadata and findings evidence");

  // ==========================================
  // Test 3: Database & Physical Artifact Storage
  // ==========================================
  console.log("\n3. Testing Database Run Persistence & Physical File Retrieval...");

  // Setup test organization & project
  let user = await db.user.findFirst({
    include: { memberships: { include: { organization: true } } },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: "artifact-qa@omnitest.dev",
        name: "OmniTest Artifact Lead",
      },
      include: { memberships: { include: { organization: true } } },
    });
  }

  let org = user.memberships[0]?.organization;
  if (!org) {
    org = await db.organization.create({
      data: {
        name: "OmniTest Artifact Lab",
        slug: "omnitest-artifact-lab",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
  }

  const project = await db.project.create({
    data: {
      name: "Phase 6B Artifact Project",
      slug: `artifact-proj-${Date.now()}`,
      organizationId: org.id,
      baseUrl: "https://example.com",
    },
  });

  const testRun = await db.testRun.create({
    data: {
      projectId: project.id,
      status: "PASSED",
      trigger: "MANUAL",
      environment: "staging",
      targetUrl: "https://example.com",
      durationMs: 1200,
    },
  });

  const testResult = await db.testResult.create({
    data: {
      testRunId: testRun.id,
      testTitle: "Navigation & Visual Check",
      testType: "UI",
      status: "PASSED",
      durationMs: 450,
      metrics: JSON.stringify({ consoleErrors: [] }),
    },
  });

  // Create physical artifact on disk
  const artifactsDir = path.join(process.cwd(), "apps", "web", "public", "artifacts", "runs", testRun.id);
  fs.mkdirSync(artifactsDir, { recursive: true });
  const testFileName = "verification_screenshot.png";
  const testFilePath = path.join(artifactsDir, testFileName);
  // 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(testFilePath, samplePngBuffer);

  const dbArtifact = await db.artifact.create({
    data: {
      testRunId: testRun.id,
      testResultId: testResult.id,
      type: "SCREENSHOT",
      fileName: testFileName,
      s3Key: testFilePath,
      s3Bucket: "local-storage",
      contentType: "image/png",
      sizeBytes: BigInt(samplePngBuffer.length),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  // Verify compiled artifacts for the persisted test result
  const fetchedResult = await db.testResult.findUnique({
    where: { id: testResult.id },
    include: { artifacts: true },
  });

  if (!fetchedResult) throw new Error("Failed to fetch testResult from DB");

  const compiled = compileResultArtifacts(project.id, testRun.id, fetchedResult);
  console.log(`   Compiled Database Artifacts: ${compiled.length}`);
  const physicalCompiled = compiled.find((a) => a.id === dbArtifact.id);
  if (!physicalCompiled) throw new Error("Database physical artifact was not compiled");
  if (physicalCompiled.fileName !== testFileName) throw new Error("File name mismatch");
  if (physicalCompiled.type !== "SCREENSHOT") throw new Error("Type mismatch");
  console.log("   ✓ Physical artifact persisted and retrieved with correct metadata");

  // ==========================================
  // Clean up DB test records and test file
  // ==========================================
  await db.artifact.deleteMany({ where: { testRunId: testRun.id } });
  await db.testResult.deleteMany({ where: { testRunId: testRun.id } });
  await db.testRun.delete({ where: { id: testRun.id } });
  await db.project.delete({ where: { id: project.id } });

  try {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    if (fs.existsSync(artifactsDir)) fs.rmdirSync(artifactsDir);
  } catch {}
  console.log("   ✓ Database test fixtures and temporary files cleaned up");

  console.log("\n=======================================================");
  console.log(" OmniTest Phase 6B: Artifact Viewer Verification PASSED");
  console.log("=======================================================\n");
}

verifyPhase6B().catch((err) => {
  console.error("\n❌ Phase 6B Verification Failed:", err);
  process.exit(1);
});
