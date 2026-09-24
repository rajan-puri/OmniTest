"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RunReport } from "@/lib/reports/report-types";
import { RunReportViewer } from "@/components/reports/RunReportViewer";
import {
  FileText,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RotateCcw,
  FolderGit2,
} from "lucide-react";

export default function RunReportPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const runId = params.runId as string;

  const [report, setReport] = useState<RunReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runId}/report`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Test run or report not found.");
        }
        if (res.status === 401) {
          throw new Error("You are not authorized to view this report.");
        }
        throw new Error("Failed to load run report.");
      }
      const data = await res.json();
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, runId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Auto-refresh if the run is still in progress
  useEffect(() => {
    if (!report) return;
    if (report.status === "RUNNING" || report.status === "QUEUED") {
      const timer = setInterval(() => {
        fetchReport(true);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [report, fetchReport]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">Generating Unified Test Report</p>
          <p className="text-xs text-zinc-400 font-mono mt-1">Aggregating execution data across testing engines...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="p-6 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5 space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Report Unavailable</h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono">{error || "Unable to locate test run execution records."}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fetchReport()}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" /> Back to Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>{report.project.name}</span>
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/runs"
          className="hover:text-white transition-colors"
        >
          Runs
        </Link>
        <span>/</span>
        <span className="text-zinc-300 font-bold">Report</span>
      </div>

      {/* Main Report View */}
      <RunReportViewer
        report={report}
        onRefresh={() => fetchReport(true)}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
