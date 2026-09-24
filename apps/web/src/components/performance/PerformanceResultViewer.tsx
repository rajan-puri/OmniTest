"use client";

import React, { useState } from "react";
import { PerformanceExecutionResult, ThresholdEvaluationResult } from "@/lib/runner/perf-types";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Gauge,
  Activity,
  Layers,
  FileCode,
  Image as ImageIcon,
  Type,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  Maximize2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PerformanceResultViewerProps {
  result: PerformanceExecutionResult;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMs(ms: number | null): string {
  if (ms === null || ms === undefined) return "N/A";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function PerformanceResultViewer({ result }: PerformanceResultViewerProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const isPassed = result.status === "PASSED";
  const { vitals, pageMetrics, network, thresholds } = result;

  return (
    <div className="space-y-6">
      {/* 1. Status & Run Overview Banner */}
      <div
        className={`p-4 rounded-lg surface-card border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isPassed ? "border-emerald-500/25 bg-emerald-950/10" : "border-rose-500/25 bg-rose-950/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] shrink-0">
            <StatusBadge status={result.status} showDotOnly size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <StatusBadge status={result.status} size="sm" />
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 flex items-center gap-1">
                {result.device === "mobile" ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-zinc-500" /> Mobile Viewport
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-zinc-500" /> Desktop Viewport
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5 max-w-xl">
              {isPassed
                ? "All configured performance thresholds satisfied."
                : result.errorSummary || "Performance thresholds exceeded acceptable limits."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {result.durationMs.toLocaleString()} ms total
          </span>
          <span className="text-zinc-600">|</span>
          <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 2. Core Web Vitals Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" />
            Core Web Vitals
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Real browser measurements</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* LCP Card */}
          <div className="p-3.5 rounded-lg surface-card border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold">LCP</span>
              <span className="text-[10px] text-zinc-500">Largest Contentful Paint</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {formatMs(vitals.lcp)}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {vitals.lcp !== null ? (
                vitals.lcp <= 2500 ? (
                  <span className="text-emerald-400 font-medium">Good (&le; 2.5s)</span>
                ) : vitals.lcp <= 4000 ? (
                  <span className="text-amber-400 font-medium">Needs Work (2.5s - 4.0s)</span>
                ) : (
                  <span className="text-rose-400 font-medium">Poor (&gt; 4.0s)</span>
                )
              ) : (
                <span className="text-zinc-500">Not recorded</span>
              )}
            </div>
          </div>

          {/* CLS Card */}
          <div className="p-3.5 rounded-lg surface-card border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold">CLS</span>
              <span className="text-[10px] text-zinc-500">Cumulative Layout Shift</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {vitals.cls !== null ? vitals.cls.toFixed(3) : "N/A"}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {vitals.cls !== null ? (
                vitals.cls <= 0.1 ? (
                  <span className="text-emerald-400 font-medium">Good (&le; 0.1)</span>
                ) : vitals.cls <= 0.25 ? (
                  <span className="text-amber-400 font-medium">Needs Work (0.1 - 0.25)</span>
                ) : (
                  <span className="text-rose-400 font-medium">Poor (&gt; 0.25)</span>
                )
              ) : (
                <span className="text-zinc-500">Not recorded</span>
              )}
            </div>
          </div>

          {/* INP Card */}
          <div className="p-3.5 rounded-lg surface-card border border-white/[0.08] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold">INP</span>
              <span className="text-[10px] text-zinc-500">Interaction to Next Paint</span>
            </div>
            <div className="text-xl font-bold font-mono text-zinc-500">
              N/A
            </div>
            <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>Synthetic load</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Page Navigation Timing & Network Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Navigation Timing */}
        <div className="p-4 rounded-lg surface-card border border-white/[0.08] space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            Page Timing Metrics
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">FCP (First Contentful Paint):</span>
              <span className="text-white font-bold">{formatMs(pageMetrics.fcp)}</span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">TTFB (Time to First Byte):</span>
              <span className="text-white font-bold">{formatMs(pageMetrics.ttfb)}</span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">DOM Content Loaded:</span>
              <span className="text-white font-bold">{formatMs(pageMetrics.domContentLoaded)}</span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Load Event End:</span>
              <span className="text-white font-bold">{formatMs(pageMetrics.loadEvent)}</span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Total Page Load Duration:</span>
              <span className="text-emerald-400 font-bold">{formatMs(pageMetrics.totalLoad)}</span>
            </div>
          </div>
        </div>

        {/* Network & Transfer Summary */}
        <div className="p-4 rounded-lg surface-card border border-white/[0.08] space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            Network &amp; Request Analysis
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Total HTTP Requests:</span>
              <span className="text-white font-bold">{network.totalRequests}</span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Failed Network Requests:</span>
              <span
                className={`font-bold ${
                  network.failedRequests === 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {network.failedRequests}
              </span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Total Bytes Transferred:</span>
              <span className="text-white font-bold">
                {formatBytes(network.totalBytesTransferred)}
              </span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Audited URL:</span>
              <span className="text-zinc-300 truncate max-w-[200px]" title={result.url}>
                {result.url}
              </span>
            </div>
            <div className="p-2 rounded-md bg-black/40 border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-400">Measurement Method:</span>
              <span className="text-zinc-400 text-[11px] truncate max-w-[200px]" title={result.methodology}>
                {result.runsCount > 1 ? `Median of ${result.runsCount} runs` : "Single run"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Resource Breakdown */}
      <div className="p-4 rounded-lg surface-card border border-white/[0.08] space-y-2.5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          Resource Breakdown by Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          {/* JavaScript */}
          <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <FileCode className="w-3.5 h-3.5" />
              <span className="font-bold">JavaScript</span>
            </div>
            <div className="text-white font-bold">{formatBytes(network.resources.javascript.bytes)}</div>
            <div className="text-[11px] text-zinc-500">{network.resources.javascript.count} requests</div>
          </div>

          {/* CSS */}
          <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-blue-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="font-bold">CSS</span>
            </div>
            <div className="text-white font-bold">{formatBytes(network.resources.css.bytes)}</div>
            <div className="text-[11px] text-zinc-500">{network.resources.css.count} requests</div>
          </div>

          {/* Images */}
          <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="font-bold">Images</span>
            </div>
            <div className="text-white font-bold">{formatBytes(network.resources.images.bytes)}</div>
            <div className="text-[11px] text-zinc-500">{network.resources.images.count} requests</div>
          </div>

          {/* Fonts */}
          <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-pink-400">
              <Type className="w-3.5 h-3.5" />
              <span className="font-bold">Fonts</span>
            </div>
            <div className="text-white font-bold">{formatBytes(network.resources.fonts.bytes)}</div>
            <div className="text-[11px] text-zinc-500">{network.resources.fonts.count} requests</div>
          </div>

          {/* Other */}
          <div className="p-2.5 rounded-md bg-black/40 border border-white/[0.04] space-y-0.5">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Layers className="w-3.5 h-3.5" />
              <span className="font-bold">Other</span>
            </div>
            <div className="text-white font-bold">{formatBytes(network.resources.other.bytes)}</div>
            <div className="text-[11px] text-zinc-500">{network.resources.other.count} requests</div>
          </div>
        </div>
      </div>

      {/* 5. Threshold Assertions Table */}
      {thresholds && thresholds.length > 0 && (
        <div className="p-4 rounded-lg surface-card border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Threshold Assertions ({thresholds.filter((t) => t.passed).length}/{thresholds.length} Passed)
            </h3>
          </div>

          <div className="space-y-1.5">
            {thresholds.map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-md border flex items-center justify-between text-xs font-mono ${
                  t.passed
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-rose-500/5 border-rose-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.passed ? "PASSED" : "FAILED"} showDotOnly size="sm" />
                  <span className="text-zinc-200">{t.message}</span>
                </div>
                <StatusBadge status={t.passed ? "PASSED" : "FAILED"} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Visual Evidence Screenshot */}
      {result.screenshotUrl && (
        <div className="p-4 rounded-lg surface-card border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              Page Screenshot Evidence
            </h3>
            <button
              type="button"
              onClick={() => setSelectedScreenshot(result.screenshotUrl || null)}
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-zinc-500" /> Enlarge
            </button>
          </div>

          <div
            className="rounded-md overflow-hidden border border-white/[0.08] bg-black/40 max-h-80 cursor-pointer"
            onClick={() => setSelectedScreenshot(result.screenshotUrl || null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.screenshotUrl}
              alt="Performance capture"
              className="w-full object-cover object-top hover:opacity-90 transition-opacity"
            />
          </div>
        </div>
      )}

      {/* Full-size screenshot modal */}
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
              <span>Performance Visual Evidence</span>
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
              alt="Performance Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
