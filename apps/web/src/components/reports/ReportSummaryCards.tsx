"use client";

import React from "react";
import { ReportSummary } from "@/lib/reports/report-types";

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
  const getCardClasses = (targetStatus: string) => {
    const isSelected = selectedStatus.toLowerCase() === targetStatus.toLowerCase();
    const cursor = onSelectStatus ? "cursor-pointer" : "";
    return `p-3.5 rounded-md border transition-all ${cursor} ${
      isSelected
        ? "bg-white/[0.08] border-emerald-500/80"
        : "bg-[#111319] border-white/[0.08] hover:border-white/[0.18]"
    }`;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Tests */}
        <div
          onClick={() => onSelectStatus?.("all")}
          className={getCardClasses("all")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Tests</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{summary.totalTests}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Executions</div>
        </div>

        {/* Passed Tests */}
        <div
          onClick={() => onSelectStatus?.("passed")}
          className={getCardClasses("passed")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Passed</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.passedTests}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Assertions met</div>
        </div>

        {/* Failed Tests */}
        <div
          onClick={() => onSelectStatus?.("failed")}
          className={getCardClasses("failed")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Failed</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{summary.failedTests}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Failures detected</div>
        </div>

        {/* Errors */}
        <div
          onClick={() => onSelectStatus?.("errors")}
          className={getCardClasses("errors")}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Errors</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{summary.errorTests}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Timeouts / crashes</div>
        </div>

        {/* Pass Rate */}
        <div className="p-3.5 rounded-md bg-[#111319] border border-white/[0.08]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Pass Rate</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{summary.passRate}%</div>
          <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                summary.passRate >= 90 ? "bg-emerald-500" : summary.passRate >= 70 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, summary.passRate))}%` }}
            />
          </div>
        </div>

        {/* Total Duration */}
        <div className="p-3.5 rounded-md bg-[#111319] border border-white/[0.08]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Duration</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{summary.formattedDuration}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            {summary.isRunning ? "Running..." : "Wall time"}
          </div>
        </div>
      </div>
    </div>
  );
}
