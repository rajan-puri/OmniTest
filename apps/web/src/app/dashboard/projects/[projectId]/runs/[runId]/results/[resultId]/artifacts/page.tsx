"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, RotateCcw, FolderGit2 } from "lucide-react";
import { TestResultArtifactsResponse } from "@/lib/artifacts/artifact-types";
import { ArtifactViewerLayout } from "@/components/artifacts/ArtifactViewerLayout";

export default function ArtifactViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const projectId = params.projectId as string;
  const runId = params.runId as string;
  const resultId = params.resultId as string;
  const initialArtifactId = searchParams.get("artifactId") || undefined;

  const [data, setData] = useState<TestResultArtifactsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtifacts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/runs/${runId}/results/${resultId}/artifacts`
      );
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Test result or artifacts not found.");
        }
        if (res.status === 401) {
          throw new Error("You are not authorized to view artifacts for this project.");
        }
        throw new Error("Failed to load artifacts.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [projectId, runId, resultId]);

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">Loading Test Artifacts</p>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Retrieving execution evidence, logs, and screenshots...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="p-6 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5 space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Artifacts Unavailable</h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              {error || "Unable to locate artifact records for this test result."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fetchArtifacts()}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
            <Link
              href={`/dashboard/projects/${projectId}/runs/${runId}/report`}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" /> Back to Run Report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ArtifactViewerLayout
      data={data}
      initialArtifactId={initialArtifactId}
    />
  );
}
