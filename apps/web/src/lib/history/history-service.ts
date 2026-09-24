import { db } from "../db";
import {
  TestHistoryFilter,
  TestHistoryItem,
  TestHistoryResponse,
  TestHistorySummary,
  TestTrendMetrics,
  TestDurationTrendPoint,
  TestActivityPoint,
  RunComparisonResult,
} from "./history-types";

/**
 * Builds Prisma where filter for TestResult history
 */
function buildHistoryWhere(projectId: string, filter: TestHistoryFilter) {
  const where: any = {
    testRun: {
      projectId,
    },
  };

  if (filter.testId) {
    where.testId = filter.testId;
  }

  if (filter.status && filter.status !== "ALL") {
    where.status = filter.status.toUpperCase();
  }

  if (filter.testType && filter.testType !== "ALL") {
    where.testType = filter.testType.toUpperCase();
  }

  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim();
    where.OR = [
      { testTitle: { contains: q } },
      { testRun: { gitCommitHash: { contains: q } } },
      { testRun: { gitBranch: { contains: q } } },
      { testRun: { targetUrl: { contains: q } } },
    ];
  }

  // Date filtering
  const now = new Date();
  if (filter.dateRange === "today") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    where.createdAt = { gte: startOfToday };
  } else if (filter.dateRange === "7d") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: sevenDaysAgo };
  } else if (filter.dateRange === "30d") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: thirtyDaysAgo };
  } else if (filter.dateRange === "custom" && (filter.startDate || filter.endDate)) {
    where.createdAt = {};
    if (filter.startDate) {
      where.createdAt.gte = new Date(filter.startDate);
    }
    if (filter.endDate) {
      where.createdAt.lte = new Date(filter.endDate);
    }
  }

  return where;
}

/**
 * Computes deterministic flakiness score (0-100) based on status flip rate between consecutive executions
 */
export function calculateFlakiness(statuses: string[]): number {
  if (statuses.length < 2) return 0;
  let flips = 0;
  for (let i = 0; i < statuses.length - 1; i++) {
    const curr = statuses[i];
    const next = statuses[i + 1];
    const currFail = curr === "FAILED" || curr === "TIMED_OUT";
    const nextFail = next === "FAILED" || next === "TIMED_OUT";
    if (currFail !== nextFail) {
      flips++;
    }
  }
  const flipRate = flips / (statuses.length - 1);
  return Math.round(flipRate * 100);
}

/**
 * Transforms a raw DB TestResult record into a structured TestHistoryItem
 */
function mapToHistoryItem(result: any): TestHistoryItem {
  let metrics: any = {};
  try {
    metrics = typeof result.metrics === "string" ? JSON.parse(result.metrics) : result.metrics || {};
  } catch {}

  const visualComp = metrics?.visualComparison || null;

  const currentArt = result.artifacts?.find((a: any) => a.type === "VISUAL_CURRENT");
  const diffArt = result.artifacts?.find((a: any) => a.type === "VISUAL_DIFF");
  const baseArt = result.artifacts?.find((a: any) => a.type === "VISUAL_BASELINE");

  let visualRegression = null;
  if (visualComp || currentArt || diffArt) {
    visualRegression = {
      status: visualComp?.status || (diffArt ? "FAILED" : "PASSED"),
      differencePercentage: visualComp?.metrics?.differencePercentage ?? (visualComp?.differencePercentage ?? 0),
      changedPixels: visualComp?.metrics?.changedPixels ?? (visualComp?.changedPixels ?? 0),
      thresholdPercentage: visualComp?.metrics?.thresholdPercentage ?? (visualComp?.thresholdPercentage ?? 0.1),
      currentUrl: currentArt ? `/artifacts/runs/${result.testRunId}/${currentArt.fileName}` : visualComp?.currentUrl || null,
      diffUrl: diffArt ? `/artifacts/runs/${result.testRunId}/${diffArt.fileName}` : visualComp?.diffUrl || null,
      baselineUrl: baseArt ? `/artifacts/runs/${result.testRunId}/${baseArt.fileName}` : visualComp?.baselineUrl || null,
    };
  }

  return {
    id: result.id,
    runId: result.testRunId,
    testId: result.testId,
    testTitle: result.testTitle,
    testType: result.testType,
    status: result.status,
    durationMs: result.durationMs,
    startedAt: result.testRun?.startedAt ? new Date(result.testRun.startedAt).toISOString() : null,
    completedAt: result.testRun?.completedAt ? new Date(result.testRun.completedAt).toISOString() : null,
    createdAt: new Date(result.createdAt).toISOString(),
    browser: result.browser || null,
    environment: result.testRun?.environment || "staging",
    trigger: result.testRun?.trigger || "MANUAL",
    targetUrl: result.testRun?.targetUrl || "",
    gitCommitHash: result.testRun?.gitCommitHash || null,
    gitBranch: result.testRun?.gitBranch || null,
    errorMessage: result.errorMessage || null,
    hasArtifacts: (result.artifacts?.length || 0) > 0,
    artifactCount: result.artifacts?.length || 0,
    artifacts: (result.artifacts || []).map((a: any) => ({
      id: a.id,
      type: a.type,
      fileName: a.fileName,
      url: `/artifacts/runs/${result.testRunId}/${a.fileName}`,
    })),
    visualRegression,
  };
}

/**
 * Retrieve paginated test history for a project with server-side filtering, sorting, and aggregated metrics
 */
export async function getProjectTestHistory(
  projectId: string,
  filter: TestHistoryFilter = {}
): Promise<TestHistoryResponse> {
  const where = buildHistoryWhere(projectId, filter);

  // Sorting
  const sortBy = filter.sortBy || "createdAt";
  const sortOrder = filter.sortOrder || "desc";
  const orderBy: any = {};
  if (sortBy === "durationMs") {
    orderBy.durationMs = sortOrder;
  } else if (sortBy === "status") {
    orderBy.status = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  // Pagination parameters
  const page = Math.max(1, Number(filter.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(filter.pageSize) || 20));
  const skip = (page - 1) * pageSize;

  // Execute count and paginated items in parallel
  const [total, results] = await Promise.all([
    db.testResult.count({ where }),
    db.testResult.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        testRun: {
          select: {
            id: true,
            status: true,
            trigger: true,
            environment: true,
            targetUrl: true,
            gitCommitHash: true,
            gitBranch: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
          },
        },
        artifacts: {
          select: {
            id: true,
            type: true,
            fileName: true,
          },
        },
      },
    }),
  ]);

  const items = results.map(mapToHistoryItem);
  const totalPages = Math.ceil(total / pageSize);

  // Aggregate statistics
  const [statusCounts, durationStats] = await Promise.all([
    db.testResult.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    }),
    db.testResult.aggregate({
      where,
      _avg: { durationMs: true },
      _min: { durationMs: true },
      _max: { durationMs: true },
    }),
  ]);

  let passedExecutions = 0;
  let failedExecutions = 0;
  let timedOutExecutions = 0;

  for (const group of statusCounts) {
    if (group.status === "PASSED") passedExecutions = group._count.id;
    else if (group.status === "FAILED") failedExecutions = group._count.id;
    else if (group.status === "TIMED_OUT") timedOutExecutions = group._count.id;
  }

  const passRate = total > 0 ? Math.round((passedExecutions / total) * 100) : 0;
  const avgDurationMs = Math.round(durationStats._avg.durationMs || 0);
  const minDurationMs = durationStats._min.durationMs || 0;
  const maxDurationMs = durationStats._max.durationMs || 0;

  // Compute trends (sample up to 30 recent executions)
  const recentChronological = await db.testResult.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      testRunId: true,
      status: true,
      durationMs: true,
      createdAt: true,
    },
  });

  // Recent in ascending order for trend timeline
  const chronological = [...recentChronological].reverse();

  const durationTrend: TestDurationTrendPoint[] = chronological.map((r) => ({
    runId: r.testRunId,
    resultId: r.id,
    date: new Date(r.createdAt).toISOString(),
    durationMs: r.durationMs,
    status: r.status,
  }));

  const passFailTrend = chronological.map((r) => r.status as "PASSED" | "FAILED" | "TIMED_OUT");

  // Daily activity trend from recent executions
  const activityMap = new Map<string, { total: number; passed: number; failed: number }>();
  for (const item of recentChronological) {
    const day = new Date(item.createdAt).toISOString().split("T")[0];
    const curr = activityMap.get(day) || { total: 0, passed: 0, failed: 0 };
    curr.total++;
    if (item.status === "PASSED") curr.passed++;
    else curr.failed++;
    activityMap.set(day, curr);
  }

  const activityTrend: TestActivityPoint[] = Array.from(activityMap.entries())
    .map(([date, counts]) => ({
      date,
      total: counts.total,
      passed: counts.passed,
      failed: counts.failed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Consecutive failures calculation (from latest backwards)
  let consecutiveFailures = 0;
  for (const r of recentChronological) {
    if (r.status === "FAILED" || r.status === "TIMED_OUT") {
      consecutiveFailures++;
    } else {
      break;
    }
  }

  // Duration slowdown detection (compare latest execution vs prior baseline)
  let isSlower = false;
  let durationChangePct = 0;
  if (recentChronological.length >= 2 && avgDurationMs > 0) {
    const latestDuration = recentChronological[0].durationMs;
    const priorRuns = recentChronological.slice(1);
    const priorAvg = priorRuns.reduce((acc, r) => acc + r.durationMs, 0) / priorRuns.length;
    const baseline = priorAvg > 0 ? priorAvg : avgDurationMs;
    durationChangePct = Math.round(((latestDuration - baseline) / baseline) * 100);
    if (durationChangePct > 20) {
      isSlower = true;
    }
  }

  const flakinessScore = calculateFlakiness(recentChronological.map((r) => r.status));

  const lastRun = items[0] || null;
  const lastFailure = items.find((i) => i.status === "FAILED" || i.status === "TIMED_OUT") || null;

  const trends: TestTrendMetrics = {
    passFailTrend,
    durationTrend,
    activityTrend,
    consecutiveFailures,
    isSlower,
    durationChangePct,
    flakinessScore,
    lastRun,
    lastFailure,
  };

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    summary: {
      totalExecutions: total,
      passedExecutions,
      failedExecutions,
      timedOutExecutions,
      passRate,
      avgDurationMs,
      p95DurationMs: maxDurationMs,
      minDurationMs,
      maxDurationMs,
    },
    trends,
  };
}

/**
 * Compare two historical test runs in detail
 */
export async function compareTestRuns(
  projectId: string,
  baseRunId: string,
  targetRunId: string
): Promise<RunComparisonResult> {
  const [baseRun, targetRun] = await Promise.all([
    db.testRun.findUnique({
      where: { id: baseRunId },
      include: {
        testResults: {
          include: {
            artifacts: true,
          },
        },
      },
    }),
    db.testRun.findUnique({
      where: { id: targetRunId },
      include: {
        testResults: {
          include: {
            artifacts: true,
          },
        },
      },
    }),
  ]);

  if (!baseRun || baseRun.projectId !== projectId) {
    throw new Error(`Base run ${baseRunId} not found in this project.`);
  }

  if (!targetRun || targetRun.projectId !== projectId) {
    throw new Error(`Target run ${targetRunId} not found in this project.`);
  }

  const baseDuration = baseRun.durationMs || 0;
  const targetDuration = targetRun.durationMs || 0;
  const durationDeltaMs = targetDuration - baseDuration;
  const durationDeltaPct = baseDuration > 0 ? Math.round(((targetDuration - baseDuration) / baseDuration) * 100) : 0;

  const regressions: RunComparisonResult["regressions"] = [];
  const fixes: RunComparisonResult["fixes"] = [];
  const unchanged: RunComparisonResult["unchanged"] = [];
  const visualDiffs: RunComparisonResult["visualDiffs"] = [];

  // Index base results by testId or testTitle
  const baseMap = new Map<string, any>();
  for (const res of baseRun.testResults) {
    const key = res.testId || res.testTitle;
    baseMap.set(key, res);
  }

  for (const targetRes of targetRun.testResults) {
    const key = targetRes.testId || targetRes.testTitle;
    const baseRes = baseMap.get(key);

    if (baseRes) {
      const basePass = baseRes.status === "PASSED";
      const targetPass = targetRes.status === "PASSED";

      const tDurationDelta = targetRes.durationMs - baseRes.durationMs;
      const tDurationDeltaPct = baseRes.durationMs > 0 ? Math.round((tDurationDelta / baseRes.durationMs) * 100) : 0;

      if (basePass && !targetPass) {
        regressions.push({
          testId: targetRes.testId,
          title: targetRes.testTitle,
          type: targetRes.testType,
          baseStatus: baseRes.status,
          targetStatus: targetRes.status,
          baseDurationMs: baseRes.durationMs,
          targetDurationMs: targetRes.durationMs,
          errorSummary: targetRes.errorMessage || null,
        });
      } else if (!basePass && targetPass) {
        fixes.push({
          testId: targetRes.testId,
          title: targetRes.testTitle,
          type: targetRes.testType,
          baseStatus: baseRes.status,
          targetStatus: targetRes.status,
          baseDurationMs: baseRes.durationMs,
          targetDurationMs: targetRes.durationMs,
        });
      } else {
        unchanged.push({
          testId: targetRes.testId,
          title: targetRes.testTitle,
          type: targetRes.testType,
          status: targetRes.status,
          baseDurationMs: baseRes.durationMs,
          targetDurationMs: targetRes.durationMs,
          durationDeltaMs: tDurationDelta,
          durationDeltaPct: tDurationDeltaPct,
        });
      }

      // Check visual regression comparison
      let baseMetrics: any = {};
      let targetMetrics: any = {};
      try {
        baseMetrics = typeof baseRes.metrics === "string" ? JSON.parse(baseRes.metrics) : baseRes.metrics;
        targetMetrics = typeof targetRes.metrics === "string" ? JSON.parse(targetRes.metrics) : targetRes.metrics;
      } catch {}

      const baseVisual = baseMetrics?.visualComparison;
      const targetVisual = targetMetrics?.visualComparison;

      if (baseVisual || targetVisual) {
        visualDiffs.push({
          testId: targetRes.testId,
          title: targetRes.testTitle,
          baseDiffPct: baseVisual?.metrics?.differencePercentage ?? null,
          targetDiffPct: targetVisual?.metrics?.differencePercentage ?? null,
          baseStatus: baseVisual?.status || "NO_BASELINE",
          targetStatus: targetVisual?.status || "NO_BASELINE",
        });
      }
    }
  }

  const totalCompared = regressions.length + fixes.length + unchanged.length;
  const speedupPct = durationDeltaPct * -1; // positive if faster

  return {
    baseRun: {
      id: baseRun.id,
      status: baseRun.status,
      durationMs: baseRun.durationMs,
      totalTests: baseRun.totalTests,
      passedTests: baseRun.passedTests,
      failedTests: baseRun.failedTests,
      createdAt: new Date(baseRun.createdAt).toISOString(),
      targetUrl: baseRun.targetUrl,
      environment: baseRun.environment,
      gitCommitHash: baseRun.gitCommitHash,
      gitBranch: baseRun.gitBranch,
    },
    targetRun: {
      id: targetRun.id,
      status: targetRun.status,
      durationMs: targetRun.durationMs,
      totalTests: targetRun.totalTests,
      passedTests: targetRun.passedTests,
      failedTests: targetRun.failedTests,
      createdAt: new Date(targetRun.createdAt).toISOString(),
      targetUrl: targetRun.targetUrl,
      environment: targetRun.environment,
      gitCommitHash: targetRun.gitCommitHash,
      gitBranch: targetRun.gitBranch,
    },
    durationDeltaMs,
    durationDeltaPct,
    statusChanged: baseRun.status !== targetRun.status,
    regressions,
    fixes,
    unchanged,
    visualDiffs,
    summary: {
      totalCompared,
      regressionsCount: regressions.length,
      fixesCount: fixes.length,
      unchangedCount: unchanged.length,
      speedupPct,
    },
  };
}
