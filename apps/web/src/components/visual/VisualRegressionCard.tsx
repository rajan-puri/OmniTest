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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Visual Pass ({metrics?.differencePercentage ?? 0}%)
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Visual Diff Detected ({metrics?.differencePercentage ?? 0}%)
          </span>
        );
      case "DIMENSION_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Dimension Mismatch
          </span>
        );
      case "NO_BASELINE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            No Baseline Set
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200">Visual Regression</h4>
        </div>
        {getBadge()}
      </div>

      {metrics && (
        <div className="grid grid-cols-3 gap-2 text-[11px] py-1 bg-slate-950/40 rounded-lg p-2 border border-slate-800/60 font-mono">
          <div>
            <span className="text-slate-500 block">Diff:</span>
            <span className={status === "FAILED" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {metrics.differencePercentage}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Threshold:</span>
            <span className="text-slate-300">{metrics.thresholdPercentage}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Changed:</span>
            <span className="text-slate-300">{metrics.changedPixels.toLocaleString()} px</span>
          </div>
        </div>
      )}

      {/* Thumbnails row */}
      <div className="flex items-center gap-2 overflow-hidden pt-1">
        {effectiveCurrentUrl && (
          <div className="w-24 h-16 rounded border border-slate-800 overflow-hidden bg-slate-950 flex-shrink-0 relative group">
            <img src={effectiveCurrentUrl} alt="Current" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-slate-300 text-center py-0.5">
              Current
            </span>
          </div>
        )}

        {effectiveDiffUrl && (
          <div className="w-24 h-16 rounded border border-slate-800 overflow-hidden bg-slate-950 flex-shrink-0 relative group">
            <img src={effectiveDiffUrl} alt="Diff" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-rose-400 text-center py-0.5">
              Diff
            </span>
          </div>
        )}

        {comparisonUrl && (
          <div className="flex-1 flex justify-end">
            <Link
              href={comparisonUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-medium transition"
            >
              Inspect Comparison
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
