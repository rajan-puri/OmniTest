import fs from "fs";
import path from "path";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import {
  PerformanceTestSpec,
  PerformanceExecutionResult,
  SingleRunMetrics,
  PerformanceVitals,
  PerformancePageMetrics,
  PerformanceNetworkMetrics,
  ThresholdEvaluationResult,
  PerformanceThreshold,
} from "./perf-types";
import { checkUrlSecurity } from "./api-executor";

export interface PerformanceExecutionOptions {
  runId: string;
  artifactDir: string;
  publicUrlPrefix?: string;
  baseUrl?: string;
}

/**
 * Calculates the mathematical median of an array of numbers.
 */
function calculateMedian(values: (number | null)[]): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number" && !isNaN(v));
  if (filtered.length === 0) return null;
  filtered.sort((a, b) => a - b);
  const mid = Math.floor(filtered.length / 2);
  if (filtered.length % 2 === 0) {
    return Math.round(((filtered[mid - 1] + filtered[mid]) / 2) * 100) / 100;
  }
  return Math.round(filtered[mid] * 100) / 100;
}

/**
 * Evaluates configured thresholds against measured performance metrics.
 */
export function evaluateThresholds(
  thresholds: PerformanceThreshold[],
  vitals: PerformanceVitals,
  pageMetrics: PerformancePageMetrics,
  network: PerformanceNetworkMetrics
): { results: ThresholdEvaluationResult[]; allPassed: boolean } {
  const results: ThresholdEvaluationResult[] = [];
  let allPassed = true;

  for (const t of thresholds) {
    let actualValue: number | null = null;

    switch (t.metric) {
      case "lcp":
        actualValue = vitals.lcp;
        break;
      case "cls":
        actualValue = vitals.cls;
        break;
      case "fcp":
        actualValue = pageMetrics.fcp;
        break;
      case "ttfb":
        actualValue = pageMetrics.ttfb;
        break;
      case "domContentLoaded":
        actualValue = pageMetrics.domContentLoaded;
        break;
      case "loadEvent":
        actualValue = pageMetrics.loadEvent;
        break;
      case "totalLoad":
        actualValue = pageMetrics.totalLoad;
        break;
      case "failedRequests":
        actualValue = network.failedRequests;
        break;
    }

    let passed = false;
    let message = "";

    if (actualValue === null) {
      passed = false;
      message = `${t.metric.toUpperCase()} metric was unavailable for threshold comparison.`;
      allPassed = false;
    } else {
      switch (t.operator) {
        case "lt":
          passed = actualValue < t.targetValue;
          break;
        case "lte":
          passed = actualValue <= t.targetValue;
          break;
        case "gt":
          passed = actualValue > t.targetValue;
          break;
        case "gte":
          passed = actualValue >= t.targetValue;
          break;
        case "eq":
          passed = actualValue === t.targetValue;
          break;
      }

      if (!passed) allPassed = false;

      const opSymbol =
        t.operator === "lt"
          ? "<"
          : t.operator === "lte"
          ? "<="
          : t.operator === "gt"
          ? ">"
          : t.operator === "gte"
          ? ">="
          : "==";

      const unitLabel = t.unit === "ms" ? "ms" : t.unit === "score" ? "" : " requests";
      message = `${t.metric.toUpperCase()}: ${actualValue}${unitLabel} ${opSymbol} ${t.targetValue}${unitLabel} (${
        passed ? "PASS" : "FAIL"
      })`;
    }

    results.push({
      metric: t.metric,
      operator: t.operator,
      targetValue: t.targetValue,
      actualValue,
      unit: t.unit,
      passed,
      message,
    });
  }

  return { results, allPassed };
}

/**
 * Runs a single browser navigation to capture real browser performance entries.
 */
async function runSingleMeasurement(
  browser: Browser,
  resolvedUrl: string,
  device: "desktop" | "mobile",
  timeoutMs: number,
  captureScreenshotPath?: string
): Promise<SingleRunMetrics> {
  const isMobile = device === "mobile";
  const context = await browser.newContext({
    viewport: isMobile ? { width: 390, height: 844 } : { width: 1280, height: 720 },
    userAgent: isMobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
      : undefined,
    isMobile,
    hasTouch: isMobile,
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(timeoutMs);

  // Track network requests and failed requests
  let requestCount = 0;
  let failedRequestCount = 0;
  let totalBytesTransferred = 0;

  const resourceMap: Record<"javascript" | "css" | "images" | "fonts" | "other", { count: number; bytes: number }> = {
    javascript: { count: 0, bytes: 0 },
    css: { count: 0, bytes: 0 },
    images: { count: 0, bytes: 0 },
    fonts: { count: 0, bytes: 0 },
    other: { count: 0, bytes: 0 },
  };

  page.on("request", (req) => {
    requestCount++;
    const type = req.resourceType();
    if (type === "script") resourceMap.javascript.count++;
    else if (type === "stylesheet") resourceMap.css.count++;
    else if (type === "image") resourceMap.images.count++;
    else if (type === "font") resourceMap.fonts.count++;
    else resourceMap.other.count++;
  });

  page.on("requestfailed", () => {
    failedRequestCount++;
  });

  page.on("response", async (res) => {
    try {
      if (res.status() >= 400) {
        failedRequestCount++;
      }
      const headers = res.headers();
      const contentLength = headers["content-length"];
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        if (!isNaN(bytes) && bytes > 0) {
          totalBytesTransferred += bytes;
          const reqType = res.request().resourceType();
          if (reqType === "script") resourceMap.javascript.bytes += bytes;
          else if (reqType === "stylesheet") resourceMap.css.bytes += bytes;
          else if (reqType === "image") resourceMap.images.bytes += bytes;
          else if (reqType === "font") resourceMap.fonts.bytes += bytes;
          else resourceMap.other.bytes += bytes;
        }
      }
    } catch {
      // Safe non-blocking header read
    }
  });

  // Inject performance observer to reliably capture LCP, CLS, and FCP
  await page.addInitScript(() => {
    (window as any).__omnitest_vitals = {
      lcp: null,
      cls: 0,
      fcp: null,
    };

    // Layout Shift Observer (CLS)
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            (window as any).__omnitest_vitals.cls += (entry as any).value || 0;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {}

    // Largest Contentful Paint Observer (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          (window as any).__omnitest_vitals.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}

    // Paint Observer (FCP)
    try {
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            (window as any).__omnitest_vitals.fcp = entry.startTime;
          }
        }
      });
      paintObserver.observe({ type: "paint", buffered: true });
    } catch {}
  });

  try {
    // Navigate to target URL
    await page.goto(resolvedUrl, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    // Wait for full load state if possible, without blocking indefinitely on hung subresources
    await page.waitForLoadState("load", { timeout: 4000 }).catch(() => {});

    // Brief stabilization window to ensure paint and layout-shift observers flush entries
    await page.waitForTimeout(500);

    // Optional visual screenshot capture
    if (captureScreenshotPath) {
      try {
        await page.screenshot({ path: captureScreenshotPath, fullPage: false });
      } catch {
        // Non-blocking screenshot failure
      }
    }

    // Extract real browser performance metrics
    const rawMetrics: any = await page.evaluate(() => {
      const vitals = (window as any).__omnitest_vitals || { lcp: null, cls: 0, fcp: null };

      // Navigation Timing API Level 2
      const navEntries = window.performance.getEntriesByType("navigation");
      const nav = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming) : null;

      // Fallback to legacy performance.timing if needed
      const legacy = window.performance.timing;

      let ttfb: number | null = null;
      let domContentLoaded: number | null = null;
      let loadEvent: number | null = null;
      let totalLoad: number | null = null;
      let navTransferSize: number = 0;

      if (nav) {
        ttfb = nav.responseStart > 0 ? Math.round(nav.responseStart - nav.requestStart) : null;
        if (ttfb === null || ttfb < 0) {
          ttfb = nav.responseStart > 0 ? Math.round(nav.responseStart) : null;
        }
        domContentLoaded =
          nav.domContentLoadedEventEnd > 0 ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null;
        loadEvent = nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd - nav.startTime) : null;
        totalLoad = nav.duration > 0 ? Math.round(nav.duration) : null;
        navTransferSize = nav.transferSize || 0;
      } else if (legacy && legacy.navigationStart) {
        const start = legacy.navigationStart;
        ttfb = legacy.responseStart > 0 ? Math.max(0, legacy.responseStart - legacy.requestStart) : null;
        domContentLoaded =
          legacy.domContentLoadedEventEnd > 0 ? Math.max(0, legacy.domContentLoadedEventEnd - start) : null;
        loadEvent = legacy.loadEventEnd > 0 ? Math.max(0, legacy.loadEventEnd - start) : null;
        totalLoad = legacy.loadEventEnd > 0 ? Math.max(0, legacy.loadEventEnd - start) : null;
      }

      // Check paint entries if FCP was not captured by observer
      if (vitals.fcp === null) {
        const paints = window.performance.getEntriesByType("paint");
        for (const p of paints) {
          if (p.name === "first-contentful-paint") {
            vitals.fcp = p.startTime;
            break;
          }
        }
      }

      // Resource API summaries for transfer size fallback
      let resourceApiBytes = 0;
      try {
        const resources = window.performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        for (const r of resources) {
          if (r.transferSize && r.transferSize > 0) {
            resourceApiBytes += r.transferSize;
          }
        }
      } catch {}

      return {
        lcp: vitals.lcp !== null ? Math.round(vitals.lcp) : null,
        cls: Math.round(vitals.cls * 1000) / 1000,
        fcp: vitals.fcp !== null ? Math.round(vitals.fcp) : null,
        ttfb,
        domContentLoaded,
        loadEvent,
        totalLoad,
        navTransferSize,
        resourceApiBytes,
      };
    });

    // If Playwright response headers didn't capture full transfer size, blend with browser Resource API bytes
    if (rawMetrics.navTransferSize && totalBytesTransferred === 0) {
      totalBytesTransferred = rawMetrics.navTransferSize + rawMetrics.resourceApiBytes;
    }

    return {
      vitals: {
        lcp: rawMetrics.lcp,
        cls: rawMetrics.cls,
        inp: null, // INP is unavailable in synthetic non-interactive automated page loads
        inpAvailable: false,
      },
      pageMetrics: {
        fcp: rawMetrics.fcp,
        ttfb: rawMetrics.ttfb,
        domContentLoaded: rawMetrics.domContentLoaded,
        loadEvent: rawMetrics.loadEvent,
        totalLoad: rawMetrics.totalLoad,
      },
      network: {
        totalRequests: requestCount,
        failedRequests: failedRequestCount,
        totalBytesTransferred,
        resources: resourceMap,
      },
    };
  } finally {
    await context.close().catch(() => {});
  }
}

/**
 * Main execution function for automated web performance testing.
 */
export async function executePerformanceTest(
  spec: PerformanceTestSpec,
  options?: Partial<PerformanceExecutionOptions>
): Promise<PerformanceExecutionResult> {
  const startTime = Date.now();
  const runId = options?.runId || `perf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const artifactDir = options?.artifactDir || path.join(process.cwd(), "public", "artifacts", "runs");
  const runArtifactDir = path.join(artifactDir, runId);
  fs.mkdirSync(runArtifactDir, { recursive: true });

  const publicPrefix = options?.publicUrlPrefix || `/artifacts/runs/${runId}`;

  // 1. Resolve URL
  let resolvedUrl = spec.url;
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    if (options?.baseUrl) {
      resolvedUrl = new URL(resolvedUrl, options.baseUrl).toString();
    } else {
      throw new Error(`Relative URL "${spec.url}" provided without a configured project Base URL.`);
    }
  }

  // 2. Security SSRF Check
  checkUrlSecurity(resolvedUrl);

  const device = spec.device || "desktop";
  const timeoutMs = (spec.timeoutSeconds || 30) * 1000;
  const warmupRuns = spec.warmupRuns || 0;
  const measurementRuns = spec.measurementRuns || 1;

  let browser: Browser | null = null;
  let screenshotUrl: string | undefined;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    // 3. Optional Warmup Run
    if (warmupRuns > 0) {
      await runSingleMeasurement(browser, resolvedUrl, device, timeoutMs);
    }

    // 4. Measurement Runs
    const rawRuns: SingleRunMetrics[] = [];
    const screenshotFileName = `perf_scan_${runId.slice(0, 8)}.png`;
    const screenshotPath = path.join(runArtifactDir, screenshotFileName);

    for (let r = 0; r < measurementRuns; r++) {
      // Capture screenshot on the first measurement run
      const capturePath = r === 0 ? screenshotPath : undefined;
      const runMetric = await runSingleMeasurement(browser, resolvedUrl, device, timeoutMs, capturePath);
      rawRuns.push(runMetric);
      if (r === 0 && fs.existsSync(screenshotPath)) {
        screenshotUrl = `${publicPrefix}/${screenshotFileName}`;
      }
    }

    // 5. Aggregate metrics (Median of measurement runs)
    const aggregatedVitals: PerformanceVitals = {
      lcp: calculateMedian(rawRuns.map((r) => r.vitals.lcp)),
      cls: calculateMedian(rawRuns.map((r) => r.vitals.cls)),
      inp: null,
      inpAvailable: false,
    };

    const aggregatedPageMetrics: PerformancePageMetrics = {
      fcp: calculateMedian(rawRuns.map((r) => r.pageMetrics.fcp)),
      ttfb: calculateMedian(rawRuns.map((r) => r.pageMetrics.ttfb)),
      domContentLoaded: calculateMedian(rawRuns.map((r) => r.pageMetrics.domContentLoaded)),
      loadEvent: calculateMedian(rawRuns.map((r) => r.pageMetrics.loadEvent)),
      totalLoad: calculateMedian(rawRuns.map((r) => r.pageMetrics.totalLoad)),
    };

    // Aggregate network metrics from the representative run
    const representative = rawRuns[0];
    const aggregatedNetwork: PerformanceNetworkMetrics = {
      totalRequests: representative.network.totalRequests,
      failedRequests: representative.network.failedRequests,
      totalBytesTransferred: representative.network.totalBytesTransferred,
      resources: representative.network.resources,
    };

    // 6. Evaluate deterministic thresholds
    const thresholds = spec.thresholds || [];
    const { results: thresholdResults, allPassed } = evaluateThresholds(
      thresholds,
      aggregatedVitals,
      aggregatedPageMetrics,
      aggregatedNetwork
    );

    const overallStatus: "PASSED" | "FAILED" = allPassed ? "PASSED" : "FAILED";
    const durationMs = Date.now() - startTime;

    let errorSummary: string | undefined;
    if (!allPassed) {
      const failedRules = thresholdResults.filter((t) => !t.passed);
      errorSummary = `${failedRules.length} performance threshold${
        failedRules.length === 1 ? "" : "s"
      } breached: ${failedRules.map((f) => f.message).join("; ")}`;
    }

    const methodology =
      measurementRuns > 1
        ? `Aggregated median across ${measurementRuns} automated headless Chromium runs (${device} viewport).`
        : `Single automated headless Chromium measurement run (${device} viewport).`;

    return {
      status: overallStatus,
      durationMs,
      url: resolvedUrl,
      timestamp: new Date().toISOString(),
      device,
      runsCount: measurementRuns,
      vitals: aggregatedVitals,
      pageMetrics: aggregatedPageMetrics,
      network: aggregatedNetwork,
      thresholds: thresholdResults,
      rawRuns: measurementRuns > 1 ? rawRuns : undefined,
      screenshotUrl,
      errorSummary,
      methodology,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.toLowerCase().includes("timeout");

    return {
      status: isTimeout ? "TIMED_OUT" : "FAILED",
      durationMs,
      url: resolvedUrl,
      timestamp: new Date().toISOString(),
      device,
      runsCount: 0,
      vitals: { lcp: null, cls: null, inp: null, inpAvailable: false },
      pageMetrics: { fcp: null, ttfb: null, domContentLoaded: null, loadEvent: null, totalLoad: null },
      network: {
        totalRequests: 0,
        failedRequests: 0,
        totalBytesTransferred: 0,
        resources: {
          javascript: { count: 0, bytes: 0 },
          css: { count: 0, bytes: 0 },
          images: { count: 0, bytes: 0 },
          fonts: { count: 0, bytes: 0 },
          other: { count: 0, bytes: 0 },
        },
      },
      thresholds: [],
      screenshotUrl,
      errorSummary: `Performance audit failed: ${message}`,
      methodology: "Execution terminated prematurely due to failure.",
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
