"use client";

import React, { useState } from "react";
import {
  PerformanceTestSpec,
  PerformanceThreshold,
  PerformanceThresholdKey,
  PerformanceThresholdOperator,
} from "@/lib/runner/perf-types";
import {
  Zap,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  Sliders,
  AlertCircle,
  Info,
} from "lucide-react";

interface PerformanceTestConfigProps {
  initialSpec: PerformanceTestSpec;
  baseUrl?: string;
  onChange: (spec: PerformanceTestSpec) => void;
}

const DEFAULT_PRESET_THRESHOLDS: PerformanceThreshold[] = [
  { id: "t_lcp", metric: "lcp", operator: "lt", targetValue: 2500, unit: "ms" },
  { id: "t_cls", metric: "cls", operator: "lt", targetValue: 0.1, unit: "score" },
  { id: "t_fcp", metric: "fcp", operator: "lt", targetValue: 1800, unit: "ms" },
  { id: "t_ttfb", metric: "ttfb", operator: "lt", targetValue: 800, unit: "ms" },
  { id: "t_failed", metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" },
];

export function PerformanceTestConfig({
  initialSpec,
  baseUrl,
  onChange,
}: PerformanceTestConfigProps) {
  const [url, setUrl] = useState(initialSpec.url || baseUrl || "https://example.com");
  const [device, setDevice] = useState<"desktop" | "mobile">(initialSpec.device || "desktop");
  const [measurementRuns, setMeasurementRuns] = useState<number>(initialSpec.measurementRuns || 1);
  const [warmupRuns, setWarmupRuns] = useState<number>(initialSpec.warmupRuns || 0);
  const [thresholds, setThresholds] = useState<PerformanceThreshold[]>(
    initialSpec.thresholds && initialSpec.thresholds.length > 0
      ? initialSpec.thresholds
      : DEFAULT_PRESET_THRESHOLDS
  );

  const propagate = (
    nextUrl: string,
    nextDevice: "desktop" | "mobile",
    nextRuns: number,
    nextWarmup: number,
    nextThresholds: PerformanceThreshold[]
  ) => {
    onChange({
      version: "1.0",
      url: nextUrl,
      device: nextDevice,
      measurementRuns: nextRuns,
      warmupRuns: nextWarmup,
      thresholds: nextThresholds,
      timeoutSeconds: initialSpec.timeoutSeconds || 30,
    });
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    propagate(val, device, measurementRuns, warmupRuns, thresholds);
  };

  const handleDeviceChange = (val: "desktop" | "mobile") => {
    setDevice(val);
    propagate(url, val, measurementRuns, warmupRuns, thresholds);
  };

  const handleRunsChange = (val: number) => {
    setMeasurementRuns(val);
    propagate(url, device, val, warmupRuns, thresholds);
  };

  const handleWarmupChange = (val: number) => {
    setWarmupRuns(val);
    propagate(url, device, measurementRuns, val, thresholds);
  };

  const updateThreshold = (index: number, field: keyof PerformanceThreshold, value: any) => {
    const updated = thresholds.map((t, i) => {
      if (i === index) {
        const next = { ...t, [field]: value };
        if (field === "metric") {
          if (value === "cls") next.unit = "score";
          else if (value === "failedRequests") next.unit = "count";
          else next.unit = "ms";
        }
        return next;
      }
      return t;
    });
    setThresholds(updated);
    propagate(url, device, measurementRuns, warmupRuns, updated);
  };

  const addThreshold = () => {
    const next: PerformanceThreshold = {
      id: `t_${Date.now()}`,
      metric: "totalLoad",
      operator: "lt",
      targetValue: 4000,
      unit: "ms",
    };
    const updated = [...thresholds, next];
    setThresholds(updated);
    propagate(url, device, measurementRuns, warmupRuns, updated);
  };

  const removeThreshold = (index: number) => {
    const updated = thresholds.filter((_, i) => i !== index);
    setThresholds(updated);
    propagate(url, device, measurementRuns, warmupRuns, updated);
  };

  return (
    <div className="space-y-6">
      {/* Target URL Card */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Target Web Page
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Headless Chromium Runner</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Audit URL <span className="text-rose-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com or /dashboard"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Accepts fully qualified URLs (http/https) or relative paths resolving against the project base URL.
          </p>
        </div>
      </div>

      {/* Device & Measurement Environment */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Device &amp; Consistency Settings
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Environment Emulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Device Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Device Viewport</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDeviceChange("desktop")}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs transition-all ${
                  device === "desktop"
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold"
                    : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span>Desktop (1280x720)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeviceChange("mobile")}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs transition-all ${
                  device === "mobile"
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold"
                    : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Mobile (390x844)</span>
              </button>
            </div>
          </div>

          {/* Measurement Runs Mode */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Runs &amp; Aggregation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleRunsChange(1);
                  handleWarmupChange(0);
                }}
                className={`p-3 rounded-xl border flex flex-col text-left transition-all ${
                  measurementRuns === 1 && warmupRuns === 0
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold"
                    : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
                }`}
              >
                <span className="text-xs">Single Run</span>
                <span className="text-[10px] text-zinc-500 font-normal">Fastest execution</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRunsChange(3);
                  handleWarmupChange(1);
                }}
                className={`p-3 rounded-xl border flex flex-col text-left transition-all ${
                  measurementRuns === 3 && warmupRuns === 1
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold"
                    : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
                }`}
              >
                <span className="text-xs">Warmup + 3 Runs</span>
                <span className="text-[10px] text-zinc-500 font-normal">Median aggregated</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Rules */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Deterministic Performance Thresholds ({thresholds.length})
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              The test will strictly FAIL if any configured threshold is breached.
            </p>
          </div>
          <button
            type="button"
            onClick={addThreshold}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-200 border border-white/[0.08] flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>

        <div className="space-y-2.5">
          {thresholds.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                {/* Metric Selection */}
                <select
                  value={rule.metric}
                  onChange={(e) =>
                    updateThreshold(idx, "metric", e.target.value as PerformanceThresholdKey)
                  }
                  className="px-2.5 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="lcp">LCP (Largest Contentful Paint)</option>
                  <option value="cls">CLS (Cumulative Layout Shift)</option>
                  <option value="fcp">FCP (First Contentful Paint)</option>
                  <option value="ttfb">TTFB (Time to First Byte)</option>
                  <option value="domContentLoaded">DOM Content Loaded</option>
                  <option value="loadEvent">Load Event End</option>
                  <option value="totalLoad">Total Page Load Duration</option>
                  <option value="failedRequests">Failed Network Requests</option>
                </select>

                {/* Operator Selection */}
                <select
                  value={rule.operator}
                  onChange={(e) =>
                    updateThreshold(idx, "operator", e.target.value as PerformanceThresholdOperator)
                  }
                  className="px-2.5 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="lt">&lt; (Less than)</option>
                  <option value="lte">&le; (Less than or equal)</option>
                  <option value="gt">&gt; (Greater than)</option>
                  <option value="gte">&ge; (Greater than or equal)</option>
                  <option value="eq">== (Equals)</option>
                </select>

                {/* Target Value Input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step={rule.metric === "cls" ? "0.01" : "1"}
                    value={rule.targetValue}
                    onChange={(e) =>
                      updateThreshold(idx, "targetValue", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-zinc-500 font-mono text-[11px] shrink-0">
                    {rule.metric === "cls" ? "score" : rule.metric === "failedRequests" ? "req" : "ms"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeThreshold(idx)}
                className="text-zinc-500 hover:text-rose-400 p-1.5 rounded transition-colors self-end sm:self-center"
                aria-label={`Remove threshold ${idx + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Synthetic Measurement Disclaimer */}
      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-start gap-3 text-xs text-purple-300">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Synthetic Performance Notice</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Performance metrics are captured directly from real Chromium browser performance APIs.
            Measurements represent synthetic automated conditions and are not equivalent to Real User Monitoring
            (RUM). INP is reported as unavailable during non-interactive page load audits.
          </p>
        </div>
      </div>
    </div>
  );
}
