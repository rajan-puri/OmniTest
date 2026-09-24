import {
  RunReport,
  ReportSummary,
  ReportTypeBreakdown,
  ReportFailureItem,
  ReportItem,
  TestEngineType,
  RunStatus,
} from "./report-types";
import { maskSensitiveHeaders } from "../runner/api-executor";
export { maskSensitiveHeaders };

/**
 * Formats milliseconds into human-readable duration string.
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return "0ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Maps raw engine type string to validated TestEngineType.
 */
function normalizeEngineType(rawType: string | null | undefined): TestEngineType {
  const upper = (rawType || "UI").toUpperCase();
  if (upper === "API") return "API";
  if (upper === "ACCESSIBILITY") return "ACCESSIBILITY";
  if (upper === "PERFORMANCE") return "PERFORMANCE";
  if (upper === "SEO") return "SEO";
  return "UI";
}

/**
 * Extracts a concise, human-readable failure reason based on test type and stored telemetry.
 */
function extractFailureReason(
  type: TestEngineType,
  errorMessage: string | null | undefined,
  metrics: any,
  stepResults: any[]
): { failureReason: string; detailsSnippet?: string } {
  if (type === "API") {
    if (metrics?.assertions && Array.isArray(metrics.assertions)) {
      const failed = metrics.assertions.filter((a: any) => !a.passed);
      if (failed.length > 0) {
        const first = failed[0];
        return {
          failureReason: first.message || `Assertion failed: expected ${first.expected}`,
          detailsSnippet: `${failed.length} of ${metrics.assertions.length} assertions failed`,
        };
      }
    }
    if (metrics?.statusCode) {
      return {
        failureReason: errorMessage || `HTTP Status ${metrics.statusCode} ${metrics.statusText || ""}`,
        detailsSnippet: `Response status: ${metrics.statusCode}`,
      };
    }
  }

  if (type === "ACCESSIBILITY") {
    if (metrics?.summary?.totalViolations !== undefined) {
      const crit = metrics.summary.critical || 0;
      const ser = metrics.summary.serious || 0;
      const mod = metrics.summary.moderate || 0;
      const summaryText = [
        crit > 0 ? `${crit} critical` : null,
        ser > 0 ? `${ser} serious` : null,
        mod > 0 ? `${mod} moderate` : null,
      ].filter(Boolean).join(", ");

      const ruleNames = Array.isArray(metrics.violations)
        ? metrics.violations.map((v: any) => v.id).slice(0, 3).join(", ")
        : "";

      return {
        failureReason: errorMessage || `${metrics.summary.totalViolations} accessibility violations found`,
        detailsSnippet: summaryText ? `${summaryText} (${ruleNames})` : undefined,
      };
    }
  }

  if (type === "PERFORMANCE") {
    if (Array.isArray(metrics?.thresholds)) {
      const breached = metrics.thresholds.filter((t: any) => !t.passed);
      if (breached.length > 0) {
        const first = breached[0];
        return {
          failureReason: errorMessage || `Performance threshold breached: ${first.metric.toUpperCase()}`,
          detailsSnippet: `${breached.length} threshold(s) failed (${first.metric.toUpperCase()}: ${first.actualValue}${first.unit || ""} vs target ${first.targetValue}${first.unit || ""})`,
        };
      }
    }
  }

  if (type === "SEO") {
    if (Array.isArray(metrics?.assertions)) {
      const failed = metrics.assertions.filter((a: any) => !a.passed);
      if (failed.length > 0) {
        return {
          failureReason: errorMessage || failed[0].description || "SEO assertion failed",
          detailsSnippet: `${failed.length} of ${metrics.assertions.length} SEO assertions breached`,
        };
      }
    }
  }

  // Visual regression failure check
  if (metrics?.visualComparison?.status === "FAILED") {
    const diffPct = metrics.visualComparison.metrics?.differencePercentage ?? "unknown";
    const thresholdPct = metrics.visualComparison.metrics?.thresholdPercentage ?? "unknown";
    const changed = metrics.visualComparison.metrics?.changedPixels?.toLocaleString() ?? "";
    return {
      failureReason: errorMessage || `Visual regression difference (${diffPct}%) exceeded threshold (${thresholdPct}%)`,
      detailsSnippet: `${changed} changed pixels out of ${metrics.visualComparison.metrics?.totalPixels?.toLocaleString() || "total"}`,
    };
  }
  if (metrics?.visualComparison?.status === "DIMENSION_MISMATCH") {
    return {
      failureReason: errorMessage || "Visual regression dimension mismatch with baseline",
      detailsSnippet: `${metrics.visualComparison.metrics?.currentWidth}x${metrics.visualComparison.metrics?.currentHeight} vs baseline ${metrics.visualComparison.metrics?.baselineWidth}x${metrics.visualComparison.metrics?.baselineHeight}`,
    };
  }

  // Default UI / Playwright step failure
  if (Array.isArray(stepResults)) {
    const failedStep = stepResults.find((s: any) => s.status === "FAILED");
    if (failedStep) {
      return {
        failureReason: failedStep.errorMessage || `Step failed: ${failedStep.action || "unknown"}`,
        detailsSnippet: `Step ${failedStep.stepId || ""} (${failedStep.action || ""})`,
      };
    }
  }

  return {
    failureReason: errorMessage || "Test execution failed without a detailed error message.",
  };
}

/**
 * Cleanses and redacts sensitive data (API keys, authorization headers, passwords) from metrics.
 */
function sanitizeMetrics(metrics: any): any {
  if (!metrics || typeof metrics !== "object") return metrics;
  const clone = JSON.parse(JSON.stringify(metrics));

  if (clone.request?.headers && typeof clone.request.headers === "object") {
    clone.request.headers = maskSensitiveHeaders(clone.request.headers);
  }
  if (clone.response?.headers && typeof clone.response.headers === "object") {
    clone.response.headers = maskSensitiveHeaders(clone.response.headers);
  }
  if (clone.requestHeaders && typeof clone.requestHeaders === "object") {
    clone.requestHeaders = maskSensitiveHeaders(clone.requestHeaders);
  }
  if (clone.responseHeaders && typeof clone.responseHeaders === "object") {
    clone.responseHeaders = maskSensitiveHeaders(clone.responseHeaders);
  }

  return clone;
}

/**
 * Deterministically compiles a RunReport from a TestRun and its associated TestResults.
 */
export function generateRunReport(testRun: any): RunReport {
  const isRunning = testRun.status === "RUNNING" || testRun.status === "QUEUED";

  // Calculate elapsed or completed duration
  let durationMs = testRun.durationMs || 0;
  if (!durationMs && testRun.startedAt) {
    const end = testRun.completedAt ? new Date(testRun.completedAt).getTime() : Date.now();
    durationMs = Math.max(0, end - new Date(testRun.startedAt).getTime());
  }

  const rawResults: any[] = Array.isArray(testRun.testResults) ? testRun.testResults : [];

  let passedTests = 0;
  let failedTests = 0;
  let errorTests = 0;
  let skippedTests = 0;

  const items: ReportItem[] = [];
  const failures: ReportFailureItem[] = [];
  const errors: ReportFailureItem[] = [];

  const typeMap: Record<
    TestEngineType,
    { total: number; passed: number; failed: number; errors: number; skipped: number }
  > = {
    UI: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
    API: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
    ACCESSIBILITY: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
    PERFORMANCE: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
    SEO: { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 },
  };

  for (const r of rawResults) {
    const type = normalizeEngineType(r.testType);
    const status = (r.status || "PASSED").toUpperCase();
    const duration = r.durationMs || 0;

    let parsedMetrics: any = {};
    try {
      parsedMetrics = typeof r.metrics === "string" ? JSON.parse(r.metrics) : r.metrics || {};
    } catch {}

    let parsedStepResults: any[] = [];
    try {
      parsedStepResults = typeof r.stepResults === "string" ? JSON.parse(r.stepResults) : r.stepResults || [];
    } catch {}

    const sanitized = sanitizeMetrics(parsedMetrics);

    // Assertions summary tally
    let assertionsSummary: { total: number; passed: number; failed: number } | undefined;
    if (Array.isArray(sanitized.assertions)) {
      const total = sanitized.assertions.length;
      const passed = sanitized.assertions.filter((a: any) => a.passed).length;
      assertionsSummary = { total, passed, failed: total - passed };
    } else if (Array.isArray(sanitized.thresholds)) {
      const total = sanitized.thresholds.length;
      const passed = sanitized.thresholds.filter((t: any) => t.passed).length;
      assertionsSummary = { total, passed, failed: total - passed };
    }

    typeMap[type].total++;

    if (status === "PASSED") {
      passedTests++;
      typeMap[type].passed++;
    } else if (status === "SKIPPED") {
      skippedTests++;
      typeMap[type].skipped++;
    } else if (status === "TIMED_OUT" || status === "ERROR") {
      errorTests++;
      typeMap[type].errors++;
      errors.push({
        testId: r.testId || null,
        testResultId: r.id,
        title: r.testTitle || "Untitled Test",
        type,
        status,
        durationMs: duration,
        formattedDuration: formatDuration(duration),
        failureReason: r.errorMessage || "Execution timed out or aborted by runtime.",
        detailsSnippet: "Runtime execution failure",
        hasArtifacts: Array.isArray(r.artifacts) && r.artifacts.length > 0,
      });
    } else {
      // FAILED
      failedTests++;
      typeMap[type].failed++;

      const { failureReason, detailsSnippet } = extractFailureReason(
        type,
        r.errorMessage,
        sanitized,
        parsedStepResults
      );

      failures.push({
        testId: r.testId || null,
        testResultId: r.id,
        title: r.testTitle || "Untitled Test",
        type,
        status: "FAILED",
        durationMs: duration,
        formattedDuration: formatDuration(duration),
        failureReason,
        detailsSnippet,
        hasArtifacts: Array.isArray(r.artifacts) && r.artifacts.length > 0,
      });
    }

    items.push({
      id: r.id,
      testId: r.testId || null,
      title: r.testTitle || "Untitled Test",
      type,
      status: status as any,
      durationMs: duration,
      formattedDuration: formatDuration(duration),
      errorMessage: r.errorMessage || null,
      assertionsSummary,
      metrics: sanitized,
      artifactsCount: Array.isArray(r.artifacts) ? r.artifacts.length : 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    });
  }

  const totalTests = rawResults.length || testRun.totalTests || 0;
  const completedTests = passedTests + failedTests + errorTests;
  // Pass rate: passed / completed tests (documented deterministic formula)
  const passRate = completedTests > 0 ? Math.round((passedTests / completedTests) * 1000) / 10 : 0;

  const breakdown: ReportTypeBreakdown[] = (
    [
      { type: "UI", label: "Browser UI" },
      { type: "API", label: "REST API" },
      { type: "ACCESSIBILITY", label: "Accessibility" },
      { type: "PERFORMANCE", label: "Performance" },
      { type: "SEO", label: "Technical SEO" },
    ] as const
  )
    .map(({ type, label }) => {
      const stats = typeMap[type];
      const typeCompleted = stats.passed + stats.failed + stats.errors;
      const typePassRate = typeCompleted > 0 ? Math.round((stats.passed / typeCompleted) * 1000) / 10 : 0;
      return {
        type,
        label,
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
        errors: stats.errors,
        skipped: stats.skipped,
        passRate: typePassRate,
      };
    })
    .filter((b) => b.total > 0 || !isRunning); // Keep relevant or all when idle

  const summary: ReportSummary = {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    skippedTests,
    passRate,
    durationMs,
    formattedDuration: formatDuration(durationMs),
    startedAt: testRun.startedAt ? new Date(testRun.startedAt).toISOString() : null,
    completedAt: testRun.completedAt ? new Date(testRun.completedAt).toISOString() : null,
    isRunning,
    generatedAt: new Date().toISOString(),
  };

  return {
    id: `rep_${testRun.id}`,
    testRunId: testRun.id,
    project: {
      id: testRun.project?.id || testRun.projectId,
      name: testRun.project?.name || "Project",
      slug: testRun.project?.slug || "project",
      baseUrl: testRun.project?.baseUrl || null,
    },
    suite: testRun.suite
      ? {
          id: testRun.suite.id,
          name: testRun.suite.name,
        }
      : null,
    status: (testRun.status || "QUEUED") as RunStatus,
    trigger: testRun.trigger || "MANUAL",
    environment: testRun.environment || "staging",
    targetUrl: testRun.targetUrl || "",
    gitCommitHash: testRun.gitCommitHash || null,
    gitBranch: testRun.gitBranch || null,
    summary,
    breakdown,
    failures,
    errors,
    items,
  };
}
