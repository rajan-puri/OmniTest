import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { db } from "../db";
import { TestSpec, TestExecutionResult } from "./types";
import { validateTestSpec } from "./validator";
import { executeApiTest } from "./api-executor";
import { validateApiTestSpec } from "./api-validator";
import { ApiTestSpec } from "./api-types";
import { executeA11yTest } from "./a11y-executor";
import { validateA11yTestSpec } from "./a11y-validator";
import { A11yTestSpec } from "./a11y-types";
import { executePerformanceTest } from "./perf-executor";
import { validatePerformanceTestSpec } from "./perf-validator";
import { PerformanceTestSpec } from "./perf-types";
import { executeSeoTest } from "./seo-executor";
import { validateSeoTestSpec } from "./seo-validator";
import { SeoTestSpec } from "./seo-types";
import { getTestBaseline } from "../visual/baseline-manager";

export async function orchestrateTestRun({
  testId,
  projectId,
  trigger = "MANUAL",
  environment = "staging",
  targetUrl,
}: {
  testId: string;
  projectId: string;
  trigger?: string;
  environment?: string;
  targetUrl?: string;
}) {
  const test = await db.test.findUnique({
    where: { id: testId },
    include: {
      suite: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!test) {
    throw new Error(`Test with id ${testId} not found.`);
  }

  const rawConfig = typeof test.config === "string" ? JSON.parse(test.config) : test.config;

  // Branch 1: API Test Execution
  if (test.type === "API") {
    const apiSpec: ApiTestSpec = validateApiTestSpec(rawConfig);
    const effectiveTargetUrl = targetUrl || apiSpec.url;

    // Create TestRun in database
    const run = await db.testRun.create({
      data: {
        projectId,
        suiteId: test.suiteId,
        status: "RUNNING",
        trigger,
        environment,
        targetUrl: effectiveTargetUrl,
        totalTests: 1,
        startedAt: new Date(),
      },
    });

    const apiResult = await executeApiTest(apiSpec, {
      baseUrl: targetUrl || test.suite?.projectId ? undefined : undefined,
    });

    const isPassed = apiResult.status === "PASSED";

    const updatedRun = await db.testRun.update({
      where: { id: run.id },
      data: {
        status: apiResult.status,
        passedTests: isPassed ? 1 : 0,
        failedTests: isPassed ? 0 : 1,
        durationMs: apiResult.durationMs,
        completedAt: new Date(),
        errorSummary: apiResult.errorSummary || null,
      },
    });

    const testResult = await db.testResult.create({
      data: {
        testRunId: run.id,
        testId: test.id,
        testTitle: test.title,
        testType: "API",
        status: apiResult.status,
        browser: null,
        durationMs: apiResult.durationMs,
        errorMessage: apiResult.errorSummary || null,
        stackTrace: null,
        stepResults: JSON.stringify(
          apiResult.assertions.map((a) => ({
            stepId: a.assertionId,
            action: a.type,
            status: a.status,
            durationMs: 0,
            errorMessage: a.message,
          }))
        ),
        metrics: JSON.stringify({
          statusCode: apiResult.statusCode,
          statusText: apiResult.statusText,
          request: apiResult.request,
          response: apiResult.response,
          assertions: apiResult.assertions,
          totalAssertions: apiResult.totalAssertions,
          passedAssertions: apiResult.passedAssertions,
          failedAssertions: apiResult.failedAssertions,
        }),
      },
    });

    return {
      run: updatedRun,
      testResult,
      result: {
        status: apiResult.status,
        durationMs: apiResult.durationMs,
        totalSteps: apiResult.totalAssertions,
        passedSteps: apiResult.passedAssertions,
        failedSteps: apiResult.failedAssertions,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: [],
        errorSummary: apiResult.errorSummary,
        apiExecution: apiResult,
      },
    };
  }

  // Branch 2: Accessibility Test Execution
  if (test.type === "ACCESSIBILITY") {
    const a11ySpec: A11yTestSpec = validateA11yTestSpec(rawConfig);
    const effectiveTargetUrl = targetUrl || a11ySpec.url;

    // Create TestRun in database
    const run = await db.testRun.create({
      data: {
        projectId,
        suiteId: test.suiteId,
        status: "RUNNING",
        trigger,
        environment,
        targetUrl: effectiveTargetUrl,
        totalTests: 1,
        startedAt: new Date(),
      },
    });

    let appsWebDir = process.cwd();
    try {
      const pkgPath = path.join(appsWebDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name !== "@omnitest/web" && fs.existsSync(path.join(appsWebDir, "apps", "web"))) {
          appsWebDir = path.join(appsWebDir, "apps", "web");
        }
      }
    } catch {
      // Keep appsWebDir
    }

    const publicArtifactsDir = path.join(appsWebDir, "public", "artifacts", "runs");
    fs.mkdirSync(publicArtifactsDir, { recursive: true });

    const a11yResult = await executeA11yTest(a11ySpec, {
      runId: run.id,
      artifactDir: publicArtifactsDir,
      publicUrlPrefix: `/artifacts/runs/${run.id}`,
      baseUrl: targetUrl || test.suite?.project?.baseUrl || undefined,
    });

    const isPassed = a11yResult.status === "PASSED";

    const updatedRun = await db.testRun.update({
      where: { id: run.id },
      data: {
        status: a11yResult.status,
        passedTests: isPassed ? 1 : 0,
        failedTests: isPassed ? 0 : 1,
        durationMs: a11yResult.durationMs,
        completedAt: new Date(),
        errorSummary: a11yResult.errorSummary || null,
      },
    });

    const testResult = await db.testResult.create({
      data: {
        testRunId: run.id,
        testId: test.id,
        testTitle: test.title,
        testType: "ACCESSIBILITY",
        status: a11yResult.status,
        browser: "chromium",
        durationMs: a11yResult.durationMs,
        errorMessage: a11yResult.errorSummary || null,
        stackTrace: null,
        stepResults: JSON.stringify(
          a11yResult.violations.map((v) => ({
            stepId: v.id,
            action: "assert_a11y",
            status: "FAILED",
            durationMs: 0,
            errorMessage: `${v.impact?.toUpperCase()}: ${v.help} (${v.nodes.length} occurrences)`,
          }))
        ),
        metrics: JSON.stringify({
          summary: a11yResult.summary,
          violations: a11yResult.violations,
          passes: a11yResult.passes,
          incomplete: a11yResult.incomplete,
          screenshotUrl: a11yResult.screenshotUrl,
        }),
      },
    });

    // Save screenshot artifact if captured
    if (a11yResult.screenshotUrl) {
      const fileName = `a11y_scan_${run.id.slice(0, 8)}.png`;
      const filePath = path.join(publicArtifactsDir, run.id, fileName);
      let sizeBytes = 0;
      try {
        if (fs.existsSync(filePath)) {
          sizeBytes = fs.statSync(filePath).size;
        }
      } catch {}

      await db.artifact.create({
        data: {
          testRunId: run.id,
          testResultId: testResult.id,
          type: "SCREENSHOT",
          fileName,
          s3Key: filePath,
          s3Bucket: "local-storage",
          contentType: "image/png",
          sizeBytes: BigInt(sizeBytes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    }

    return {
      run: updatedRun,
      testResult,
      result: {
        status: a11yResult.status,
        durationMs: a11yResult.durationMs,
        totalSteps: a11yResult.summary.totalViolations + a11yResult.summary.totalPasses,
        passedSteps: a11yResult.summary.totalPasses,
        failedSteps: a11yResult.summary.totalViolations,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: a11yResult.screenshotUrl
          ? [
              {
                type: "SCREENSHOT",
                fileName: `a11y_scan_${run.id.slice(0, 8)}.png`,
                filePath: path.join(publicArtifactsDir, run.id, `a11y_scan_${run.id.slice(0, 8)}.png`),
                url: a11yResult.screenshotUrl,
                sizeBytes: 0,
              },
            ]
          : [],
        errorSummary: a11yResult.errorSummary,
        a11yExecution: a11yResult,
      },
    };
  }

  // Branch 3: Web Performance Test Execution
  if (test.type === "PERFORMANCE") {
    const perfSpec: PerformanceTestSpec = validatePerformanceTestSpec(rawConfig);
    const effectiveTargetUrl = targetUrl || perfSpec.url;

    // Create TestRun in database
    const run = await db.testRun.create({
      data: {
        projectId,
        suiteId: test.suiteId,
        status: "RUNNING",
        trigger,
        environment,
        targetUrl: effectiveTargetUrl,
        totalTests: 1,
        startedAt: new Date(),
      },
    });

    let appsWebDir = process.cwd();
    try {
      const pkgPath = path.join(appsWebDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name !== "@omnitest/web" && fs.existsSync(path.join(appsWebDir, "apps", "web"))) {
          appsWebDir = path.join(appsWebDir, "apps", "web");
        }
      }
    } catch {
      // Keep appsWebDir
    }

    const publicArtifactsDir = path.join(appsWebDir, "public", "artifacts", "runs");
    fs.mkdirSync(publicArtifactsDir, { recursive: true });

    const perfResult = await executePerformanceTest(perfSpec, {
      runId: run.id,
      artifactDir: publicArtifactsDir,
      publicUrlPrefix: `/artifacts/runs/${run.id}`,
      baseUrl: targetUrl || test.suite?.project?.baseUrl || undefined,
    });

    const isPassed = perfResult.status === "PASSED";

    const updatedRun = await db.testRun.update({
      where: { id: run.id },
      data: {
        status: perfResult.status,
        passedTests: isPassed ? 1 : 0,
        failedTests: isPassed ? 0 : 1,
        durationMs: perfResult.durationMs,
        completedAt: new Date(),
        errorSummary: perfResult.errorSummary || null,
      },
    });

    // Create TestResult record
    const testResult = await db.testResult.create({
      data: {
        testRunId: run.id,
        testId: test.id,
        testTitle: test.title,
        testType: "PERFORMANCE",
        status: perfResult.status,
        browser: perfResult.device === "mobile" ? "chromium-mobile" : "chromium",
        durationMs: perfResult.durationMs,
        errorMessage: perfResult.errorSummary || null,
        stackTrace: null,
        stepResults: JSON.stringify(
          perfResult.thresholds.map((t) => ({
            stepId: t.metric,
            action: "assert_threshold",
            status: t.passed ? "PASSED" : "FAILED",
            durationMs: 0,
            errorMessage: t.passed ? null : t.message,
          }))
        ),
        metrics: JSON.stringify({
          url: perfResult.url,
          device: perfResult.device,
          runsCount: perfResult.runsCount,
          vitals: perfResult.vitals,
          pageMetrics: perfResult.pageMetrics,
          network: perfResult.network,
          thresholds: perfResult.thresholds,
          screenshotUrl: perfResult.screenshotUrl,
          methodology: perfResult.methodology,
        }),
      },
    });

    // Save screenshot artifact if captured
    if (perfResult.screenshotUrl) {
      const fileName = `perf_scan_${run.id.slice(0, 8)}.png`;
      const filePath = path.join(publicArtifactsDir, run.id, fileName);
      let sizeBytes = 0;
      try {
        if (fs.existsSync(filePath)) {
          sizeBytes = fs.statSync(filePath).size;
        }
      } catch {}

      await db.artifact.create({
        data: {
          testRunId: run.id,
          testResultId: testResult.id,
          type: "SCREENSHOT",
          fileName,
          s3Key: filePath,
          s3Bucket: "local-storage",
          contentType: "image/png",
          sizeBytes: BigInt(sizeBytes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    }

    return {
      run: updatedRun,
      testResult,
      result: {
        status: perfResult.status,
        durationMs: perfResult.durationMs,
        totalSteps: perfResult.thresholds.length || 1,
        passedSteps: perfResult.thresholds.filter((t) => t.passed).length,
        failedSteps: perfResult.thresholds.filter((t) => !t.passed).length,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: perfResult.screenshotUrl
          ? [
              {
                type: "SCREENSHOT",
                fileName: `perf_scan_${run.id.slice(0, 8)}.png`,
                filePath: path.join(publicArtifactsDir, run.id, `perf_scan_${run.id.slice(0, 8)}.png`),
                url: perfResult.screenshotUrl,
                sizeBytes: 0,
              },
            ]
          : [],
        errorSummary: perfResult.errorSummary,
        performanceExecution: perfResult,
      },
    };
  }

  // Branch 4: SEO Test Execution
  if (test.type === "SEO") {
    const seoSpec: SeoTestSpec = validateSeoTestSpec(rawConfig);
    const effectiveTargetUrl = targetUrl || seoSpec.url;

    // Create TestRun in database
    const run = await db.testRun.create({
      data: {
        projectId,
        suiteId: test.suiteId,
        status: "RUNNING",
        trigger,
        environment,
        targetUrl: effectiveTargetUrl,
        totalTests: 1,
        startedAt: new Date(),
      },
    });

    let appsWebDir = process.cwd();
    try {
      const pkgPath = path.join(appsWebDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name !== "@omnitest/web" && fs.existsSync(path.join(appsWebDir, "apps", "web"))) {
          appsWebDir = path.join(appsWebDir, "apps", "web");
        }
      }
    } catch {
      // Keep appsWebDir
    }

    const publicArtifactsDir = path.join(appsWebDir, "public", "artifacts", "runs");
    fs.mkdirSync(publicArtifactsDir, { recursive: true });

    const seoResult = await executeSeoTest(seoSpec, {
      runId: run.id,
      artifactDir: path.join(publicArtifactsDir, run.id),
      publicUrlPrefix: `/artifacts/runs/${run.id}`,
      baseUrl: targetUrl || test.suite?.project?.baseUrl || undefined,
    });

    const isPassed = seoResult.status === "PASSED";

    // Update TestRun
    const updatedRun = await db.testRun.update({
      where: { id: run.id },
      data: {
        status: isPassed ? "PASSED" : "FAILED",
        passedTests: isPassed ? 1 : 0,
        failedTests: isPassed ? 0 : 1,
        durationMs: seoResult.durationMs,
        completedAt: new Date(),
        errorSummary: isPassed ? null : (seoResult.errorSummary || "SEO assertions breached"),
      },
    });

    // Create TestResult
    const testResult = await db.testResult.create({
      data: {
        testRunId: run.id,
        testId: test.id,
        testTitle: test.title,
        testType: "SEO",
        status: isPassed ? "PASSED" : "FAILED",
        browser: "chromium",
        durationMs: seoResult.durationMs,
        errorMessage: isPassed ? null : (seoResult.errorSummary || "SEO assertions breached"),
        stepResults: JSON.stringify(
          seoResult.assertions.map((a) => ({
            stepId: a.id,
            action: "assert_seo",
            status: a.passed ? "PASSED" : "FAILED",
            durationMs: 0,
            errorMessage: a.errorMessage,
          }))
        ),
        metrics: JSON.stringify({
          url: seoResult.url,
          finalUrl: seoResult.finalUrl,
          httpStatus: seoResult.httpStatus,
          httpStatusText: seoResult.httpStatusText,
          redirectChain: seoResult.redirectChain,
          summary: seoResult.summary,
          findings: seoResult.findings,
          pageDetails: seoResult.pageDetails,
          assertions: seoResult.assertions,
          screenshotUrl: seoResult.screenshotUrl,
        }),
      },
    });

    // Save screenshot Artifact record if present
    if (seoResult.screenshotUrl) {
      const fileName = `seo_scan_${run.id.slice(0, 8)}.png`;
      const filePath = path.join(publicArtifactsDir, run.id, fileName);
      let sizeBytes = 0;
      try {
        if (fs.existsSync(filePath)) {
          sizeBytes = fs.statSync(filePath).size;
        }
      } catch {}

      await db.artifact.create({
        data: {
          testRunId: run.id,
          testResultId: testResult.id,
          type: "SCREENSHOT",
          fileName,
          s3Key: filePath,
          s3Bucket: "local-storage",
          contentType: "image/png",
          sizeBytes: BigInt(sizeBytes),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    }

    return {
      run: updatedRun,
      testResult,
      result: {
        status: seoResult.status,
        durationMs: seoResult.durationMs,
        totalSteps: seoResult.assertions.length || 1,
        passedSteps: seoResult.assertions.filter((a) => a.passed).length,
        failedSteps: seoResult.assertions.filter((a) => !a.passed).length,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: seoResult.screenshotUrl
          ? [
              {
                type: "SCREENSHOT",
                fileName: `seo_scan_${run.id.slice(0, 8)}.png`,
                filePath: path.join(publicArtifactsDir, run.id, `seo_scan_${run.id.slice(0, 8)}.png`),
                url: seoResult.screenshotUrl,
                sizeBytes: 0,
              },
            ]
          : [],
        errorSummary: seoResult.errorSummary,
        seoExecution: seoResult,
      },
    };
  }

  // Branch 5: Browser/UI Test Execution
  const spec: TestSpec = validateTestSpec({
    version: "1.0",
    name: test.title,
    description: test.description || undefined,
    timeoutSeconds: test.timeoutSeconds || 30,
    steps: rawConfig.steps || [],
    visualRegression: rawConfig.visualRegression,
  });

  const effectiveTargetUrl = targetUrl || rawConfig.baseUrl || "http://localhost:3000";

  // Create TestRun in database
  const run = await db.testRun.create({
    data: {
      projectId,
      suiteId: test.suiteId,
      status: "RUNNING",
      trigger,
      environment,
      targetUrl: effectiveTargetUrl,
      totalTests: 1,
      startedAt: new Date(),
    },
  });

  // Setup paths
  let appsWebDir = process.cwd();
  try {
    const pkgPath = path.join(appsWebDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.name !== "@omnitest/web" && fs.existsSync(path.join(appsWebDir, "apps", "web"))) {
        appsWebDir = path.join(appsWebDir, "apps", "web");
      }
    }
  } catch {
    // Keep appsWebDir
  }

  const tmpDir = path.join(appsWebDir, ".tmp", "runs", run.id);
  const publicArtifactsDir = path.join(appsWebDir, "public", "artifacts", "runs");
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(publicArtifactsDir, { recursive: true });

  const inputPath = path.join(tmpDir, "input.json");
  const outputPath = path.join(tmpDir, "output.json");
  const workerScript = path.join(appsWebDir, "src", "lib", "runner", "worker-process.ts");

  // Check for existing visual baseline
  const baselineInfo = await getTestBaseline(test.id);

  const payload = {
    spec,
    options: {
      runId: run.id,
      artifactDir: publicArtifactsDir,
      publicUrlPrefix: `/artifacts/runs/${run.id}`,
      baseUrl: effectiveTargetUrl,
      baselinePath: baselineInfo.exists ? baselineInfo.filePath : undefined,
      baselineUrl: baselineInfo.exists ? baselineInfo.url : undefined,
      testId: test.id,
    },
  };

  fs.writeFileSync(inputPath, JSON.stringify(payload, null, 2), "utf-8");

  // Execute in isolated child process with timeout
  const timeoutMs = (spec.timeoutSeconds || 45) * 1000;

  const executionPromise = new Promise<TestExecutionResult>((resolve) => {
    // We invoke tsx to run the TypeScript worker process in isolation
    const child = spawn("npx", ["tsx", workerScript, inputPath, outputPath], {
      cwd: appsWebDir,
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({
        status: "TIMED_OUT",
        durationMs: timeoutMs,
        totalSteps: spec.steps.length,
        passedSteps: 0,
        failedSteps: 1,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: [],
        errorSummary: `Test execution timed out after ${timeoutMs / 1000}s.`,
      });
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);

      if (fs.existsSync(outputPath)) {
        try {
          const resultJson = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
          resolve(resultJson);
          return;
        } catch {
          // parse failed
        }
      }

      resolve({
        status: "FAILED",
        durationMs: 0,
        totalSteps: spec.steps.length,
        passedSteps: 0,
        failedSteps: 1,
        stepResults: [],
        consoleErrors: [],
        networkFailures: [],
        artifacts: [],
        errorSummary: stderr || stdout || `Process exited with code ${code}`,
      });
    });
  });

  const result = await executionPromise;

  // Cleanup tmp folder
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error
  }

  // Update Database Records
  const isPassed = result.status === "PASSED";

  const updatedRun = await db.testRun.update({
    where: { id: run.id },
    data: {
      status: result.status,
      passedTests: isPassed ? 1 : 0,
      failedTests: isPassed ? 0 : 1,
      durationMs: result.durationMs,
      completedAt: new Date(),
      errorSummary: result.errorSummary || null,
    },
  });

  const testResult = await db.testResult.create({
    data: {
      testRunId: run.id,
      testId: test.id,
      testTitle: test.title,
      testType: test.type,
      status: result.status,
      browser: "chromium",
      durationMs: result.durationMs,
      errorMessage: result.errorSummary || null,
      stackTrace: result.stackTrace || null,
      stepResults: JSON.stringify(result.stepResults),
      metrics: JSON.stringify({
        consoleErrors: result.consoleErrors,
        networkFailures: result.networkFailures,
        visualComparison: result.visualComparison || null,
      }),
    },
  });

  // Save Artifacts to DB
  const createdArtifactMap = new Map<string, string>();
  for (const art of result.artifacts) {
    const dbArt = await db.artifact.create({
      data: {
        testRunId: run.id,
        testResultId: testResult.id,
        type: art.type,
        fileName: art.fileName,
        s3Key: art.filePath,
        s3Bucket: "local-storage",
        contentType: "image/png",
        sizeBytes: BigInt(art.sizeBytes),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });
    createdArtifactMap.set(art.type, dbArt.id);
  }

  // Update testResult with artifact IDs if visual comparison exists
  if (result.visualComparison) {
    const currentId = createdArtifactMap.get("VISUAL_CURRENT");
    const diffId = createdArtifactMap.get("VISUAL_DIFF");
    const updatedVisual = {
      ...result.visualComparison,
      currentArtifactId: currentId,
      diffArtifactId: diffId,
    };
    result.visualComparison = updatedVisual;

    await db.testResult.update({
      where: { id: testResult.id },
      data: {
        metrics: JSON.stringify({
          consoleErrors: result.consoleErrors,
          networkFailures: result.networkFailures,
          visualComparison: updatedVisual,
        }),
      },
    });
  }

  return {
    run: updatedRun,
    testResult,
    result,
  };
}
