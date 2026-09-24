"use client";

import React from "react";
import { Search, Filter, Calendar, ArrowUpDown, X } from "lucide-react";
import { TestHistoryFilter } from "@/lib/history/history-types";

interface HistoryFiltersProps {
  filter: TestHistoryFilter;
  onFilterChange: (updates: Partial<TestHistoryFilter>) => void;
  onReset: () => void;
  availableTests?: Array<{ id: string; title: string }>;
}

export function HistoryFilters({
  filter,
  onFilterChange,
  onReset,
  availableTests = [],
}: HistoryFiltersProps) {
  const hasActiveFilters = Boolean(
    filter.search ||
      (filter.status && filter.status !== "ALL") ||
      (filter.testType && filter.testType !== "ALL") ||
      (filter.dateRange && filter.dateRange !== "all") ||
      filter.testId
  );

  return (
    <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
      {/* Top row: Search and Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by test name, commit hash, or target..."
            value={filter.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/50 font-mono transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={filter.status || "ALL"}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-brand-500/50 font-mono transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="TIMED_OUT">Timed Out</option>
          </select>
        </div>

        {/* Engine / Test Type Filter */}
        <div className="lg:col-span-2">
          <select
            value={filter.testType || "ALL"}
            onChange={(e) => onFilterChange({ testType: e.target.value, page: 1 })}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-brand-500/50 font-mono transition-colors"
          >
            <option value="ALL">All Test Types</option>
            <option value="UI">UI (Browser)</option>
            <option value="API">API</option>
            <option value="ACCESSIBILITY">Accessibility</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="SEO">SEO</option>
          </select>
        </div>

        {/* Date Range Preset */}
        <div className="lg:col-span-2">
          <select
            value={filter.dateRange || "all"}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as any, page: 1 })}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-brand-500/50 font-mono transition-colors"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="lg:col-span-2">
          <select
            value={`${filter.sortBy || "createdAt"}:${filter.sortOrder || "desc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(":");
              onFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 });
            }}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-brand-500/50 font-mono transition-colors"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="durationMs:desc">Duration: Slowest</option>
            <option value="durationMs:asc">Duration: Fastest</option>
            <option value="status:desc">Status (Failed first)</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Optional test-specific dropdown & active filter tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {availableTests.length > 0 && (
            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
              <span>Filter by Test:</span>
              <select
                value={filter.testId || ""}
                onChange={(e) => onFilterChange({ testId: e.target.value || undefined, page: 1 })}
                className="px-2 py-1 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none font-mono"
              >
                <option value="">All Tests ({availableTests.length})</option>
                {availableTests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick status pill buttons */}
          <div className="flex items-center gap-1">
            {["ALL", "PASSED", "FAILED"].map((st) => {
              const isSelected = (filter.status || "ALL") === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onFilterChange({ status: st, page: 1 })}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${
                    isSelected
                      ? st === "PASSED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : st === "FAILED"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                        : "bg-white/[0.1] text-white border border-white/[0.15] font-bold"
                      : "text-zinc-400 hover:text-white bg-white/[0.03] border border-transparent"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08]"
          >
            <X className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
