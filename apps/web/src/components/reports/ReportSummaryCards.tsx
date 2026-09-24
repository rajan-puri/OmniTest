"use client";

import React from "react";
import { ReportSummary } from "@/lib/reports/report-types";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Percent, ShieldCheck } from "lucide-react";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function ReportSummaryCards({
  summary,
  selectedStatus = "all",
  onSelectStatus,
}: ReportSummaryCardsProps) {
  const getCardClasses = (targetStatus: string, defaultBorder: string) => {
    const isSelected = selectedStatus.toLowerCase() === targetStatus.toLowerCase();
    const cursor = onSelectStatus ? "cursor-pointer" : "";
    return `p-4 rounded-xl border transition-all ${cursor} ${
      isSelected
        ? "ring-2 ring-brand-500 bg-white/[0.08] border-brand-500/60"
        : `glass-panel ${defaultBorder} hover:border-white/[0.2]`
    }`;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tests */}
        <div
          onClick={() => onSelectStatus?.("all")}
          className={getCardClasses("all", "border-white/[0.08]")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Tests</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{summary.totalTests}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Executions</div>
        </div>

        {/* Passed Tests */}
        <div
          onClick={() => onSelectStatus?.("passed")}
          className={getCardClasses("passed", "border-emerald-500/20")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{summary.passedTests}</div>
          <div className="text-[11px] text-emerald-500/70 mt-0.5">Success criteria met</div>
        </div>

        {/* Failed Tests */}
        <div
          onClick={() => onSelectStatus?.("failed")}
          className={getCardClasses("failed", "border-rose-500/20")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{summary.failedTests}</div>
          <div className="text-[11px] text-rose-500/70 mt-0.5">Assertions breached</div>
        </div>

        {/* Errors */}
        <div
          onClick={() => onSelectStatus?.("errors")}
          className={getCardClasses("errors", "border-amber-500/20")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Errors
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{summary.errorTests}</div>
          <div className="text-[11px] text-amber-500/70 mt-0.5">Runtime / timeouts</div>
        </div>

        {/* Pass Rate */}
        <div className="p-4 rounded-xl glass-panel border border-white/[0.08]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-brand-400" /> Pass Rate
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{summary.passRate}%</div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.passRate >= 90
                  ? "bg-emerald-500"
                  : summary.passRate >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, summary.passRate))}%` }}
            />
          </div>
        </div>

        {/* Total Duration */}
        <div className="p-4 rounded-xl glass-panel border border-white/[0.08]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Duration
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{summary.formattedDuration}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {summary.isRunning ? "Elapsed time" : "Complete runtime"}
          </div>
        </div>
      </div>
    </div>
  );
}
