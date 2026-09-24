import { VisualComparisonStatus } from "../visual/visual-types";

export type TestHistoryStatus = "PASSED" | "FAILED" | "TIMED_OUT" | "CANCELLED" | "RUNNING" | "QUEUED";

export type TestEngineType = "UI" | "API" | "ACCESSIBILITY" | "PERFORMANCE" | "SEO";

export interface TestHistoryItem {
  id: string; // TestResult id
  runId: string;
  testId: string | null;
  testTitle: string;
  testType: string;
  status: string;
  durationMs: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  browser: string | null;
  environment: string;
  trigger: string;
  targetUrl: string;
  gitCommitHash: string | null;
  gitBranch: string | null;
  errorMessage: string | null;
  hasArtifacts: boolean;
  artifactCount: number;
  artifacts: Array<{
    id: string;
    type: string;
    fileName: string;
    url: string;
  }>;
  visualRegression?: {
    status: VisualComparisonStatus;
    differencePercentage: number;
    changedPixels: number;
    thresholdPercentage: number;
    currentUrl: string | null;
    diffUrl: string | null;
    baselineUrl: string | null;
  } | null;
}

export interface TestHistoryFilter {
  testId?: string;
  status?: string; // ALL, PASSED, FAILED, TIMED_OUT
  testType?: string; // ALL, UI, API, ACCESSIBILITY, PERFORMANCE, SEO
  dateRange?: "all" | "today" | "7d" | "30d" | "custom";
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "durationMs" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface TestHistorySummary {
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
  timedOutExecutions: number;
  passRate: number; // 0 - 100
  avgDurationMs: number;
  p95DurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
}

export interface TestDurationTrendPoint {
  runId: string;
  resultId: string;
  date: string;
  durationMs: number;
  status: string;
}

export interface TestActivityPoint {
  date: string; // YYYY-MM-DD
  total: number;
  passed: number;
  failed: number;
}

export interface TestTrendMetrics {
  passFailTrend: Array<"PASSED" | "FAILED" | "TIMED_OUT">;
  durationTrend: TestDurationTrendPoint[];
  activityTrend: TestActivityPoint[];
  consecutiveFailures: number;
  isSlower: boolean;
  durationChangePct: number; // e.g. +15% or -10% compared to recent baseline
  flakinessScore: number; // 0 (rock solid) to 100 (heavily fluctuating)
  lastRun: TestHistoryItem | null;
  lastFailure: TestHistoryItem | null;
}

export interface TestHistoryResponse {
  items: TestHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: TestHistorySummary;
  trends?: TestTrendMetrics;
}

export interface RunComparisonResult {
  baseRun: {
    id: string;
    status: string;
    durationMs: number | null;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    createdAt: string;
    targetUrl: string;
    environment: string;
    gitCommitHash: string | null;
    gitBranch: string | null;
  };
  targetRun: {
    id: string;
    status: string;
    durationMs: number | null;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    createdAt: string;
    targetUrl: string;
    environment: string;
    gitCommitHash: string | null;
    gitBranch: string | null;
  };
  durationDeltaMs: number;
  durationDeltaPct: number; // positive = target took longer, negative = target was faster
  statusChanged: boolean;
  regressions: Array<{
    testId: string | null;
    title: string;
    type: string;
    baseStatus: string;
    targetStatus: string;
    baseDurationMs: number;
    targetDurationMs: number;
    errorSummary?: string | null;
  }>;
  fixes: Array<{
    testId: string | null;
    title: string;
    type: string;
    baseStatus: string;
    targetStatus: string;
    baseDurationMs: number;
    targetDurationMs: number;
  }>;
  unchanged: Array<{
    testId: string | null;
    title: string;
    type: string;
    status: string;
    baseDurationMs: number;
    targetDurationMs: number;
    durationDeltaMs: number;
    durationDeltaPct: number;
  }>;
  visualDiffs: Array<{
    testId: string | null;
    title: string;
    baseDiffPct: number | null;
    targetDiffPct: number | null;
    baseStatus: string;
    targetStatus: string;
  }>;
  summary: {
    totalCompared: number;
    regressionsCount: number;
    fixesCount: number;
    unchangedCount: number;
    speedupPct: number;
  };
}
