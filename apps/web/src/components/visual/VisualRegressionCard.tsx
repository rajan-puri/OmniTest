/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { Eye, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";
import { VisualComparisonResult, VisualComparisonStatus } from "@/lib/visual/visual-types";

interface VisualRegressionCardProps {
  projectId: string;
  runId?: string;
  resultId: string;
  visualComparison?: VisualComparisonResult | null;
  currentUrl?: string | null;
  diffUrl?: string | null;
  baselineUrl?: string | null;
}

export function VisualRegressionCard({
  projectId,
  runId,
  resultId,
  visualComparison,
  currentUrl,
  diffUrl,
  baselineUrl,
}: VisualRegressionCardProps) {
  if (!visualComparison && !currentUrl) {
    return null;
  }

  const status: VisualComparisonStatus = visualComparison?.status || (baselineUrl ? "PASSED" : "NO_BASELINE");
  const metrics = visualComparison?.metrics;
  const effectiveCurrentUrl = currentUrl || visualComparison?.currentUrl;
  const effectiveDiffUrl = diffUrl || visualComparison?.diffUrl;

  const comparisonUrl = runId
    ? `/dashboard/projects/${projectId}/runs/${runId}/results/${resultId}/visual-comparison`
    : null;

  const getBadge = () => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Pass ({metrics?.differencePercentage ?? 0}%)
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Diff Detected ({metrics?.differencePercentage ?? 0}%)
          </span>
        );
      case "DIMENSION_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Dimension Mismatch
          </span>
        );
      case "NO_BASELINE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            No Baseline
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="surface-card border border-white/[0.08] rounded-lg p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-zinc-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Visual Regression
          </h4>
        </div>
        {getBadge()}
      </div>

      {metrics && (
        <div className="grid grid-cols-3 gap-2 text-xs py-1 bg-black/40 rounded-md p-2.5 border border-white/[0.06] font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Diff %</span>
            <span className={status === "FAILED" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {metrics.differencePercentage}%
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Threshold</span>
            <span className="text-zinc-300">{metrics.thresholdPercentage}%</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Changed</span>
            <span className="text-zinc-300">{metrics.changedPixels.toLocaleString()} px</span>
          </div>
        </div>
      )}

      {/* Thumbnails row */}
      <div className="flex items-center gap-2 overflow-hidden pt-1">
        {effectiveCurrentUrl && (
          <div className="w-24 h-16 rounded border border-white/[0.08] overflow-hidden bg-black/40 flex-shrink-0 relative group">
            <img src={effectiveCurrentUrl} alt="Current" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-zinc-300 text-center py-0.5 font-mono">
              Current
            </span>
          </div>
        )}

        {effectiveDiffUrl && (
          <div className="w-24 h-16 rounded border border-white/[0.08] overflow-hidden bg-black/40 flex-shrink-0 relative group">
            <img src={effectiveDiffUrl} alt="Diff" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-rose-400 text-center py-0.5 font-mono">
              Diff
            </span>
          </div>
        )}

        {comparisonUrl && (
          <div className="flex-1 flex justify-end">
            <Link
              href={comparisonUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] rounded-md text-xs font-mono font-medium transition-colors"
            >
              Inspect Comparison
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
