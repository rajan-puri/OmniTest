"use client";

import React from "react";
import Link from "next/link";
import { ReportFailureItem } from "@/lib/reports/report-types";
import {
  XCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileCode2,
  Globe2,
  Eye,
  Zap,
  Search,
  Camera,
} from "lucide-react";

interface ReportFailuresSectionProps {
  failures: ReportFailureItem[];
  errors: ReportFailureItem[];
  projectId: string;
  runId?: string;
}

export function ReportFailuresSection({
  failures,
  errors,
  projectId,
  runId,
}: ReportFailuresSectionProps) {
  const totalIssues = failures.length + errors.length;

  if (totalIssues === 0) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-4 text-emerald-300">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">All Tests Passed Successfully</h3>
          <p className="text-xs text-emerald-400/80 mt-0.5">
            Zero test assertion breaches or runtime errors were encountered in this execution run.
          </p>
        </div>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "API":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <Globe2 className="w-3 h-3" /> API
          </span>
        );
      case "ACCESSIBILITY":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <Eye className="w-3 h-3" /> Accessibility
          </span>
        );
      case "PERFORMANCE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
            <Zap className="w-3 h-3" /> Performance
          </span>
        );
      case "SEO":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/25">
            <Search className="w-3 h-3" /> SEO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/25">
            <FileCode2 className="w-3 h-3" /> Browser UI
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-400" />
          Attention Required ({totalIssues} {totalIssues === 1 ? "Issue" : "Issues"})
        </h2>
        <span className="text-xs font-mono text-zinc-400">
          {failures.length} failed assertions • {errors.length} runtime errors
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Render Assertion Failures */}
        {failures.map((item) => (
          <div
            key={item.testResultId}
            className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 hover:border-rose-700/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                {getTypeBadge(item.type)}
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" /> {item.formattedDuration}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 text-xs font-mono text-rose-300 break-words">
                {item.failureReason}
              </div>

              {item.detailsSnippet && (
                <div className="text-[11px] text-zinc-400 font-mono">
                  Context: <span className="text-zinc-300">{item.detailsSnippet}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              {runId && (
                <Link
                  href={`/dashboard/projects/${projectId}/runs/${runId}/results/${item.testResultId}/artifacts`}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Artifacts</span>
                </Link>
              )}
              {item.testId && (
                <Link
                  href={`/dashboard/tests/${item.testId}`}
                  className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Inspect Result <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* Render Execution / Runtime Errors */}
        {errors.map((item) => (
          <div
            key={item.testResultId}
            className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 hover:border-amber-700/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                {getTypeBadge(item.type)}
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {item.status}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" /> {item.formattedDuration}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs font-mono text-amber-300 break-words">
                {item.failureReason}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              {runId && (
                <Link
                  href={`/dashboard/projects/${projectId}/runs/${runId}/results/${item.testResultId}/artifacts`}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Artifacts</span>
                </Link>
              )}
              {item.testId && (
                <Link
                  href={`/dashboard/tests/${item.testId}`}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Inspect Error <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
