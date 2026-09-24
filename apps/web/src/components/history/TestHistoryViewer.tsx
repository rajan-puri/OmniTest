"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  History,
  GitCompare,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertTriangle,
  FolderGit2,
} from "lucide-react";
import {
  TestHistoryFilter,
  TestHistoryResponse,
  TestHistorySummary,
} from "@/lib/history/history-types";
import { HistorySummaryCards } from "./HistorySummaryCards";
import { HistoryTrends } from "./HistoryTrends";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryTable } from "./HistoryTable";
import { RunComparisonView } from "./RunComparisonView";

interface TestHistoryViewerProps {
  projectId: string;
  projectName: string;
  projectSlug: string;
  availableTests?: Array<{ id: string; title: string }>;
  initialFilter?: TestHistoryFilter;
}

export function TestHistoryViewer({
  projectId,
  projectName,
  projectSlug,
  availableTests = [],
  initialFilter = {},
}: TestHistoryViewerProps) {
  const [filter, setFilter] = useState<TestHistoryFilter>({
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilter,
  });

  const [data, setData] = useState<TestHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompareMode, setShowCompareMode] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (filter.page) query.set("page", filter.page.toString());
    if (filter.pageSize) query.set("pageSize", filter.pageSize.toString());
    if (filter.status && filter.status !== "ALL") query.set("status", filter.status);
    if (filter.testType && filter.testType !== "ALL") query.set("testType", filter.testType);
    if (filter.testId) query.set("testId", filter.testId);
    if (filter.search) query.set("search", filter.search);
    if (filter.dateRange && filter.dateRange !== "all") query.set("dateRange", filter.dateRange);
    if (filter.startDate) query.set("startDate", filter.startDate);
    if (filter.endDate) query.set("endDate", filter.endDate);
    if (filter.sortBy) query.set("sortBy", filter.sortBy);
    if (filter.sortOrder) query.set("sortOrder", filter.sortOrder);

    try {
      const res = await fetch(`/api/projects/${projectId}/history?${query.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Unable to load test history.");
      }
      const json: TestHistoryResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Unable to load test history.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (updates: Partial<TestHistoryFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleResetFilters = () => {
    setFilter({
      page: 1,
      pageSize: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation & Header */}
      <div>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {projectName}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>{projectName}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">history</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <History className="w-7 h-7 text-brand-400" />
              Test History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Track test execution, failures, duration and results across previous runs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowCompareMode(!showCompareMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-colors border ${
                showCompareMode
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 border-white/[0.08]"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
              {showCompareMode ? "Hide Run Comparison" : "Compare Runs"}
            </button>

            <button
              type="button"
              onClick={() => fetchHistory()}
              disabled={isLoading}
              title="Refresh test history"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Drawer / Panel */}
      {showCompareMode && (
        <RunComparisonView
          projectId={projectId}
          onClose={() => setShowCompareMode(false)}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchHistory()}
            className="ml-auto underline hover:text-white font-mono text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state on initial load */}
      {isLoading && !data && (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-brand-400 mx-auto" />
          <p className="text-xs font-mono text-zinc-400">Loading test execution history...</p>
        </div>
      )}

      {/* Main Content */}
      {data && (
        <>
          {/* Summary Cards */}
          <HistorySummaryCards summary={data.summary} />

          {/* Lightweight Trend Visualizations */}
          <HistoryTrends trends={data.trends} avgDurationMs={data.summary.avgDurationMs} />

          {/* Filter Bar */}
          <HistoryFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            availableTests={availableTests}
          />

          {/* History Table */}
          <HistoryTable
            projectId={projectId}
            items={data.items}
            pagination={data.pagination}
            onPageChange={(page) => handleFilterChange({ page })}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
