"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RotateCw,
  FolderGit2,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { RunReport } from "@/lib/reports/report-types";

interface ReportHeaderProps {
  report: RunReport;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ReportHeader({ report, onRefresh, isRefreshing }: ReportHeaderProps) {
  const isPassed = report.status === "PASSED";
  const isRunning = report.status === "RUNNING" || report.status === "QUEUED";
  const isFailed = report.status === "FAILED";
  const isTimedOut = report.status === "TIMED_OUT";

  const handleExportJson = () => {
    window.open(
      `/api/projects/${report.project.id}/runs/${report.testRunId}/report?export=json`,
      "_blank"
    );
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
          <Activity className="w-3.5 h-3.5 animate-spin" /> RUNNING
        </span>
      );
    }
    if (isPassed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
        </span>
      );
    }
    if (isTimedOut) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <Clock className="w-3.5 h-3.5" /> TIMED OUT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" /> FAILED
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/projects/${report.project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {report.project.name}
        </Link>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors disabled:opacity-50"
              title="Refresh report data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Main Report Banner Card */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-brand-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> OmniTest Report
              </span>
              <span>•</span>
              <span>{report.project.name}</span>
              {report.suite && (
                <>
                  <span>/</span>
                  <span className="text-zinc-200">{report.suite.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                Run #{report.testRunId.slice(0, 8)}
              </h1>
              {getStatusBadge()}
            </div>

            <p className="text-xs text-zinc-400 font-mono">
              Target: <span className="text-zinc-200">{report.targetUrl || "Default Base URL"}</span> • Trigger:{" "}
              <span className="text-zinc-200">{report.trigger}</span> • Env:{" "}
              <span className="text-zinc-200 uppercase">{report.environment}</span>
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs font-mono text-zinc-400 border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Duration:</span>
              <span className="font-bold text-white">{report.summary.formattedDuration}</span>
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
            <div className="text-[11px] text-zinc-500">
              Generated: {new Date(report.summary.generatedAt).toLocaleDateString()},{" "}
              {new Date(report.summary.generatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
