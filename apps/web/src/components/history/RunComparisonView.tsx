"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitCompare,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Loader2,
  FileText,
} from "lucide-react";
import { RunComparisonResult } from "@/lib/history/history-types";

interface RunComparisonViewProps {
  projectId: string;
  initialBaseRunId?: string;
  initialTargetRunId?: string;
  onClose?: () => void;
}

export function RunComparisonView({
  projectId,
  initialBaseRunId = "",
  initialTargetRunId = "",
  onClose,
}: RunComparisonViewProps) {
  const [baseRunId, setBaseRunId] = useState(initialBaseRunId);
  const [targetRunId, setTargetRunId] = useState(initialTargetRunId);
  const [comparison, setComparison] = useState<RunComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async (bId: string, tId: string) => {
    if (!bId || !tId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/runs/compare?baseRunId=${encodeURIComponent(
          bId
        )}&targetRunId=${encodeURIComponent(tId)}`
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to compare test runs.");
      }
      setComparison(data);
    } catch (err: any) {
      setError(err?.message || "An error occurred during run comparison.");
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (initialBaseRunId && initialTargetRunId) {
      fetchComparison(initialBaseRunId, initialTargetRunId);
    }
  }, [initialBaseRunId, initialTargetRunId, fetchComparison]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComparison(baseRunId.trim(), targetRunId.trim());
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Historical Run Comparison
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare two distinct test runs to detect regressions, performance changes, and visual diff variations.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors self-start sm:self-auto"
          >
            ✕ Close Comparison
          </button>
        )}
      </div>

      {/* Selector Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Baseline Run (Older / Golden)
          </label>
          <input
            type="text"
            placeholder="e.g. 58c704f0-466d-4702-861c-8b89d4ebdf38"
            value={baseRunId}
            onChange={(e) => setBaseRunId(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Target Run (Newer / Subject)
          </label>
          <input
            type="text"
            placeholder="e.g. 9b92225f-2c09-4171-8785-3cf56f7ef5eb"
            value={targetRunId}
            onChange={(e) => setTargetRunId(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!baseRunId.trim() || !targetRunId.trim() || isLoading}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                Compare
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 pt-2">
          {/* Summary Badges Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                Regressions
              </span>
              <div
                className={`text-xl font-bold font-mono ${
                  comparison.summary.regressionsCount > 0 ? "text-rose-400" : "text-zinc-300"
                }`}
              >
                {comparison.summary.regressionsCount}
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Passed &rarr; Failed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                Resolved Fixes
              </span>
              <div
                className={`text-xl font-bold font-mono ${
                  comparison.summary.fixesCount > 0 ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                {comparison.summary.fixesCount}
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Failed &rarr; Passed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                Duration Variance
              </span>
              <div
                className={`text-xl font-bold font-mono flex items-center gap-1 ${
                  comparison.durationDeltaPct > 5
                    ? "text-rose-400"
                    : comparison.durationDeltaPct < -5
                    ? "text-emerald-400"
                    : "text-zinc-300"
                }`}
              >
                {comparison.durationDeltaPct > 0 ? `+${comparison.durationDeltaPct}%` : `${comparison.durationDeltaPct}%`}
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {comparison.durationDeltaMs > 0 ? `+${comparison.durationDeltaMs}ms` : `${comparison.durationDeltaMs}ms`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                Tests Evaluated
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {comparison.summary.totalCompared}
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Common in both runs</span>
            </div>
          </div>

          {/* Regressions Section */}
          {comparison.regressions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Detected Regressions ({comparison.regressions.length})
              </h3>
              <div className="space-y-2">
                {comparison.regressions.map((reg, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{reg.title}</span>
                      {reg.errorSummary && (
                        <p className="text-[11px] font-mono text-rose-300 mt-0.5 line-clamp-1">
                          {reg.errorSummary}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        {reg.baseStatus} ({reg.baseDurationMs}ms)
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                        {reg.targetStatus} ({reg.targetDurationMs}ms)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixes Section */}
          {comparison.fixes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Resolved Fixes ({comparison.fixes.length})
              </h3>
              <div className="space-y-2">
                {comparison.fixes.map((fix, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                  >
                    <span className="font-bold text-white">{fix.title}</span>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                        {fix.baseStatus}
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        {fix.targetStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Regression Changes */}
          {comparison.visualDiffs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visual Regression Differential ({comparison.visualDiffs.length})
              </h3>
              <div className="space-y-2">
                {comparison.visualDiffs.map((vd, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-white font-sans font-semibold">{vd.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">
                        Base: <strong className="text-zinc-200">{vd.baseDiffPct ?? 0}%</strong>
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">
                        Target: <strong className="text-zinc-200">{vd.targetDiffPct ?? 0}%</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
