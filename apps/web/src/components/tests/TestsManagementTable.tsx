"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Play, ExternalLink, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EngineBadge } from "@/components/ui/EngineBadge";

export interface SerializedTestItem {
  id: string;
  title: string;
  type: string;
  suiteId: string;
  suiteName: string;
  projectId: string;
  projectName: string;
  isVisual?: boolean;
  lastResult: {
    status: string;
    durationMs: number;
    createdAt: string;
  } | null;
  updatedAt: string;
}

interface TestsManagementTableProps {
  tests: SerializedTestItem[];
  projects: Array<{ id: string; name: string }>;
}

export function TestsManagementTable({ tests, projects }: TestsManagementTableProps) {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSuite = t.suiteName.toLowerCase().includes(q);
        const matchesProject = t.projectName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSuite && !matchesProject) return false;
      }

      // Project filter
      if (selectedProject !== "ALL" && t.projectId !== selectedProject) {
        return false;
      }

      // Type filter
      if (selectedType !== "ALL") {
        if (selectedType === "VISUAL" && !t.isVisual) return false;
        if (selectedType !== "VISUAL" && t.type.toUpperCase() !== selectedType.toUpperCase()) return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "UNTESTED") {
          if (t.lastResult !== null) return false;
        } else if (t.lastResult?.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [tests, search, selectedProject, selectedType, selectedStatus]);

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
            placeholder="Search tests by title or suite..."
            className="w-full bg-[#0A0C10] border border-white/[0.08] focus:border-white/[0.2] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#0A0C10] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Engine Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0A0C10] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="UI">Browser (UI)</option>
            <option value="API">REST API</option>
            <option value="ACCESSIBILITY">Accessibility</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="SEO">Technical SEO</option>
            <option value="VISUAL">Visual Regression</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0A0C10] border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="UNTESTED">Untested</option>
          </select>
        </div>
      </div>

      {/* Results Telemetry Table */}
      <div className="data-table-container">
        {filteredTests.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">
            No automated tests match the current filter criteria.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Test / Spec</th>
                <th>Type</th>
                <th>Project</th>
                <th>Suite</th>
                <th>Last Run</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((t) => {
                const durationStr = t.lastResult?.durationMs
                  ? `${(t.lastResult.durationMs / 1000).toFixed(2)}s`
                  : "";
                const lastRunAgo = t.lastResult ? formatTimeAgo(t.lastResult.createdAt) : "-";
                const updatedAgo = formatTimeAgo(t.updatedAt);

                return (
                  <tr key={t.id}>
                    <td>
                      <Link
                        href={`/dashboard/tests/${t.id}`}
                        className="font-medium text-zinc-200 hover:text-emerald-400 transition-colors block text-xs truncate max-w-[280px]"
                        title={t.title}
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td>
                      <EngineBadge type={t.type} size="xs" />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${t.projectId}`}
                        className="text-zinc-400 hover:text-zinc-200 truncate max-w-[130px] block"
                      >
                        {t.projectName}
                      </Link>
                    </td>
                    <td className="text-zinc-400 truncate max-w-[120px]">{t.suiteName}</td>
                    <td>
                      {t.lastResult ? (
                        <div className="font-mono text-[11px] text-zinc-300">
                          <span>{lastRunAgo}</span>
                          {durationStr && <span className="text-zinc-400 ml-1.5 font-normal">({durationStr})</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400">Never</span>
                      )}
                    </td>
                    <td>
                      {t.lastResult ? (
                        <StatusBadge status={t.lastResult.status} size="sm" />
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400">Untested</span>
                      )}
                    </td>
                    <td className="text-zinc-400 font-mono text-[11px]">{updatedAgo}</td>
                    <td className="text-right">
                      <Link
                        href={`/dashboard/tests/${t.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>Open</span>
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
        <span>Showing {filteredTests.length} of {tests.length} tests</span>
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
