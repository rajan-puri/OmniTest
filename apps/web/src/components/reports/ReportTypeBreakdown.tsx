"use client";

import React from "react";
import { ReportTypeBreakdown as IReportTypeBreakdown, TestEngineType } from "@/lib/reports/report-types";
import { FileCode2, Globe2, Eye, Zap, Search, Layers } from "lucide-react";

interface ReportTypeBreakdownProps {
  breakdown: IReportTypeBreakdown[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function ReportTypeBreakdown({
  breakdown,
  selectedType,
  onSelectType,
}: ReportTypeBreakdownProps) {
  const getIcon = (type: TestEngineType) => {
    switch (type) {
      case "UI":
        return <FileCode2 className="w-4 h-4 text-brand-400" />;
      case "API":
        return <Globe2 className="w-4 h-4 text-emerald-400" />;
      case "ACCESSIBILITY":
        return <Eye className="w-4 h-4 text-amber-400" />;
      case "PERFORMANCE":
        return <Zap className="w-4 h-4 text-purple-400" />;
      case "SEO":
        return <Search className="w-4 h-4 text-teal-400" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Testing Engine Breakdown
        </h2>
        {selectedType !== "all" && (
          <button
            onClick={() => onSelectType("all")}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-mono"
          >
            Show All Engines
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {breakdown.map((item) => {
          const isSelected = selectedType.toUpperCase() === item.type;
          const hasFailures = item.failed > 0 || item.errors > 0;

          return (
            <div
              key={item.type}
              onClick={() => onSelectType(isSelected ? "all" : item.type)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-white/[0.08] ring-2 ring-brand-500 border-brand-500/60 shadow-md"
                  : "glass-panel border-white/[0.08] hover:border-white/[0.2]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <span className="text-xs font-bold text-white">{item.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.total === 0
                      ? "bg-zinc-800 text-zinc-500"
                      : !hasFailures
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {item.passRate}%
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  <strong className="text-white text-base">{item.total}</strong> {item.total === 1 ? "test" : "tests"}
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400">{item.passed} pass</span>
                  {hasFailures && (
                    <span className="text-rose-400 font-bold">{item.failed + item.errors} fail</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
