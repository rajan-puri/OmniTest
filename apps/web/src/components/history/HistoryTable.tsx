"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Camera,
  FileText,
  AlertTriangle,
  Globe2,
  Eye,
  Zap,
  Search,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
} from "lucide-react";
import { TestHistoryItem } from "@/lib/history/history-types";

interface HistoryTableProps {
  projectId: string;
  items: TestHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

// Relative time helper
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function HistoryTable({
  projectId,
  items,
  pagination,
  onPageChange,
  isLoading = false,
}: HistoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="p-12 rounded-2xl glass-panel border border-dashed border-white/[0.12] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
          <Clock className="w-6 h-6 text-zinc-500" />
        </div>
        <h3 className="text-sm font-semibold text-white">No test executions found</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          No test runs match your selected filter criteria. Try clearing search filters or running tests from your test suites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Test</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Executed</th>
                <th className="py-3 px-4">Diagnostics / Visual</th>
                <th className="py-3 px-3">Artifacts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {items.map((item) => {
                const isPassed = item.status === "PASSED";
                const isTimedOut = item.status === "TIMED_OUT";

                // Engine icon & style
                let EngineIcon = FileCode2;
                let badgeClass = "bg-brand-500/15 text-brand-300 border-brand-500/25";
                let typeLabel = "Browser";

                if (item.testType === "API") {
                  EngineIcon = Globe2;
                  badgeClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
                  typeLabel = "API";
                } else if (item.testType === "ACCESSIBILITY") {
                  EngineIcon = Eye;
                  badgeClass = "bg-amber-500/15 text-amber-300 border-amber-500/25";
                  typeLabel = "A11y";
                } else if (item.testType === "PERFORMANCE") {
                  EngineIcon = Zap;
                  badgeClass = "bg-purple-500/15 text-purple-300 border-purple-500/25";
                  typeLabel = "Perf";
                } else if (item.testType === "SEO") {
                  EngineIcon = Search;
                  badgeClass = "bg-teal-500/15 text-teal-300 border-teal-500/25";
                  typeLabel = "SEO";
                }

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Test Info */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-start gap-2.5">
                        <EngineIcon className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                        <div>
                          {item.testId ? (
                            <Link
                              href={`/dashboard/tests/${item.testId}`}
                              className="font-bold text-white hover:text-brand-400 transition-colors line-clamp-1"
                            >
                              {item.testTitle}
                            </Link>
                          ) : (
                            <span className="font-bold text-white line-clamp-1">
                              {item.testTitle}
                            </span>
                          )}

                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
                            <span>Run #{item.runId.slice(0, 8)}</span>
                            {item.gitBranch && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-zinc-400">
                                  <GitBranch className="w-2.5 h-2.5" />
                                  {item.gitBranch}
                                </span>
                              </>
                            )}
                            {item.gitCommitHash && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-500">
                                  {item.gitCommitHash.slice(0, 7)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          isPassed
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                            : isTimedOut
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/25"
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {item.status}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}`}
                      >
                        {typeLabel}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-3 font-mono text-zinc-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{item.durationMs}ms</span>
                      </div>
                    </td>

                    {/* Started / Time Ago */}
                    <td className="py-3.5 px-3 font-mono text-zinc-400 text-[11px]">
                      <span title={new Date(item.createdAt).toLocaleString()}>
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </td>

                    {/* Diagnostics / Visual Regression */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {item.visualRegression ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              item.visualRegression.status === "PASSED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            Visual: {item.visualRegression.differencePercentage}% diff
                          </span>
                          <Link
                            href={`/dashboard/projects/${projectId}/runs/${item.runId}/results/${item.id}/visual-comparison`}
                            className="text-brand-400 hover:underline text-[10px] font-mono"
                          >
                            Inspect &rarr;
                          </Link>
                        </div>
                      ) : item.errorMessage ? (
                        <div
                          title={item.errorMessage}
                          className="text-rose-300 text-[11px] font-mono line-clamp-1 truncate bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                        >
                          {item.errorMessage}
                        </div>
                      ) : (
                        <span className="text-zinc-600 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Artifacts */}
                    <td className="py-3.5 px-3 font-mono">
                      {item.hasArtifacts ? (
                        <Link
                          href={`/dashboard/projects/${projectId}/runs/${item.runId}/results/${item.id}/artifacts`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors text-[11px]"
                        >
                          <Camera className="w-3 h-3 text-cyan-400" />
                          <span>{item.artifactCount}</span>
                        </Link>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 font-mono">
                        <Link
                          href={`/dashboard/projects/${projectId}/runs/${item.runId}/report`}
                          className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination Bar */}
        <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
          <div>
            Showing{" "}
            <strong className="text-white">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-white">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </strong>{" "}
            of <strong className="text-white">{pagination.total}</strong> executions
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none border border-white/[0.06] text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>

            <span className="px-2 text-zinc-500">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none border border-white/[0.06] text-white flex items-center gap-1 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
