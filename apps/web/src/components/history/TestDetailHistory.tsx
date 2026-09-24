"use client";

import React from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Flame,
  Camera,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";
import { calculateFlakiness } from "@/lib/history/history-service";

interface TestDetailHistoryProps {
  projectId: string;
  testId: string;
  recentResults: Array<{
    id: string;
    testRunId: string;
    status: "PASSED" | "FAILED" | "TIMED_OUT";
    durationMs: number;
    errorMessage: string | null;
    metrics: any;
    artifacts: Array<{
      id: string;
      type: string;
      fileName: string;
      url: string;
    }>;
    createdAt: string;
  }>;
}

export function TestDetailHistory({
  projectId,
  testId,
  recentResults,
}: TestDetailHistoryProps) {
  if (!recentResults || recentResults.length === 0) {
    return null;
  }

  const statuses = recentResults.map((r) => r.status);
  const flakiness = calculateFlakiness(statuses);

  // Consecutive failures calculation (from latest backwards)
  let consecutiveFailures = 0;
  for (const r of recentResults) {
    if (r.status === "FAILED" || r.status === "TIMED_OUT") {
      consecutiveFailures++;
    } else {
      break;
    }
  }

  // Duration slowdown detection (compare latest run vs average of rest)
  const durations = recentResults.map((r) => r.durationMs);
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const latestDuration = durations[0];
  const isSlower = durations.length >= 3 && latestDuration > avgDuration * 1.25;

  const lastFailure = recentResults.find((r) => r.status === "FAILED" || r.status === "TIMED_OUT");

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Execution History &amp; Stability
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
            Last {recentResults.length} runs
          </span>
        </div>

        <div className="flex items-center gap-3">
          {consecutiveFailures > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              {consecutiveFailures} consecutive fail{consecutiveFailures > 1 ? "s" : ""}
            </span>
          )}

          {isSlower && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              Slower ({latestDuration}ms vs {avgDuration}ms avg)
            </span>
          )}

          <Link
            href={`/dashboard/projects/${projectId}/history?testId=${testId}`}
            className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline font-semibold"
          >
            <span>Full History</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stability Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Average Duration</span>
          <span className="text-white font-bold">{avgDuration}ms</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Flakiness Score</span>
          <span
            className={`font-bold ${
              flakiness > 40
                ? "text-rose-400"
                : flakiness > 15
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {flakiness}% {flakiness === 0 ? "(Rock Solid)" : flakiness > 40 ? "(Unstable)" : ""}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Last Run</span>
          <span className="text-zinc-300">
            {new Date(recentResults[0].createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
          <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Last Failure</span>
          <span className={lastFailure ? "text-rose-400" : "text-emerald-400"}>
            {lastFailure
              ? new Date(lastFailure.createdAt).toLocaleDateString()
              : "None recorded"}
          </span>
        </div>
      </div>

      {/* Execution Timeline Sequence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Recent Execution Runs:</span>
          <span>Click run to open report</span>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {recentResults.map((result) => {
            const isPass = result.status === "PASSED";
            const visualComp = result.metrics?.visualComparison;
            const diffArt = result.artifacts.find((a) => a.type === "VISUAL_DIFF");

            return (
              <div
                key={result.id}
                className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isPass
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                        : "bg-rose-500/15 text-rose-300 border-rose-500/25"
                    }`}
                  >
                    {isPass ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                    {result.status}
                  </span>

                  <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {result.durationMs}ms
                  </span>

                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 text-[11px]">
                    Run #{result.testRunId.slice(0, 8)}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 text-[11px]">
                    {new Date(result.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  {visualComp ? (
                    <Link
                      href={`/dashboard/projects/${projectId}/runs/${result.testRunId}/results/${result.id}/visual-comparison`}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Visual: {visualComp.differencePercentage ?? 0}%
                    </Link>
                  ) : diffArt ? (
                    <Link
                      href={`/dashboard/projects/${projectId}/runs/${result.testRunId}/results/${result.id}/visual-comparison`}
                      className="text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Visual Diff
                    </Link>
                  ) : null}

                  {result.artifacts.length > 0 && (
                    <Link
                      href={`/dashboard/projects/${projectId}/runs/${result.testRunId}/results/${result.id}/artifacts`}
                      className="text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3 text-zinc-500" />
                      {result.artifacts.length}
                    </Link>
                  )}

                  <Link
                    href={`/dashboard/projects/${projectId}/runs/${result.testRunId}/report`}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <FileText className="w-3 h-3" />
                    Report &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
