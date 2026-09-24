"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock, PlayCircle, Gauge } from "lucide-react";
import { TestHistorySummary } from "@/lib/history/history-types";

interface HistorySummaryCardsProps {
  summary: TestHistorySummary;
}

export function HistorySummaryCards({ summary }: HistorySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Executions */}
      <div className="p-4 rounded-xl glass-panel border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Total Executions
          </span>
          <PlayCircle className="w-4 h-4 text-violet-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white">
          {summary.totalExecutions.toLocaleString()}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
          Historical test results
        </span>
      </div>

      {/* 2. Success Rate */}
      <div className="p-4 rounded-xl glass-panel border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Success Rate
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
          {summary.passRate}%
          <span className="text-xs font-normal text-zinc-500 font-mono">
            ({summary.passedExecutions} passed)
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
          Across filtered range
        </span>
      </div>

      {/* 3. Failures */}
      <div className="p-4 rounded-xl glass-panel border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Failed / Timeouts
          </span>
          <XCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-rose-400 flex items-baseline gap-2">
          {summary.failedExecutions + summary.timedOutExecutions}
          {summary.timedOutExecutions > 0 && (
            <span className="text-[10px] text-amber-400 font-mono">
              ({summary.timedOutExecutions} timeouts)
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
          {summary.totalExecutions > 0
            ? `${Math.round(((summary.failedExecutions + summary.timedOutExecutions) / summary.totalExecutions) * 100)}% failure rate`
            : "No failures"}
        </span>
      </div>

      {/* 4. Avg Duration */}
      <div className="p-4 rounded-xl glass-panel border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Avg Duration
          </span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-400">
          {summary.avgDurationMs}ms
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
          <span>Min: {summary.minDurationMs}ms</span>
          <span>•</span>
          <span>Max: {summary.maxDurationMs}ms</span>
        </div>
      </div>
    </div>
  );
}
