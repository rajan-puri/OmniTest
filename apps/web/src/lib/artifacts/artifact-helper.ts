import { ArtifactItem, ArtifactType, ArtifactMetadata } from "./artifact-types";
import { maskSensitiveHeaders } from "../runner/api-executor";

export function formatByteSize(bytes: number | bigint | null | undefined): string {
  const b = typeof bytes === "bigint" ? Number(bytes) : Number(bytes || 0);
  if (b === 0) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getArtifactCategory(type: ArtifactType): string {
  switch (type) {
    case "SCREENSHOT":
    case "VISUAL_BASELINE":
    case "VISUAL_CURRENT":
    case "VISUAL_DIFF":
      return "image";
    case "VIDEO":
      return "video";
    case "PLAYWRIGHT_TRACE":
      return "trace";
    case "CONSOLE_LOG":
    case "TEXT":
      return "log";
    case "NETWORK_LOG":
    case "HTTP_RESPONSE":
    case "API_REQUEST":
    case "API_RESPONSE":
    case "PERFORMANCE_EVIDENCE":
    case "A11Y_EVIDENCE":
    case "SEO_EVIDENCE":
    case "JSON":
      return "json";
    case "HTML":
      return "html";
    default:
      return "other";
  }
}

/**
 * Derives comprehensive artifacts for a TestResult by combining persisted DB artifacts
 * with runtime diagnostic telemetry (console logs, network traces, API payloads, evidence JSON).
 */
export function compileResultArtifacts(
  projectId: string,
  testRunId: string,
  testResult: {
    id: string;
    testTitle: string;
    testType: string;
    status: string;
    errorMessage: string | null;
    stackTrace: string | null;
    stepResults: any;
    metrics: any;
    createdAt: Date | string;
    artifacts?: Array<{
      id: string;
      type: string;
      fileName: string;
      contentType: string;
      sizeBytes: bigint | number;
      createdAt: Date | string;
    }>;
  }
): ArtifactItem[] {
  const artifacts: ArtifactItem[] = [];
  const baseContentUrl = `/api/projects/${projectId}/runs/${testRunId}/results/${testResult.id}/artifacts`;

  // 1. Process persisted database artifacts (e.g. screenshots, video, traces)
  if (Array.isArray(testResult.artifacts)) {
    for (const art of testResult.artifacts) {
      const type = (art.type as ArtifactType) || "SCREENSHOT";
      const sizeNum = typeof art.sizeBytes === "bigint" ? Number(art.sizeBytes) : Number(art.sizeBytes || 0);

      artifacts.push({
        id: art.id,
        testRunId,
        testResultId: testResult.id,
        type,
        fileName: art.fileName,
        contentType: art.contentType || "application/octet-stream",
        sizeBytes: sizeNum,
        formattedSize: formatByteSize(sizeNum),
        url: `/artifacts/runs/${testRunId}/${art.fileName}`,
        downloadUrl: `${baseContentUrl}/${art.id}/content?download=true`,
        createdAt: new Date(art.createdAt).toISOString(),
        isVirtual: false,
        metadata: {
          engine: testResult.testType,
        },
      });
    }
  }

  // Parse metrics and step results if stringified
  const metrics =
    typeof testResult.metrics === "string"
      ? (() => {
          try {
            return JSON.parse(testResult.metrics);
          } catch {
            return null;
          }
        })()
      : testResult.metrics;

  const stepResults =
    typeof testResult.stepResults === "string"
      ? (() => {
          try {
            return JSON.parse(testResult.stepResults);
          } catch {
            return [];
          }
        })()
      : testResult.stepResults;

  const resultCreatedIso = new Date(testResult.createdAt).toISOString();

  // 2. Synthesize runtime Console Errors Log if present
  if (metrics?.consoleErrors && Array.isArray(metrics.consoleErrors) && metrics.consoleErrors.length > 0) {
    const logText = metrics.consoleErrors
      .map((err: any, idx: number) => `[${idx + 1}] [ERROR] ${err.text || JSON.stringify(err)}`)
      .join("\n");
    const byteSize = Buffer.byteLength(logText, "utf8");

    artifacts.push({
      id: `virt-log-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "CONSOLE_LOG",
      fileName: `console-errors-${testResult.id.slice(0, 8)}.log`,
      contentType: "text/plain",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-log-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-log-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        linesCount: metrics.consoleErrors.length,
        engine: testResult.testType,
      },
    });
  }

  // 3. Synthesize runtime Network Failures Log if present
  if (metrics?.networkFailures && Array.isArray(metrics.networkFailures) && metrics.networkFailures.length > 0) {
    const netJson = JSON.stringify(metrics.networkFailures, null, 2);
    const byteSize = Buffer.byteLength(netJson, "utf8");

    artifacts.push({
      id: `virt-net-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "NETWORK_LOG",
      fileName: `network-failures-${testResult.id.slice(0, 8)}.json`,
      contentType: "application/json",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-net-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-net-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        itemsCount: metrics.networkFailures.length,
        engine: testResult.testType,
      },
    });
  }

  // 4. Synthesize API Test Evidence (Request & Response)
  if (testResult.testType === "API" && metrics) {
    if (metrics.request || metrics.requestHeaders || metrics.response || metrics.httpStatus) {
      // Clean sensitive headers for safety
      const safeMetrics = {
        ...metrics,
        requestHeaders: metrics.requestHeaders ? maskSensitiveHeaders(metrics.requestHeaders) : undefined,
        responseHeaders: metrics.responseHeaders ? maskSensitiveHeaders(metrics.responseHeaders) : undefined,
        request: metrics.request
          ? {
              ...metrics.request,
              headers: metrics.request.headers ? maskSensitiveHeaders(metrics.request.headers) : undefined,
            }
          : undefined,
      };

      const apiJson = JSON.stringify(safeMetrics, null, 2);
      const byteSize = Buffer.byteLength(apiJson, "utf8");

      artifacts.push({
        id: `virt-api-${testResult.id}`,
        testRunId,
        testResultId: testResult.id,
        type: "API_RESPONSE",
        fileName: `api-transaction-${testResult.id.slice(0, 8)}.json`,
        contentType: "application/json",
        sizeBytes: byteSize,
        formattedSize: formatByteSize(byteSize),
        url: `${baseContentUrl}/virt-api-${testResult.id}/content`,
        downloadUrl: `${baseContentUrl}/virt-api-${testResult.id}/content?download=true`,
        createdAt: resultCreatedIso,
        isVirtual: true,
        metadata: {
          statusCode: metrics.httpStatus || metrics.response?.status,
          method: metrics.method || metrics.request?.method,
          url: metrics.url || metrics.request?.url,
          engine: "API",
        },
      });
    }
  }

  // 5. Synthesize Accessibility Audit Evidence
  if (testResult.testType === "ACCESSIBILITY" && metrics && (metrics.violations || metrics.summary)) {
    const a11yJson = JSON.stringify(metrics, null, 2);
    const byteSize = Buffer.byteLength(a11yJson, "utf8");

    artifacts.push({
      id: `virt-a11y-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "A11Y_EVIDENCE",
      fileName: `accessibility-evidence-${testResult.id.slice(0, 8)}.json`,
      contentType: "application/json",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-a11y-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-a11y-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        violationsCount: metrics.violations?.length || metrics.summary?.violationsCount || 0,
        engine: "ACCESSIBILITY",
      },
    });
  }

  // 6. Synthesize Performance Audit Evidence
  if (testResult.testType === "PERFORMANCE" && metrics && (metrics.vitals || metrics.pageMetrics)) {
    const perfJson = JSON.stringify(metrics, null, 2);
    const byteSize = Buffer.byteLength(perfJson, "utf8");

    artifacts.push({
      id: `virt-perf-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "PERFORMANCE_EVIDENCE",
      fileName: `performance-evidence-${testResult.id.slice(0, 8)}.json`,
      contentType: "application/json",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-perf-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-perf-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        lcpMs: metrics.vitals?.lcp?.value || metrics.lcpMs,
        cls: metrics.vitals?.cls?.value || metrics.cls,
        engine: "PERFORMANCE",
      },
    });
  }

  // 7. Synthesize Technical SEO Audit Evidence
  if (testResult.testType === "SEO" && metrics && (metrics.findings || metrics.checks || metrics.title)) {
    const seoJson = JSON.stringify(metrics, null, 2);
    const byteSize = Buffer.byteLength(seoJson, "utf8");

    artifacts.push({
      id: `virt-seo-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "SEO_EVIDENCE",
      fileName: `seo-audit-evidence-${testResult.id.slice(0, 8)}.json`,
      contentType: "application/json",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-seo-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-seo-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        url: metrics.url,
        engine: "SEO",
      },
    });
  }

  // 8. Synthesize Step Execution Timeline if steps exist (for UI workflows)
  if (Array.isArray(stepResults) && stepResults.length > 0) {
    const stepsJson = JSON.stringify(stepResults, null, 2);
    const byteSize = Buffer.byteLength(stepsJson, "utf8");

    artifacts.push({
      id: `virt-steps-${testResult.id}`,
      testRunId,
      testResultId: testResult.id,
      type: "JSON",
      fileName: `step-execution-timeline-${testResult.id.slice(0, 8)}.json`,
      contentType: "application/json",
      sizeBytes: byteSize,
      formattedSize: formatByteSize(byteSize),
      url: `${baseContentUrl}/virt-steps-${testResult.id}/content`,
      downloadUrl: `${baseContentUrl}/virt-steps-${testResult.id}/content?download=true`,
      createdAt: resultCreatedIso,
      isVirtual: true,
      metadata: {
        itemsCount: stepResults.length,
        engine: testResult.testType,
      },
    });
  }

  return artifacts;
}
