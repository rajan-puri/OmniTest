"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, GitCommit, GitBranch, ArrowRight, PlayCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EngineBadge } from "@/components/ui/EngineBadge";

export interface SerializedRunItem {
  id: string;
  projectId: string;
  projectName: string;
  suiteName: string;
  testTitle: string;
  testType: string | null;
  status: string;
  trigger: string;
  environment: string;
  gitCommitHash: string | null;
  gitBranch: string | null;
  durationMs: number | null;
  createdAt: string;
}

interface RunsManagementTableProps {
  runs: SerializedRunItem[];
}

export function RunsManagementTable({ runs }: RunsManagementTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesTest = r.testTitle.toLowerCase().includes(q);
        const matchesProj = r.projectName.toLowerCase().includes(q);
        const matchesCommit = r.gitCommitHash ? r.gitCommitHash.toLowerCase().includes(q) : false;
        if (!matchesId && !matchesTest && !matchesProj && !matchesCommit) return false;
      }

      // Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "PASSED" && r.status !== "PASSED") return false;
        if (statusFilter === "FAILED" && r.status !== "FAILED") return false;
        if (statusFilter === "RUNNING" && r.status !== "RUNNING" && r.status !== "QUEUED") return false;
      }

      return true;
    });
  }, [runs, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: runs.length,
      passed: runs.filter((r) => r.status === "PASSED").length,
      failed: runs.filter((r) => r.status === "FAILED").length,
      running: runs.filter((r) => r.status === "RUNNING" || r.status === "QUEUED").length,
    };
  }, [runs]);

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="surface-card p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by run ID, test, or commit..."
            className="w-full bg-[#0A0C10] border border-white/[0.08] focus:border-white/[0.2] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0A0C10] p-0.5 rounded border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              statusFilter === "ALL"
                ? "bg-white/[0.1] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PASSED")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              statusFilter === "PASSED"
                ? "bg-white/[0.1] text-emerald-400 font-semibold"
                : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            Passed ({counts.passed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("FAILED")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              statusFilter === "FAILED"
                ? "bg-white/[0.1] text-rose-400 font-semibold"
                : "text-zinc-400 hover:text-rose-400"
            }`}
          >
            Failed ({counts.failed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("RUNNING")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              statusFilter === "RUNNING"
                ? "bg-white/[0.1] text-amber-400 font-semibold"
                : "text-zinc-400 hover:text-amber-400"
            }`}
          >
            Running ({counts.running})
          </button>
        </div>
      </div>

      {/* CI/CD Runs Table */}
      <div className="data-table-container">
        {filteredRuns.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">
            No test runs match your filters.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Run ID</th>
                <th>Test / Suite</th>
                <th>Project</th>
                <th>Commit / Branch</th>
                <th>Env</th>
                <th>Duration</th>
                <th>Triggered</th>
                <th>Started</th>
                <th className="text-right">Report</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((r) => {
                const durationStr = r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "-";
                const startedAgo = formatTimeAgo(r.createdAt);

                return (
                  <tr key={r.id}>
                    <td>
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${r.projectId}/runs/${r.id}/report`}
                        className="font-mono text-[11px] text-zinc-400 hover:text-white transition-colors"
                      >
                        {r.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.testType && <EngineBadge type={r.testType} size="xs" />}
                        <span className="font-medium text-zinc-200 truncate max-w-[220px]" title={r.testTitle}>
                          {r.testTitle}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${r.projectId}`}
                        className="text-zinc-400 hover:text-zinc-200 truncate max-w-[120px] block"
                      >
                        {r.projectName}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                        {r.gitCommitHash ? (
                          <span className="inline-flex items-center gap-0.5" title={r.gitCommitHash}>
                            <GitCommit className="w-2.5 h-2.5 text-zinc-500" />
                            {r.gitCommitHash.slice(0, 7)}
                          </span>
                        ) : null}
                        {r.gitBranch ? (
                          <span className="inline-flex items-center gap-0.5 text-zinc-400" title={r.gitBranch}>
                            <GitBranch className="w-2.5 h-2.5 text-zinc-500" />
                            {r.gitBranch}
                          </span>
                        ) : !r.gitCommitHash ? (
                          <span className="text-zinc-500">local</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                        {r.environment}
                      </span>
                    </td>
                    <td className="font-mono text-[11px] text-zinc-400">{durationStr}</td>
                    <td className="font-mono text-[10px] text-zinc-400">{r.trigger}</td>
                    <td className="font-mono text-[11px] text-zinc-400">{startedAgo}</td>
                    <td className="text-right">
                      <Link
                        href={`/dashboard/projects/${r.projectId}/runs/${r.id}/report`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-1 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
        <span>Showing {filteredRuns.length} of {runs.length} runs</span>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
