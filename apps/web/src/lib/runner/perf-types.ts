export type PerformanceThresholdKey =
  | "lcp"
  | "cls"
  | "fcp"
  | "ttfb"
  | "domContentLoaded"
  | "loadEvent"
  | "totalLoad"
  | "failedRequests";

export type PerformanceThresholdOperator = "lt" | "lte" | "gt" | "gte" | "eq";

export interface PerformanceThreshold {
  id?: string;
  metric: PerformanceThresholdKey;
  operator: PerformanceThresholdOperator;
  targetValue: number;
  unit: "ms" | "score" | "count";
}

export interface PerformanceTestSpec {
  version: "1.0";
  url: string;
  device?: "desktop" | "mobile";
  warmupRuns?: number; // 0 or 1 (default 0)
  measurementRuns?: number; // 1 to 3 (default 1)
  thresholds?: PerformanceThreshold[];
  timeoutSeconds?: number;
}

export interface PerformanceVitals {
  lcp: number | null; // Largest Contentful Paint in milliseconds
  cls: number | null; // Cumulative Layout Shift score
  inp: number | null; // Interaction to Next Paint in milliseconds (null when unavailable in synthetic load)
  inpAvailable: boolean;
}

export interface PerformancePageMetrics {
  fcp: number | null; // First Contentful Paint in milliseconds
  ttfb: number | null; // Time to First Byte in milliseconds
  domContentLoaded: number | null; // DOMContentLoaded in milliseconds
  loadEvent: number | null; // Load event end in milliseconds
  totalLoad: number | null; // Total page load duration in milliseconds
}

export interface ResourceCategoryBreakdown {
  count: number;
  bytes: number;
}

export interface PerformanceResourceBreakdown {
  javascript: ResourceCategoryBreakdown;
  css: ResourceCategoryBreakdown;
  images: ResourceCategoryBreakdown;
  fonts: ResourceCategoryBreakdown;
  other: ResourceCategoryBreakdown;
}

export interface PerformanceNetworkMetrics {
  totalRequests: number;
  failedRequests: number;
  totalBytesTransferred: number;
  resources: PerformanceResourceBreakdown;
}

export interface ThresholdEvaluationResult {
  metric: PerformanceThresholdKey;
  operator: PerformanceThresholdOperator;
  targetValue: number;
  actualValue: number | null;
  unit: "ms" | "score" | "count";
  passed: boolean;
  message: string;
}

export interface SingleRunMetrics {
  vitals: PerformanceVitals;
  pageMetrics: PerformancePageMetrics;
  network: PerformanceNetworkMetrics;
}

export interface PerformanceExecutionResult {
  status: "PASSED" | "FAILED" | "TIMED_OUT";
  durationMs: number;
  url: string;
  timestamp: string;
  device: "desktop" | "mobile";
  runsCount: number;
  vitals: PerformanceVitals;
  pageMetrics: PerformancePageMetrics;
  network: PerformanceNetworkMetrics;
  thresholds: ThresholdEvaluationResult[];
  rawRuns?: SingleRunMetrics[];
  screenshotUrl?: string;
  errorSummary?: string;
  methodology: string;
}
