export type TestEngineType = "UI" | "API" | "ACCESSIBILITY" | "PERFORMANCE" | "SEO";

export type RunStatus = "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "TIMED_OUT" | "CANCELLED";

export interface ReportSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  skippedTests: number;
  passRate: number; // Percentage 0 - 100 rounded to 1 decimal place
  durationMs: number;
  formattedDuration: string;
  startedAt: string | null;
  completedAt: string | null;
  isRunning: boolean;
  generatedAt: string;
}

export interface ReportTypeBreakdown {
  type: TestEngineType;
  label: string;
  total: number;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
  passRate: number;
}

export interface ReportFailureItem {
  testId: string | null;
  testResultId: string;
  title: string;
  type: TestEngineType;
  status: string;
  durationMs: number;
  formattedDuration: string;
  failureReason: string;
  detailsSnippet?: string;
  hasArtifacts: boolean;
}

export interface ReportItem {
  id: string; // testResultId
  testId: string | null;
  title: string;
  type: TestEngineType;
  status: "PASSED" | "FAILED" | "TIMED_OUT" | "SKIPPED" | "RUNNING";
  durationMs: number;
  formattedDuration: string;
  errorMessage: string | null;
  assertionsSummary?: {
    total: number;
    passed: number;
    failed: number;
  };
  metrics?: Record<string, any>;
  artifactsCount: number;
  createdAt: string;
}

export interface RunReport {
  id: string; // report identifier, e.g. rep_[runId]
  testRunId: string;
  project: {
    id: string;
    name: string;
    slug: string;
    baseUrl?: string | null;
  };
  suite?: {
    id: string;
    name: string;
  } | null;
  status: RunStatus;
  trigger: string;
  environment: string;
  targetUrl: string;
  gitCommitHash?: string | null;
  gitBranch?: string | null;
  summary: ReportSummary;
  breakdown: ReportTypeBreakdown[];
  failures: ReportFailureItem[];
  errors: ReportFailureItem[];
  items: ReportItem[];
}
