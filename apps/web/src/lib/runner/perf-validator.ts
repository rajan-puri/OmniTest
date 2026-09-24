import { PerformanceTestSpec, PerformanceThreshold, PerformanceThresholdKey, PerformanceThresholdOperator } from "./perf-types";

const VALID_METRICS: PerformanceThresholdKey[] = [
  "lcp",
  "cls",
  "fcp",
  "ttfb",
  "domContentLoaded",
  "loadEvent",
  "totalLoad",
  "failedRequests",
];

const VALID_OPERATORS: PerformanceThresholdOperator[] = ["lt", "lte", "gt", "gte", "eq"];

export function validatePerformanceTestSpec(raw: unknown): PerformanceTestSpec {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid performance test specification: expected JSON object.");
  }

  const spec = raw as Record<string, unknown>;

  // 1. Target URL
  if (typeof spec.url !== "string" || !spec.url.trim()) {
    throw new Error("Performance test requires a non-empty 'url' string.");
  }

  const url = spec.url.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: "${url}".`);
    }
  } else if (!url.startsWith("/")) {
    throw new Error(`Target URL must start with http://, https://, or a relative path ('/'): "${url}".`);
  }

  // 2. Device Viewport
  let device: "desktop" | "mobile" = "desktop";
  if (spec.device !== undefined) {
    if (spec.device !== "desktop" && spec.device !== "mobile") {
      throw new Error("Device configuration must be either 'desktop' or 'mobile'.");
    }
    device = spec.device;
  }

  // 3. Runs (Warmup & Measurement)
  let warmupRuns = 0;
  if (spec.warmupRuns !== undefined) {
    if (typeof spec.warmupRuns !== "number" || spec.warmupRuns < 0 || spec.warmupRuns > 1) {
      throw new Error("Warmup runs must be 0 or 1.");
    }
    warmupRuns = Math.floor(spec.warmupRuns);
  }

  let measurementRuns = 1;
  if (spec.measurementRuns !== undefined) {
    if (typeof spec.measurementRuns !== "number" || spec.measurementRuns < 1 || spec.measurementRuns > 3) {
      throw new Error("Measurement runs must be between 1 and 3.");
    }
    measurementRuns = Math.floor(spec.measurementRuns);
  }

  // 4. Thresholds
  const thresholds: PerformanceThreshold[] = [];
  if (spec.thresholds !== undefined) {
    if (!Array.isArray(spec.thresholds)) {
      throw new Error("Thresholds must be an array of performance threshold rules.");
    }

    for (let i = 0; i < spec.thresholds.length; i++) {
      const t = spec.thresholds[i];
      if (!t || typeof t !== "object") {
        throw new Error(`Threshold at index ${i} is invalid.`);
      }

      if (!VALID_METRICS.includes(t.metric)) {
        throw new Error(
          `Invalid threshold metric "${t.metric}". Allowed metrics: ${VALID_METRICS.join(", ")}.`
        );
      }

      if (!VALID_OPERATORS.includes(t.operator)) {
        throw new Error(
          `Invalid threshold operator "${t.operator}". Allowed operators: ${VALID_OPERATORS.join(", ")}.`
        );
      }

      if (typeof t.targetValue !== "number" || !Number.isFinite(t.targetValue) || t.targetValue < 0) {
        throw new Error(`Threshold targetValue for "${t.metric}" must be a non-negative number.`);
      }

      let unit: "ms" | "score" | "count" = "ms";
      if (t.metric === "cls") unit = "score";
      else if (t.metric === "failedRequests") unit = "count";

      thresholds.push({
        id: typeof t.id === "string" ? t.id : `thresh_${i + 1}`,
        metric: t.metric,
        operator: t.operator,
        targetValue: t.targetValue,
        unit,
      });
    }
  }

  // 5. Timeout
  let timeoutSeconds = 30;
  if (spec.timeoutSeconds !== undefined) {
    if (typeof spec.timeoutSeconds !== "number" || spec.timeoutSeconds < 5 || spec.timeoutSeconds > 120) {
      throw new Error("Timeout must be between 5 and 120 seconds.");
    }
    timeoutSeconds = Math.floor(spec.timeoutSeconds);
  }

  return {
    version: "1.0",
    url,
    device,
    warmupRuns,
    measurementRuns,
    thresholds,
    timeoutSeconds,
  };
}
