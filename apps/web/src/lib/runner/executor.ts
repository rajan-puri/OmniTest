import { chromium, Browser, BrowserContext, Page } from "playwright";
import fs from "fs";
import path from "path";
import {
  TestSpec,
  TestExecutionResult,
  StepExecutionResult,
  ConsoleErrorRecord,
  NetworkFailureRecord,
  CapturedArtifact,
} from "./types";
import { compareScreenshots } from "../visual/visual-comparator";
import { VisualComparisonResult } from "../visual/visual-types";

export interface ExecutionOptions {
  runId: string;
  artifactDir: string;
  publicUrlPrefix?: string;
  baseUrl?: string;
  baselinePath?: string;
  baselineUrl?: string;
  testId?: string;
}

export async function executePlaywrightTest(
  spec: TestSpec,
  options: ExecutionOptions
): Promise<TestExecutionResult> {
  const startTime = Date.now();
  const consoleErrors: ConsoleErrorRecord[] = [];
  const networkFailures: NetworkFailureRecord[] = [];
  const artifacts: CapturedArtifact[] = [];
  const stepResults: StepExecutionResult[] = [];
  let visualComparison: VisualComparisonResult | undefined;

  // Ensure artifact directory exists
  const runArtifactDir = path.join(options.artifactDir, options.runId);
  fs.mkdirSync(runArtifactDir, { recursive: true });

  const publicPrefix = options.publicUrlPrefix || `/artifacts/runs/${options.runId}`;

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  let overallStatus: "PASSED" | "FAILED" | "TIMED_OUT" = "PASSED";
  let failureErrorSummary: string | undefined;
  let failureStackTrace: string | undefined;

  try {
    // Launch headless Chromium
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    context = await browser.newContext({
      viewport: spec.viewport || { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();
    page.setDefaultTimeout((spec.timeoutSeconds || 30) * 1000);

    // 1. Listen for browser console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location().url,
          timestamp: new Date().toISOString(),
        });
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push({
        text: err.message,
        location: err.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // 2. Listen for network failures
    page.on("requestfailed", (request) => {
      networkFailures.push({
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText || "Request failed",
        timestamp: new Date().toISOString(),
      });
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        networkFailures.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          errorText: `HTTP ${response.status()} ${response.statusText()}`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 3. Sequential Step Execution
    let hasFailed = false;

    for (let i = 0; i < spec.steps.length; i++) {
      const step = spec.steps[i];

      if (hasFailed) {
        stepResults.push({
          stepId: step.id,
          action: step.action,
          status: "SKIPPED",
          durationMs: 0,
        });
        continue;
      }

      const stepStart = Date.now();
      let stepStatus: "PASSED" | "FAILED" = "PASSED";
      let stepError: string | undefined;
      let stepScreenshotUrl: string | undefined;

      try {
        const timeout = step.options?.timeoutMs || 10000;

        switch (step.action) {
          case "goto": {
            let targetUrl = step.target!;
            if (options.baseUrl && !targetUrl.startsWith("http")) {
              targetUrl = new URL(targetUrl, options.baseUrl).toString();
            }
            await page.goto(targetUrl, {
              timeout,
              waitUntil: "domcontentloaded",
            });
            break;
          }

          case "click": {
            await page.locator(step.target!).click({ timeout });
            break;
          }

          case "fill": {
            await page.locator(step.target!).fill(step.value ?? "", { timeout });
            break;
          }

          case "press": {
            await page.keyboard.press(step.target!);
            break;
          }

          case "wait": {
            const duration = Number(step.target);
            if (!isNaN(duration)) {
              await page.waitForTimeout(duration);
            } else {
              await page.waitForSelector(step.target!, {
                state: step.options?.state || "visible",
                timeout,
              });
            }
            break;
          }

          case "screenshot": {
            const fileName = step.value ? `${step.value}.png` : `screenshot_${step.id}.png`;
            const filePath = path.join(runArtifactDir, fileName);
            await page.screenshot({
              path: filePath,
              fullPage: step.options?.fullPage ?? false,
            });
            const stats = fs.statSync(filePath);
            stepScreenshotUrl = `${publicPrefix}/${fileName}`;

            artifacts.push({
              type: "SCREENSHOT",
              fileName,
              filePath,
              url: stepScreenshotUrl,
              sizeBytes: stats.size,
            });
            break;
          }

          case "assert_url": {
            const expected = step.target || step.value || "";
            const currentUrl = page.url();
            if (!currentUrl.includes(expected)) {
              throw new Error(
                `Expected URL to contain "${expected}", but actual URL was "${currentUrl}".`
              );
            }
            break;
          }

          case "assert_text": {
            const locator = page.locator(step.target!);
            await locator.waitFor({ state: "visible", timeout });
            const actualText = (await locator.innerText({ timeout })).trim();
            const expected = (step.value ?? "").trim();
            if (!actualText.includes(expected)) {
              throw new Error(
                `Element "${step.target}" expected to contain text "${expected}", but got "${actualText}".`
              );
            }
            break;
          }

          case "assert_visible": {
            const locator = page.locator(step.target!);
            await locator.waitFor({
              state: step.options?.state || "visible",
              timeout,
            });
            const isVisible = await locator.isVisible({ timeout });
            if (!isVisible) {
              throw new Error(`Element "${step.target}" was expected to be visible, but was not.`);
            }
            break;
          }
        }
      } catch (err: unknown) {
        stepStatus = "FAILED";
        hasFailed = true;
        overallStatus = "FAILED";
        const message = err instanceof Error ? err.message : String(err);
        stepError = message;
        failureErrorSummary = `Step ${i + 1} (${step.action}) failed: ${message}`;
        failureStackTrace = err instanceof Error ? err.stack : undefined;

        // Automatically capture failure evidence screenshot
        try {
          if (page) {
            const failureFileName = `failure_${step.id}.png`;
            const failureFilePath = path.join(runArtifactDir, failureFileName);
            await page.screenshot({ path: failureFilePath, fullPage: true });
            const stats = fs.statSync(failureFilePath);
            const failureUrl = `${publicPrefix}/${failureFileName}`;
            stepScreenshotUrl = failureUrl;

            artifacts.push({
              type: "SCREENSHOT",
              fileName: failureFileName,
              filePath: failureFilePath,
              url: failureUrl,
              sizeBytes: stats.size,
            });
          }
        } catch {
          // Ignore secondary screenshot capture failure
        }
      } finally {
        stepResults.push({
          stepId: step.id,
          action: step.action,
          status: stepStatus,
          durationMs: Date.now() - stepStart,
          errorMessage: stepError,
          screenshotUrl: stepScreenshotUrl,
        });
      }
    }

    // 4. Visual Regression Comparison if enabled
    if (spec.visualRegression?.enabled && page && !page.isClosed() && !hasFailed) {
      try {
        if (spec.visualRegression.disableAnimations !== false) {
          await page.addStyleTag({
            content: `
              *, *::before, *::after {
                -moz-transition: none !important;
                transition: none !important;
                -moz-animation: none !important;
                animation: none !important;
                caret-color: transparent !important;
              }
            `,
          }).catch(() => {});
        }

        // Dynamically resolve ignore selectors to bounding boxes
        const dynamicIgnoreRegions = [...(spec.visualRegression.ignoreRegions || [])];
        if (spec.visualRegression.ignoreSelectors && Array.isArray(spec.visualRegression.ignoreSelectors)) {
          for (const sel of spec.visualRegression.ignoreSelectors) {
            try {
              const locator = page.locator(sel).first();
              const box = await locator.boundingBox({ timeout: 2000 });
              if (box) {
                dynamicIgnoreRegions.push({
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                  label: sel,
                });
              }
            } catch {}
          }
        }

        const currentFileName = `visual_current_${options.runId.slice(0, 8)}.png`;
        const currentFilePath = path.join(runArtifactDir, currentFileName);
        const isFullPage = spec.visualRegression.screenshotMode === "fullPage";

        await page.screenshot({
          path: currentFilePath,
          fullPage: isFullPage,
        });

        const currentStats = fs.statSync(currentFilePath);
        const currentUrl = `${publicPrefix}/${currentFileName}`;

        artifacts.push({
          type: "VISUAL_CURRENT",
          fileName: currentFileName,
          filePath: currentFilePath,
          url: currentUrl,
          sizeBytes: currentStats.size,
        });

        const currentBuffer = fs.readFileSync(currentFilePath);

        if (options.baselinePath && fs.existsSync(options.baselinePath)) {
          const baselineBuffer = fs.readFileSync(options.baselinePath);
          const compResult = compareScreenshots(baselineBuffer, currentBuffer, {
            ...spec.visualRegression,
            ignoreRegions: dynamicIgnoreRegions,
          });

          let diffUrl: string | undefined;

          if (compResult.diffBuffer) {
            const diffFileName = `visual_diff_${options.runId.slice(0, 8)}.png`;
            const diffFilePath = path.join(runArtifactDir, diffFileName);
            fs.writeFileSync(diffFilePath, compResult.diffBuffer);
            diffUrl = `${publicPrefix}/${diffFileName}`;

            artifacts.push({
              type: "VISUAL_DIFF",
              fileName: diffFileName,
              filePath: diffFilePath,
              url: diffUrl,
              sizeBytes: compResult.diffBuffer.length,
            });
          }

          visualComparison = {
            status: compResult.status,
            metrics: compResult.metrics,
            baselineUrl: options.baselineUrl,
            currentUrl,
            diffUrl,
            errorMessage: compResult.errorMessage,
            viewport: spec.visualRegression.viewport || spec.viewport || { width: 1280, height: 720 },
            screenshotMode: isFullPage ? "fullPage" : "viewport",
            createdAt: new Date().toISOString(),
          };

          if (!compResult.passed) {
            overallStatus = "FAILED";
            if (!failureErrorSummary) {
              failureErrorSummary = compResult.errorMessage || `Visual regression difference exceeded threshold of ${spec.visualRegression.threshold}%.`;
            }
          }
        } else {
          // No baseline exists yet
          visualComparison = {
            status: "NO_BASELINE",
            currentUrl,
            viewport: spec.visualRegression.viewport || spec.viewport || { width: 1280, height: 720 },
            screenshotMode: isFullPage ? "fullPage" : "viewport",
            createdAt: new Date().toISOString(),
          };
        }
      } catch (visErr: unknown) {
        console.error("Visual regression execution error:", visErr);
      }
    }
  } catch (err: unknown) {
    overallStatus = "FAILED";
    failureErrorSummary = err instanceof Error ? err.message : String(err);
    failureStackTrace = err instanceof Error ? err.stack : undefined;
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  const durationMs = Date.now() - startTime;
  const passedSteps = stepResults.filter((s) => s.status === "PASSED").length;
  const failedSteps = stepResults.filter((s) => s.status === "FAILED").length;

  return {
    status: overallStatus,
    durationMs,
    totalSteps: spec.steps.length,
    passedSteps,
    failedSteps,
    stepResults,
    consoleErrors,
    networkFailures,
    artifacts,
    visualComparison,
    errorSummary: failureErrorSummary,
    stackTrace: failureStackTrace,
  };
}
