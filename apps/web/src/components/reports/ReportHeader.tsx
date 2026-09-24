"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  Download,
  RotateCw,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { RunReport } from "@/lib/reports/report-types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ReportHeaderProps {
  report: RunReport;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ReportHeader({ report, onRefresh, isRefreshing }: ReportHeaderProps) {
  const handleExportJson = () => {
    window.open(
      `/api/projects/${report.project.id}/runs/${report.testRunId}/report?export=json`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/projects/${report.project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{report.project.name}</span>
          {report.suite && (
            <>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-300">{report.suite.name}</span>
            </>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors disabled:opacity-50"
              title="Refresh report data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 font-semibold text-xs border border-white/[0.1] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Report Header Card */}
      <div className="p-4 rounded-md surface-card border border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                Run #{report.testRunId.slice(0, 8)}
              </h1>
              <StatusBadge status={report.status} size="md" />
            </div>

            <p className="text-xs text-zinc-400 font-mono">
              Target: <span className="text-zinc-200">{report.targetUrl || "Default Base URL"}</span> • Trigger:{" "}
              <span className="text-zinc-200">{report.trigger}</span> • Env:{" "}
              <span className="text-zinc-200 uppercase">{report.environment}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 border-t md:border-t-0 md:border-l border-white/[0.08] pt-2 md:pt-0 md:pl-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Duration:</span>
              <span className="font-semibold text-white">{report.summary.formattedDuration}</span>
            </div>
            {report.summary.startedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Started:</span>
                <span className="text-zinc-300">
                  {new Date(report.summary.startedAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
