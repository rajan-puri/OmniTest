"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { TestTrendMetrics, TestDurationTrendPoint } from "@/lib/history/history-types";

interface HistoryTrendsProps {
  trends?: TestTrendMetrics;
  avgDurationMs: number;
}

export function HistoryTrends({ trends, avgDurationMs }: HistoryTrendsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TestDurationTrendPoint | null>(null);

  if (!trends || (!trends.durationTrend.length && !trends.activityTrend.length)) {
    return null;
  }

  const durationData = trends.durationTrend;
  const maxDuration = Math.max(...durationData.map((d) => d.durationMs), avgDurationMs, 100);

  // SVG dimensions for Duration Sparkline
  const svgWidth = 500;
  const svgHeight = 120;
  const paddingX = 20;
  const paddingY = 20;

  // Build SVG path points
  const points = durationData.map((d, index) => {
    const x =
      durationData.length === 1
        ? svgWidth / 2
        : paddingX + (index / (durationData.length - 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      (d.durationMs / (maxDuration * 1.15)) * (svgHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
          ""
        )
      : "";

  // Average reference line y
  const avgY =
    svgHeight -
    paddingY -
    (avgDurationMs / (maxDuration * 1.15)) * (svgHeight - paddingY * 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. DURATION TREND (Sparkline) */}
      <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-white/[0.08] flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Execution Duration Trend
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
              Last {durationData.length} runs
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {trends.isSlower ? (
              <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <TrendingUp className="w-3.5 h-3.5" /> Slowdown Detected (+{trends.durationChangePct}%)
              </span>
            ) : trends.durationChangePct < -5 ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <TrendingDown className="w-3.5 h-3.5" /> Faster Execution ({trends.durationChangePct}%)
              </span>
            ) : (
              <span className="text-zinc-400 text-[11px]">
                Avg: <strong className="text-white font-mono">{avgDurationMs}ms</strong>
              </span>
            )}
          </div>
        </div>

        {/* Interactive SVG Sparkline */}
        <div className="relative w-full h-[130px] select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Average baseline indicator */}
            {avgY > 0 && avgY < svgHeight && (
              <line
                x1={paddingX}
                y1={avgY}
                x2={svgWidth - paddingX}
                y2={avgY}
                stroke="#52525b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            )}

            {/* Shaded Area under sparkline */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`}
                fill="url(#durationGradient)"
              />
            )}

            {/* Sparkline path */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((pt, i) => {
              const isPass = pt.data.status === "PASSED";
              const isHovered = hoveredPoint?.resultId === pt.data.resultId;
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3.5}
                  className="cursor-pointer transition-all"
                  fill={isPass ? "#10b981" : "#f43f5e"}
                  stroke="#090a0f"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(pt.data)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredPoint && (
            <div className="absolute top-1 right-2 p-2 rounded-xl bg-zinc-900 border border-white/[0.15] text-[11px] font-mono shadow-xl z-10 pointer-events-none flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredPoint.status === "PASSED" ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              <span className="text-white font-bold">{hoveredPoint.durationMs}ms</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {new Date(hoveredPoint.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
          <span>Earlier runs</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-0.5 bg-zinc-500 border-dashed" /> Avg ({avgDurationMs}ms)
          </span>
          <span>Latest run</span>
        </div>
      </div>

      {/* 2. RECENT EXECUTION PATTERN & FLAKINESS */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Stability &amp; Pattern
              </h3>
            </div>
            {trends.consecutiveFailures > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                {trends.consecutiveFailures} consecutive fail{trends.consecutiveFailures > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Status distribution of the most recent executions across this scope.
          </p>

          {/* Pass/Fail Micro-Blocks Timeline */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">
              Recent Sequence (Latest on Right &rarr;)
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {trends.passFailTrend.map((status, i) => (
                <div
                  key={i}
                  title={`Run #${i + 1}: ${status}`}
                  className={`w-4 h-7 rounded-sm transition-transform hover:scale-110 flex items-center justify-center ${
                    status === "PASSED"
                      ? "bg-emerald-500/25 border border-emerald-500/40 text-emerald-400"
                      : "bg-rose-500/25 border border-rose-500/40 text-rose-400"
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold">
                    {status === "PASSED" ? "P" : "F"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flakiness Meter */}
        <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              Flakiness Score:
            </span>
            <span
              className={`font-bold ${
                trends.flakinessScore > 40
                  ? "text-rose-400"
                  : trends.flakinessScore > 15
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {trends.flakinessScore}%{" "}
              <span className="text-[10px] text-zinc-500 font-normal">
                ({trends.flakinessScore > 40 ? "Unstable" : trends.flakinessScore > 15 ? "Moderate" : "Stable"})
              </span>
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                trends.flakinessScore > 40
                  ? "bg-rose-500"
                  : trends.flakinessScore > 15
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(5, trends.flakinessScore)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
