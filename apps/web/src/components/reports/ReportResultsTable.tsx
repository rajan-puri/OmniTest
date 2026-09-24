"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ReportItem, TestEngineType } from "@/lib/reports/report-types";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MinusCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Globe2,
  Eye,
  Zap,
  Layers,
  ArrowUpDown,
  FilterX,
  FileImage,
} from "lucide-react";
import { VisualRegressionCard } from "../visual/VisualRegressionCard";

interface ReportResultsTableProps {
  items: ReportItem[];
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  projectId: string;
  runId?: string;
}

type SortField = "status_priority" | "duration_desc" | "duration_asc" | "title_asc" | "title_desc";

export function ReportResultsTable({
  items,
  selectedType,
  onSelectType,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchQueryChange,
  projectId,
  runId,
}: ReportResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("status_priority");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Compute status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      PASSED: 0,
      FAILED: 0,
      TIMED_OUT: 0,
      SKIPPED: 0,
    };
    items.forEach((item) => {
      counts.all++;
      if (item.status === "PASSED") counts.PASSED++;
      else if (item.status === "FAILED") counts.FAILED++;
      else if (item.status === "TIMED_OUT") counts.TIMED_OUT++;
      else if (item.status === "SKIPPED") counts.SKIPPED++;
    });
    return counts;
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      // Type filter
      if (selectedType !== "all" && item.type !== selectedType.toUpperCase()) {
        return false;
      }
      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesError = item.errorMessage?.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        return matchesTitle || Boolean(matchesError) || matchesType;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortField === "status_priority") {
        const priority = (status: string) => {
          if (status === "FAILED") return 1;
          if (status === "TIMED_OUT") return 2;
          if (status === "RUNNING") return 3;
          if (status === "PASSED") return 4;
          return 5;
        };
        const pDiff = priority(a.status) - priority(b.status);
        if (pDiff !== 0) return pDiff;
        return a.title.localeCompare(b.title);
      }
      if (sortField === "duration_desc") return b.durationMs - a.durationMs;
      if (sortField === "duration_asc") return a.durationMs - b.durationMs;
      if (sortField === "title_asc") return a.title.localeCompare(b.title);
      if (sortField === "title_desc") return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [items, selectedType, selectedStatus, searchQuery, sortField]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            PASSED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-400" />
            FAILED
          </span>
        );
      case "TIMED_OUT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" />
            TIMED OUT
          </span>
        );
      case "SKIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <MinusCircle className="w-3 h-3 text-zinc-500" />
            SKIPPED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <AlertTriangle className="w-3 h-3 text-blue-400" />
            {status}
          </span>
        );
    }
  };

  const getTypeBadge = (type: TestEngineType) => {
    switch (type) {
      case "UI":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <FileCode2 className="w-2.5 h-2.5" /> UI
          </span>
        );
      case "API":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe2 className="w-2.5 h-2.5" /> API
          </span>
        );
      case "ACCESSIBILITY":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Eye className="w-2.5 h-2.5" /> A11Y
          </span>
        );
      case "PERFORMANCE":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-2.5 h-2.5" /> PERF
          </span>
        );
      case "SEO":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Search className="w-2.5 h-2.5" /> SEO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            {type}
          </span>
        );
    }
  };

  const clearAllFilters = () => {
    onSelectType("all");
    onSelectStatus("all");
    onSearchQueryChange("");
  };

  const isFiltered = selectedType !== "all" || selectedStatus !== "all" || Boolean(searchQuery);

  return (
    <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
      {/* Control bar */}
      <div className="p-4 border-b border-white/[0.08] space-y-3">
        {/* Top bar: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tests by title or error..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/[0.1] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="status_priority">Failures First</option>
              <option value="duration_desc">Duration: Slowest</option>
              <option value="duration_asc">Duration: Fastest</option>
              <option value="title_asc">Name: A &rarr; Z</option>
              <option value="title_desc">Name: Z &rarr; A</option>
            </select>
          </div>
        </div>

        {/* Filter row: Status tabs & active filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/[0.05]">
            <button
              onClick={() => onSelectStatus("all")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                selectedStatus === "all"
                  ? "bg-white/10 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => onSelectStatus("FAILED")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedStatus === "FAILED"
                  ? "bg-rose-500/20 text-rose-400 font-bold"
                  : "text-zinc-400 hover:text-rose-400"
              }`}
            >
              Failed ({statusCounts.FAILED})
            </button>
            <button
              onClick={() => onSelectStatus("PASSED")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedStatus === "PASSED"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-emerald-400"
              }`}
            >
              Passed ({statusCounts.PASSED})
            </button>
            {statusCounts.TIMED_OUT > 0 && (
              <button
                onClick={() => onSelectStatus("TIMED_OUT")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                  selectedStatus === "TIMED_OUT"
                    ? "bg-amber-500/20 text-amber-400 font-bold"
                    : "text-zinc-400 hover:text-amber-400"
                }`}
              >
                Errors ({statusCounts.TIMED_OUT})
              </button>
            )}
            {statusCounts.SKIPPED > 0 && (
              <button
                onClick={() => onSelectStatus("SKIPPED")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedStatus === "SKIPPED"
                    ? "bg-zinc-700 text-zinc-200 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Skipped ({statusCounts.SKIPPED})
              </button>
            )}
          </div>

          {/* Active filter badges / reset */}
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <FilterX className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-zinc-400 text-sm">No test results match the current filters.</p>
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded text-xs font-mono transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 w-32">Status</th>
                <th className="py-2.5 px-4">Test Title</th>
                <th className="py-2.5 px-4 w-28">Engine</th>
                <th className="py-2.5 px-4 w-28">Duration</th>
                <th className="py-2.5 px-4 w-36">Assertions</th>
                <th className="py-2.5 px-4 w-28 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredAndSortedItems.map((item) => {
                const isExpanded = expandedRowId === item.id;
                const hasError = Boolean(item.errorMessage);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        item.status === "FAILED" ? "bg-rose-500/[0.02]" : ""
                      }`}
                      onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                    >
                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.artifactsCount > 0 && (
                            runId ? (
                              <Link
                                href={`/dashboard/projects/${projectId}/runs/${runId}/results/${item.id}/artifacts`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 transition-colors"
                                title={`${item.artifactsCount} artifact(s) captured — Click to inspect in Artifact Viewer`}
                              >
                                <FileImage className="w-2.5 h-2.5" />
                                {item.artifactsCount}
                              </Link>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                                title={`${item.artifactsCount} artifact(s) captured`}
                              >
                                <FileImage className="w-2.5 h-2.5" />
                                {item.artifactsCount}
                              </span>
                            )
                          )}
                        </div>
                        {hasError && !isExpanded && (
                          <p className="text-[11px] text-rose-400/90 font-mono truncate max-w-md mt-0.5">
                            {item.errorMessage}
                          </p>
                        )}
                      </td>

                      {/* Engine */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getTypeBadge(item.type)}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-zinc-300 whitespace-nowrap">
                        {item.formattedDuration}
                      </td>

                      {/* Assertions / summary */}
                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {item.assertionsSummary ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {item.assertionsSummary.failed > 0 ? (
                              <span className="text-rose-400 font-bold">
                                {item.assertionsSummary.failed} failed
                              </span>
                            ) : null}
                            <span className="text-zinc-500">
                              {item.assertionsSummary.passed}/{item.assertionsSummary.total} passed
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {item.testId && (
                            <Link
                              href={`/dashboard/tests/${item.testId}`}
                              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                              title="Open Test Definition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row: Error message / metrics */}
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="p-4 border-t border-b border-white/[0.06]">
                          <div className="space-y-3 text-xs">
                            {item.errorMessage && (
                              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 font-mono text-rose-300">
                                <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">
                                  Failure Message
                                </div>
                                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed overflow-x-auto">
                                  {item.errorMessage}
                                </pre>
                              </div>
                            )}

                            {/* Metrics snippet if available */}
                            {item.metrics && Object.keys(item.metrics).length > 0 && (
                              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] font-mono">
                                <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center justify-between">
                                  <span>Captured Metrics & Execution Data</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                  {item.metrics.httpStatus && (
                                    <div>
                                      <span className="text-zinc-500">Status: </span>
                                      <span className="text-white font-bold">{item.metrics.httpStatus}</span>
                                    </div>
                                  )}
                                  {item.metrics.lcpMs !== undefined && (
                                    <div>
                                      <span className="text-zinc-500">LCP: </span>
                                      <span className="text-white">{Math.round(item.metrics.lcpMs)} ms</span>
                                    </div>
                                  )}
                                  {item.metrics.cls !== undefined && (
                                    <div>
                                      <span className="text-zinc-500">CLS: </span>
                                      <span className="text-white">{Number(item.metrics.cls).toFixed(3)}</span>
                                    </div>
                                  )}
                                  {item.metrics.violationsCount !== undefined && (
                                    <div>
                                      <span className="text-zinc-500">A11y Violations: </span>
                                      <span className="text-white">{item.metrics.violationsCount}</span>
                                    </div>
                                  )}
                                  {item.metrics.title !== undefined && (
                                    <div className="col-span-2">
                                      <span className="text-zinc-500">SEO Title: </span>
                                      <span className="text-zinc-300">&quot;{item.metrics.title}&quot;</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Visual Regression Card if present */}
                            {item.metrics?.visualComparison && (
                              <div className="pt-2">
                                <VisualRegressionCard
                                  projectId={projectId}
                                  runId={runId}
                                  resultId={item.id}
                                  visualComparison={item.metrics.visualComparison}
                                  currentUrl={item.metrics.visualComparison.currentUrl}
                                  diffUrl={item.metrics.visualComparison.diffUrl}
                                  baselineUrl={item.metrics.visualComparison.baselineUrl}
                                />
                              </div>
                            )}

                            {/* Test Inspection & Artifact Viewer Links */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              {runId && item.artifactsCount > 0 ? (
                                <Link
                                  href={`/dashboard/projects/${projectId}/runs/${runId}/results/${item.id}/artifacts`}
                                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                                >
                                  <FileImage className="w-3.5 h-3.5" />
                                  <span>Open in Artifact Viewer ({item.artifactsCount} artifact{item.artifactsCount === 1 ? "" : "s"}) &rarr;</span>
                                </Link>
                              ) : <div />}

                              {item.testId && (
                                <Link
                                  href={`/dashboard/tests/${item.testId}`}
                                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-mono ml-auto"
                                >
                                  <span>Inspect Test Details &amp; Configuration</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>
          Showing {filteredAndSortedItems.length} of {items.length} test results
        </span>
        {isFiltered && (
          <span className="text-brand-400 font-medium">Filters active</span>
        )}
      </div>
    </div>
  );
}
