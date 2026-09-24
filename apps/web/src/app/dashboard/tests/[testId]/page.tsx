"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCode2,
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  AlertTriangle,
  Globe,
  Globe2,
  Loader2,
  Layers,
  Terminal,
  ExternalLink,
  Eye,
  Zap,
  Search,
  History,
} from "lucide-react";
import { TestSpec, StepExecutionResult, ConsoleErrorRecord, NetworkFailureRecord } from "@/lib/runner/types";
import { ApiTestSpec, ApiExecutionResult } from "@/lib/runner/api-types";
import { A11yExecutionResult } from "@/lib/runner/a11y-types";
import { PerformanceExecutionResult } from "@/lib/runner/perf-types";
import { SeoExecutionResult } from "@/lib/runner/seo-types";
import { ApiResponseViewer } from "@/components/api/ApiResponseViewer";
import { A11yResultViewer } from "@/components/a11y/A11yResultViewer";
import { PerformanceResultViewer } from "@/components/performance/PerformanceResultViewer";
import { SeoResultViewer } from "@/components/seo/SeoResultViewer";
import { VisualRegressionCard } from "@/components/visual/VisualRegressionCard";
import { TestDetailHistory } from "@/components/history/TestDetailHistory";

interface TestDetail {
  id: string;
  title: string;
  description: string | null;
  type: "UI" | "API" | "ACCESSIBILITY" | "PERFORMANCE" | "SEO";
  config: any;
  timeoutSeconds: number;
  suiteId: string;
  suiteName: string;
  projectId: string;
  projectName: string;
  recentResults: Array<{
    id: string;
    testRunId: string;
    status: "PASSED" | "FAILED" | "TIMED_OUT";
    durationMs: number;
    errorMessage: string | null;
    stackTrace: string | null;
    stepResults: StepExecutionResult[];
    metrics: any;
    artifacts: Array<{
      id: string;
      type: string;
      fileName: string;
      url: string;
    }>;
    createdAt: string;
  }>;
}

export default function TestDetailPage({
  params,
}: {
  params: { testId: string };
}) {
  const { testId } = params;
  const [test, setTest] = useState<TestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTest = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/tests/${testId}`);
      if (!res.ok) throw new Error("Failed to load test details.");
      const data = await res.json();
      setTest(data.test);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading test.");
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleRunTest = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch(`/api/tests/${testId}/run`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute test run.");
      }

      // Re-fetch test data to display latest run results
      await fetchTest();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Test execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-zinc-400 font-mono">Loading test definition...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-zinc-400">Test not found or access denied.</p>
        <Link
          href="/dashboard/projects"
          className="text-xs text-brand-400 hover:underline"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const latestResult = test.recentResults[0] || null;
  const isPassed = latestResult?.status === "PASSED";
  const consoleErrors: ConsoleErrorRecord[] = latestResult?.metrics?.consoleErrors || [];
  const networkFailures: NetworkFailureRecord[] = latestResult?.metrics?.networkFailures || [];

  // Reconstruct ApiExecutionResult if test type is API
  const apiExecutionResult: ApiExecutionResult | null =
    test.type === "API" && latestResult && latestResult.metrics?.request
      ? {
          status: latestResult.status,
          durationMs: latestResult.durationMs,
          statusCode: latestResult.metrics.statusCode,
          statusText: latestResult.metrics.statusText,
          request: latestResult.metrics.request,
          response: latestResult.metrics.response,
          assertions: latestResult.metrics.assertions || [],
          totalAssertions: latestResult.metrics.totalAssertions || 0,
          passedAssertions: latestResult.metrics.passedAssertions || 0,
          failedAssertions: latestResult.metrics.failedAssertions || 0,
          errorSummary: latestResult.errorMessage || undefined,
        }
      : null;

  // Reconstruct A11yExecutionResult if test type is ACCESSIBILITY
  const a11yExecutionResult: A11yExecutionResult | null =
    test.type === "ACCESSIBILITY" && latestResult && latestResult.metrics?.violations
      ? {
          status: latestResult.status,
          durationMs: latestResult.durationMs,
          summary: latestResult.metrics.summary || {
            critical: 0,
            serious: 0,
            moderate: 0,
            minor: 0,
            totalViolations: 0,
            totalPasses: 0,
            totalIncomplete: 0,
            totalInapplicable: 0,
          },
          violations: latestResult.metrics.violations || [],
          passes: latestResult.metrics.passes || [],
          incomplete: latestResult.metrics.incomplete || [],
          inapplicable: latestResult.metrics.inapplicable || [],
          url: latestResult.metrics.url || latestResult.metrics.targetUrl || test.config?.url || "",
          timestamp: latestResult.metrics.timestamp || latestResult.createdAt,
          screenshotUrl: latestResult.metrics.screenshotUrl || undefined,
          errorSummary: latestResult.errorMessage || undefined,
        }
      : null;

  // Reconstruct PerformanceExecutionResult if test type is PERFORMANCE
  const perfExecutionResult: PerformanceExecutionResult | null =
    test.type === "PERFORMANCE" && latestResult && latestResult.metrics?.vitals
      ? {
          status: latestResult.status,
          durationMs: latestResult.durationMs,
          url: latestResult.metrics.url || test.config?.url || "",
          timestamp: latestResult.metrics.timestamp || latestResult.createdAt,
          device: latestResult.metrics.device || "desktop",
          runsCount: latestResult.metrics.runsCount || 1,
          vitals: latestResult.metrics.vitals,
          pageMetrics: latestResult.metrics.pageMetrics,
          network: latestResult.metrics.network,
          thresholds: latestResult.metrics.thresholds || [],
          screenshotUrl: latestResult.metrics.screenshotUrl || undefined,
          errorSummary: latestResult.errorMessage || undefined,
          methodology: latestResult.metrics.methodology || "Automated headless Chromium run",
        }
      : null;

  // Reconstruct SeoExecutionResult if test type is SEO
  const seoExecutionResult: SeoExecutionResult | null =
    test.type === "SEO" && latestResult && latestResult.metrics?.findings
      ? {
          status: latestResult.status === "PASSED" ? "PASSED" : "FAILED",
          durationMs: latestResult.durationMs,
          url: latestResult.metrics.url || test.config?.url || "",
          finalUrl: latestResult.metrics.finalUrl || latestResult.metrics.url || test.config?.url || "",
          httpStatus: latestResult.metrics.httpStatus || 200,
          httpStatusText: latestResult.metrics.httpStatusText || "OK",
          redirectChain: latestResult.metrics.redirectChain || [],
          summary: latestResult.metrics.summary || {
            totalChecks: 0,
            errors: 0,
            warnings: 0,
            info: 0,
            passed: 0,
          },
          findings: latestResult.metrics.findings || [],
          pageDetails: latestResult.metrics.pageDetails,
          assertions: latestResult.metrics.assertions || [],
          screenshotUrl: latestResult.metrics.screenshotUrl || undefined,
          errorSummary: latestResult.errorMessage || undefined,
        }
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link
          href={`/dashboard/projects/${test.projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {test.projectName}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>{test.projectName}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{test.suiteName}</span>
              <span className="text-zinc-600">/</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  test.type === "API"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : test.type === "ACCESSIBILITY"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                    : test.type === "PERFORMANCE"
                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                    : test.type === "SEO"
                    ? "bg-teal-500/15 text-teal-300 border border-teal-500/25"
                    : "bg-brand-500/15 text-brand-300 border border-brand-500/25"
                }`}
              >
                {test.type === "API"
                  ? "API Test"
                  : test.type === "ACCESSIBILITY"
                  ? "Accessibility Test"
                  : test.type === "PERFORMANCE"
                  ? "Performance Test"
                  : test.type === "SEO"
                  ? "SEO Audit"
                  : "Browser Test"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              {test.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href={`/dashboard/projects/${test.projectId}/history?testId=${test.id}`}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white font-semibold text-xs border border-white/[0.08] flex items-center gap-1.5 transition-colors font-mono"
            >
              <History className="w-3.5 h-3.5 text-brand-400" />
              History
            </Link>

            <button
              type="button"
              onClick={handleRunTest}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Test Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* API TEST RESULT SECTION */}
      {test.type === "API" && (
        <div className="space-y-6">
          {apiExecutionResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Latest API Response &amp; Assertions
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  Run #{latestResult?.testRunId.slice(0, 8)} • {new Date(latestResult?.createdAt || "").toLocaleTimeString()}
                </span>
              </div>
              <ApiResponseViewer result={apiExecutionResult} />
            </div>
          ) : (
            <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No API executions yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Click &quot;Run Test Now&quot; above to dispatch the HTTP request and evaluate configured response assertions.
                </p>
              </div>
            </div>
          )}

          {/* API Request Configuration Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Configured API Test Definition
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2">
                <span className="text-emerald-400 font-bold uppercase">{test.config.method || "GET"}</span>
                <span className="text-white break-all">{test.config.url}</span>
              </div>

              {test.config.assertions && test.config.assertions.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-400 block mb-1">Expected Assertions:</span>
                  {test.config.assertions.map((a: any, i: number) => (
                    <div key={i} className="text-zinc-300 flex items-center gap-1.5">
                      <span className="text-zinc-500">•</span>
                      <span className="text-brand-300 uppercase">{a.type.replace(/_/g, " ")}</span>
                      {a.property && <span>on `{a.property}`</span>}
                      {a.expected && <span className="text-zinc-400">(expected: &quot;{a.expected}&quot;)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY TEST RESULT SECTION */}
      {test.type === "ACCESSIBILITY" && (
        <div className="space-y-6">
          {a11yExecutionResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Accessibility Audit Results (axe-core)
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  Run #{latestResult?.testRunId.slice(0, 8)} • {new Date(latestResult?.createdAt || "").toLocaleTimeString()}
                </span>
              </div>
              <A11yResultViewer result={a11yExecutionResult} />
            </div>
          ) : (
            <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No accessibility audits run yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Click &quot;Run Test Now&quot; above to evaluate WCAG compliance on the target page using axe-core.
                </p>
              </div>
            </div>
          )}

          {/* Accessibility Config Details Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Configured Accessibility Scan Parameters
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Target URL:</span>
                <span className="text-white break-all">{test.config.url}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Scan Scope:</span>
                <span className="text-amber-400 font-bold uppercase">{test.config.scope || "page"}</span>
              </div>
              {test.config.selector && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <span className="text-zinc-400">Selector:</span>
                  <span className="text-white">{test.config.selector}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Standards:</span>
                <span className="text-zinc-200">
                  {Array.isArray(test.config.standards) ? test.config.standards.join(", ") : "wcag2a, wcag2aa"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE TEST RESULT SECTION */}
      {test.type === "PERFORMANCE" && (
        <div className="space-y-6">
          {perfExecutionResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Performance Audit &amp; Core Web Vitals
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  Run #{latestResult?.testRunId.slice(0, 8)} • {new Date(latestResult?.createdAt || "").toLocaleTimeString()}
                </span>
              </div>
              <PerformanceResultViewer result={perfExecutionResult} />
            </div>
          ) : (
            <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No performance audits run yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Click &quot;Run Test Now&quot; above to measure Core Web Vitals, page timings, and resource transfer in headless Chromium.
                </p>
              </div>
            </div>
          )}

          {/* Performance Config Details Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Configured Performance Thresholds &amp; Settings
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Target URL:</span>
                <span className="text-white break-all">{test.config.url}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Device Viewport:</span>
                <span className="text-purple-400 font-bold uppercase">{test.config.device || "desktop"}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Measurement Mode:</span>
                <span className="text-zinc-200">
                  {test.config.measurementRuns > 1
                    ? `${test.config.measurementRuns} measurement runs (median aggregated)`
                    : "Single measurement run"}
                </span>
              </div>
              {test.config.thresholds && test.config.thresholds.length > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-zinc-400 block mb-1">Configured Thresholds:</span>
                  {test.config.thresholds.map((t: any, i: number) => (
                    <div key={i} className="text-zinc-300 flex items-center gap-1.5">
                      <span className="text-zinc-500">•</span>
                      <span className="text-purple-300 uppercase">{t.metric}</span>
                      <span className="text-zinc-400">
                        {t.operator === "lt" ? "<" : t.operator === "lte" ? "<=" : t.operator === "gt" ? ">" : t.operator === "gte" ? ">=" : "=="}{" "}
                        {t.targetValue} {t.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEO TEST RESULT SECTION */}
      {test.type === "SEO" && (
        <div className="space-y-6">
          {seoExecutionResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Technical SEO Audit Results
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  Run #{latestResult?.testRunId.slice(0, 8)} • {new Date(latestResult?.createdAt || "").toLocaleTimeString()}
                </span>
              </div>
              <SeoResultViewer result={seoExecutionResult} />
            </div>
          ) : (
            <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No SEO audits run yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Click &quot;Run Test Now&quot; above to inspect page title, metadata, headings, canonical, robots directives, and structured data in headless Chromium.
                </p>
              </div>
            </div>
          )}

          {/* SEO Config Details Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Configured SEO Scope &amp; Assertions
            </h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Target URL:</span>
                <span className="text-white break-all">{test.config.url}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Expected HTTP Status:</span>
                <span className="text-teal-400 font-bold">
                  HTTP {test.config.assertions?.expectedStatusCode ?? 200}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-400">Required Assertions:</span>
                <span className="text-zinc-300">
                  {[
                    test.config.assertions?.titleRequired !== false && "Title",
                    test.config.assertions?.metaDescriptionRequired !== false && "Description",
                    test.config.assertions?.canonicalRequired !== false && "Canonical",
                    test.config.assertions?.h1Required !== false && "H1",
                    test.config.assertions?.noindexDisallowed && "Noindex Disallowed",
                    test.config.assertions?.structuredDataRequired && "Structured Data",
                  ].filter(Boolean).join(", ") || "Standard Technical Checks"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UI TEST RESULT SECTION */}
      {test.type === "UI" && (
        <>
          {latestResult ? (
            <div className="space-y-6">
              {/* Status banner */}
              <div
                className={`p-6 rounded-2xl glass-panel-elevated border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                  isPassed
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : "border-rose-500/30 bg-rose-950/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {isPassed ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isPassed
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {latestResult.status}
                      </span>
                      <span className="text-zinc-400">
                        Run #{latestResult.testRunId.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">
                      {isPassed
                        ? "All assertions and execution steps verified successfully."
                        : latestResult.errorMessage || "Test assertion failed."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {latestResult.durationMs.toLocaleString()}ms
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span>{new Date(latestResult.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Step Waterfall Timeline */}
              <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Step Execution Waterfall
                </h2>

                <div className="space-y-2">
                  {latestResult.stepResults.map((step, idx) => {
                    const pass = step.status === "PASSED";
                    const skip = step.status === "SKIPPED";

                    return (
                      <div
                        key={step.stepId || idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono transition-colors ${
                          pass
                            ? "bg-black/30 border-white/[0.06] text-zinc-300"
                            : skip
                            ? "bg-zinc-900/30 border-white/[0.04] text-zinc-500 opacity-60"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-zinc-500">{idx + 1}.</span>
                          {pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : skip ? (
                            <div className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-500">
                              -
                            </div>
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-bold uppercase tracking-wider text-brand-400">
                            {step.action}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {step.errorMessage && (
                            <span className="text-[11px] text-rose-300 max-w-sm truncate">
                              {step.errorMessage}
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-500">
                            {step.durationMs}ms
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Regression Analysis Card */}
              {latestResult?.metrics?.visualComparison && (
                <div className="space-y-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Visual Regression Status
                  </h2>
                  <VisualRegressionCard
                    projectId={test.projectId}
                    runId={latestResult.testRunId}
                    resultId={latestResult.id}
                    visualComparison={latestResult.metrics.visualComparison}
                    currentUrl={latestResult.metrics.visualComparison.currentUrl}
                    diffUrl={latestResult.metrics.visualComparison.diffUrl}
                    baselineUrl={latestResult.metrics.visualComparison.baselineUrl}
                  />
                </div>
              )}

              {/* Visual Evidence / Screenshots */}
              {latestResult.artifacts.length > 0 && (
                <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Visual Artifacts ({latestResult.artifacts.length})
                    </h2>
                    <Link
                      href={`/dashboard/projects/${test.projectId}/runs/${latestResult.testRunId}/results/${latestResult.id}/artifacts`}
                      className="px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Artifact Viewer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {latestResult.artifacts.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => setSelectedScreenshot(art.url)}
                        className="group relative rounded-xl overflow-hidden border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all bg-black/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.url}
                          alt={art.fileName}
                          className="w-full h-44 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="p-2.5 bg-black/80 backdrop-blur-sm flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300 truncate">{art.fileName}</span>
                          <span className="text-[10px] text-cyan-400 flex items-center gap-1 group-hover:underline">
                            View Fullscreen <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostics: Console Errors */}
              {consoleErrors.length > 0 && (
                <div className="p-6 rounded-2xl glass-panel border border-amber-500/25 bg-amber-950/10 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Browser Console Errors ({consoleErrors.length})
                  </h3>
                  <div className="space-y-1.5 font-mono text-xs text-amber-200/90 bg-black/50 p-3 rounded-xl border border-amber-500/20 overflow-x-auto">
                    {consoleErrors.map((err, i) => (
                      <div key={i} className="py-0.5">
                        <span className="text-rose-400">[error]</span> {err.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostics: Network Failures */}
              {networkFailures.length > 0 && (
                <div className="p-6 rounded-2xl glass-panel border border-rose-500/25 bg-rose-950/10 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-rose-400" />
                    Failed Network Requests Captured ({networkFailures.length})
                  </h3>
                  <div className="space-y-1.5 font-mono text-xs text-rose-200/90 bg-black/50 p-3 rounded-xl border border-rose-500/20 overflow-x-auto">
                    {networkFailures.map((req, i) => (
                      <div key={i} className="py-0.5 flex items-center justify-between gap-4">
                        <span className="truncate">{req.method} {req.url}</span>
                        <span className="text-rose-400 shrink-0 font-bold">{req.errorText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty Run State */
            <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
                <Play className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No executions yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Click &quot;Run Test Now&quot; above to execute this test in headless Chromium and capture screenshots and assertions.
                </p>
              </div>
            </div>
          )}

          {/* Test Steps Spec Card */}
          {test.config.steps && (
            <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Defined Steps Specification
              </h2>
              <div className="space-y-2">
                {test.config.steps.map((st: any, i: number) => (
                  <div
                    key={st.id || i}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-zinc-500">{i + 1}.</span>
                      <span className="text-brand-400 font-bold uppercase">{st.action}</span>
                      <span className="text-zinc-300">{st.target || st.value}</span>
                    </div>
                    {st.value && st.target && (
                      <span className="text-zinc-500">Value: &quot;{st.value}&quot;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Test Execution History & Stability Timeline */}
      <TestDetailHistory
        projectId={test.projectId}
        testId={test.id}
        recentResults={test.recentResults}
      />

      {/* Modal for full-size screenshot preview */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/[0.1] rounded-2xl overflow-hidden p-2 shadow-2xl space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-3 py-1 text-xs text-zinc-400 font-mono">
              <span>Captured Screenshot</span>
              <button
                type="button"
                onClick={() => setSelectedScreenshot(null)}
                className="hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedScreenshot}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
