"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft, RotateCcw, Eye, ExternalLink } from "lucide-react";
import { VisualComparisonViewer } from "@/components/visual/VisualComparisonViewer";

export default function VisualComparisonPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const runId = params.runId as string;
  const resultId = params.resultId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/runs/${runId}/results/${resultId}/visual-comparison`
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to load visual comparison.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [projectId, runId, resultId]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">Loading Visual Comparison</p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Analyzing baseline, current screenshot, and pixel diff...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-rose-300 mb-2">Visual Comparison Unavailable</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            {error || "Could not retrieve visual comparison data for this test execution."}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={fetchComparison}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <Link
              href={`/dashboard/projects/${projectId}/runs/${runId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Test Run
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/projects/${projectId}/runs/${runId}`}
            className="hover:text-slate-200 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Test Run #{runId.slice(0, 8)}
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Visual Regression</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${projectId}/runs/${runId}/results/${resultId}/artifacts`}
            className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
          >
            View All Artifacts
            <ExternalLink className="w-3 h-3" />
          </Link>
          {data.testId && (
            <Link
              href={`/dashboard/tests/${data.testId}`}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
            >
              Test Definition
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Master Comparison Viewer */}
      <VisualComparisonViewer
        projectId={projectId}
        testId={data.testId}
        runId={runId}
        resultId={resultId}
        testTitle={data.testTitle}
        visualComparison={data.visualComparison}
        baselineUrl={data.visualComparison?.baselineUrl || data.baseline?.url}
        currentUrl={data.visualComparison?.currentUrl}
        diffUrl={data.visualComparison?.diffUrl}
        currentArtifactId={data.visualComparison?.currentArtifactId}
        onBaselineUpdated={fetchComparison}
      />
    </div>
  );
}
