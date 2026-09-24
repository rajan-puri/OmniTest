"use client";

import React from "react";
import Link from "next/link";
import {
  Camera,
  FileCode2,
  Terminal,
  Globe,
  Zap,
  Eye,
  Search,
  FileText,
  Video,
  Layers,
  ArrowRight,
  Download,
} from "lucide-react";
import { ArtifactItem, ArtifactType } from "@/lib/artifacts/artifact-types";

interface ArtifactListProps {
  artifacts: ArtifactItem[];
  projectId: string;
  testRunId: string;
  testResultId: string;
  onSelectArtifact?: (artifact: ArtifactItem) => void;
  selectedArtifactId?: string;
  compact?: boolean;
}

export function getArtifactIcon(type: ArtifactType) {
  switch (type) {
    case "SCREENSHOT":
      return <Camera className="w-4 h-4 text-cyan-400" />;
    case "VISUAL_BASELINE":
      return <Camera className="w-4 h-4 text-blue-400" />;
    case "VISUAL_CURRENT":
      return <Camera className="w-4 h-4 text-indigo-400" />;
    case "VISUAL_DIFF":
      return <Eye className="w-4 h-4 text-rose-400" />;
    case "VIDEO":
      return <Video className="w-4 h-4 text-purple-400" />;
    case "PLAYWRIGHT_TRACE":
      return <Layers className="w-4 h-4 text-brand-400" />;
    case "CONSOLE_LOG":
    case "TEXT":
      return <Terminal className="w-4 h-4 text-amber-400" />;
    case "NETWORK_LOG":
      return <Globe className="w-4 h-4 text-emerald-400" />;
    case "HTTP_RESPONSE":
    case "API_REQUEST":
    case "API_RESPONSE":
      return <FileCode2 className="w-4 h-4 text-emerald-400" />;
    case "PERFORMANCE_EVIDENCE":
      return <Zap className="w-4 h-4 text-purple-400" />;
    case "A11Y_EVIDENCE":
      return <Eye className="w-4 h-4 text-amber-400" />;
    case "SEO_EVIDENCE":
      return <Search className="w-4 h-4 text-teal-400" />;
    case "JSON":
      return <FileCode2 className="w-4 h-4 text-blue-400" />;
    case "HTML":
      return <FileText className="w-4 h-4 text-rose-400" />;
    default:
      return <FileText className="w-4 h-4 text-zinc-400" />;
  }
}

export function ArtifactList({
  artifacts,
  projectId,
  testRunId,
  testResultId,
  onSelectArtifact,
  selectedArtifactId,
  compact = false,
}: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-xl border border-white/[0.08] text-xs text-zinc-500 font-mono">
        No artifacts or diagnostic evidence recorded for this test result.
      </div>
    );
  }

  const viewerBaseUrl = `/dashboard/projects/${projectId}/runs/${testRunId}/results/${testResultId}/artifacts`;

  return (
    <div className="space-y-2">
      {artifacts.map((art) => {
        const isSelected = selectedArtifactId === art.id;

        const content = (
          <div
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
              isSelected
                ? "bg-white/[0.08] border-brand-500/60 shadow-md ring-1 ring-brand-500/40"
                : "glass-panel border-white/[0.08] hover:border-white/[0.18]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] shrink-0">
                {getArtifactIcon(art.type)}
              </div>
              <div className="truncate">
                <div className="font-medium text-white truncate flex items-center gap-2">
                  <span className="truncate">{art.fileName}</span>
                  {art.isVirtual && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-white/[0.06] text-zinc-400 rounded">
                      Evidence
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2 mt-0.5">
                  <span>{art.type.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>{art.formattedSize}</span>
                  {!compact && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(art.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
              <a
                href={art.downloadUrl}
                download={art.fileName}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Download artifact"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              {!onSelectArtifact ? (
                <Link
                  href={`${viewerBaseUrl}?artifactId=${art.id}`}
                  className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/25 flex items-center gap-1 font-semibold transition-colors"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <button
                  onClick={() => onSelectArtifact(art)}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    isSelected
                      ? "bg-brand-500 text-zinc-950"
                      : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300"
                  }`}
                >
                  <span>{isSelected ? "Active" : "Inspect"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );

        if (onSelectArtifact) {
          return (
            <div
              key={art.id}
              onClick={() => onSelectArtifact(art)}
              className="cursor-pointer"
            >
              {content}
            </div>
          );
        }

        return <div key={art.id}>{content}</div>;
      })}
    </div>
  );
}
