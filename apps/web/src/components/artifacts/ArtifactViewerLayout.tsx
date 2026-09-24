"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileCode2,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  ArtifactItem,
  TestResultArtifactsResponse,
} from "@/lib/artifacts/artifact-types";
import { getArtifactIcon } from "./ArtifactList";
import { ScreenshotViewer } from "./ScreenshotViewer";
import { JsonViewer } from "./JsonViewer";
import { LogViewer } from "./LogViewer";
import { HtmlViewer } from "./HtmlViewer";
import { TraceViewer } from "./TraceViewer";
import { VideoViewer } from "./VideoViewer";
import { EvidenceViewer } from "./EvidenceViewer";
import { getArtifactCategory } from "@/lib/artifacts/artifact-helper";

interface ArtifactViewerLayoutProps {
  data: TestResultArtifactsResponse;
  initialArtifactId?: string;
}

export function ArtifactViewerLayout({
  data,
  initialArtifactId,
}: ArtifactViewerLayoutProps) {
  const { project, testRun, testResult, artifacts } = data;

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    initialArtifactId || (artifacts[0]?.id ?? "")
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Available categories based on artifacts present
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("all");
    artifacts.forEach((a) => cats.add(getArtifactCategory(a.type)));
    return Array.from(cats);
  }, [artifacts]);

  // Filtered artifact list
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      if (selectedCategory !== "all" && getArtifactCategory(a.type) !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.fileName.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [artifacts, selectedCategory, searchQuery]);

  // Active artifact
  const activeArtifact = useMemo(() => {
    return (
      artifacts.find((a) => a.id === selectedArtifactId) ||
      filteredArtifacts[0] ||
      artifacts[0]
    );
  }, [artifacts, selectedArtifactId, filteredArtifacts]);

  // Index navigation
  const currentIndex = useMemo(() => {
    if (!activeArtifact) return -1;
    return filteredArtifacts.findIndex((a) => a.id === activeArtifact.id);
  }, [filteredArtifacts, activeArtifact]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < filteredArtifacts.length - 1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedArtifactId(filteredArtifacts[currentIndex - 1].id);
    }
  }, [filteredArtifacts, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredArtifacts.length - 1) {
      setSelectedArtifactId(filteredArtifacts[currentIndex + 1].id);
    }
  }, [filteredArtifacts, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Fetch content on demand for text/JSON/evidence/HTML artifacts
  const fetchContent = useCallback(async (artifact: ArtifactItem) => {
    const isImage = artifact.type === "SCREENSHOT";
    const isVideo = artifact.type === "VIDEO";
    const isTrace = artifact.type === "PLAYWRIGHT_TRACE";

    // Media types don't need text content fetching
    if (isImage || isVideo || isTrace) {
      setContent(null);
      setContentLoading(false);
      setContentError(null);
      return;
    }

    setContentLoading(true);
    setContentError(null);

    try {
      const res = await fetch(
        `/api/projects/${project.id}/runs/${testRun.id}/results/${testResult.id}/artifacts/${artifact.id}/content`
      );
      if (!res.ok) {
        throw new Error("Unable to retrieve artifact content from storage.");
      }
      const text = await res.text();
      setContent(text);
    } catch (err: any) {
      setContentError(err.message || "Failed to load artifact content.");
    } finally {
      setContentLoading(false);
    }
  }, [project.id, testRun.id, testResult.id]);

  useEffect(() => {
    if (activeArtifact) {
      fetchContent(activeArtifact);
    }
  }, [activeArtifact, fetchContent]);

  const handleCopyContent = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeArtifact) {
    return (
      <div className="py-20 text-center glass-panel rounded-2xl border border-white/[0.08] space-y-4 max-w-xl mx-auto">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Artifacts Available</h3>
        <p className="text-xs text-zinc-400 font-mono">
          This test result has no captured screenshots, traces, logs, or diagnostic evidence.
        </p>
        <Link
          href={`/dashboard/projects/${project.id}/runs/${testRun.id}/report`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Run Report
        </Link>
      </div>
    );
  }

  // Render viewer based on artifact type
  const renderViewer = () => {
    if (contentLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[420px] space-y-3">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
          <p className="text-xs font-mono text-zinc-400">Loading artifact content...</p>
        </div>
      );
    }

    if (contentError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[420px] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Unable to Load Artifact</h4>
            <p className="text-xs text-zinc-400 font-mono mt-1 max-w-md">
              {contentError}
            </p>
          </div>
          <button
            onClick={() => fetchContent(activeArtifact)}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    switch (activeArtifact.type) {
      case "SCREENSHOT":
      case "VISUAL_BASELINE":
      case "VISUAL_CURRENT":
      case "VISUAL_DIFF":
        return <ScreenshotViewer artifact={activeArtifact} />;
      case "VIDEO":
        return <VideoViewer artifact={activeArtifact} />;
      case "PLAYWRIGHT_TRACE":
        return <TraceViewer artifact={activeArtifact} />;
      case "CONSOLE_LOG":
      case "TEXT":
        return <LogViewer artifact={activeArtifact} content={content || ""} />;
      case "HTML":
        return <HtmlViewer artifact={activeArtifact} content={content || ""} />;
      case "HTTP_RESPONSE":
      case "API_REQUEST":
      case "API_RESPONSE":
      case "PERFORMANCE_EVIDENCE":
      case "A11Y_EVIDENCE":
      case "SEO_EVIDENCE":
      case "NETWORK_LOG":
        return <EvidenceViewer artifact={activeArtifact} content={content || ""} />;
      case "JSON":
      default:
        return <JsonViewer artifact={activeArtifact} content={content || ""} />;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link
              href={`/dashboard/projects/${project.id}/runs/${testRun.id}/report`}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Report #{testRun.id.slice(0, 8)}</span>
            </Link>
            <span>/</span>
            {testResult.testId ? (
              <Link
                href={`/dashboard/tests/${testResult.testId}`}
                className="hover:text-white transition-colors"
              >
                {testResult.testTitle}
              </Link>
            ) : (
              <span>{testResult.testTitle}</span>
            )}
            <span>/</span>
            <span className="text-zinc-200 font-bold">Artifacts</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Artifact Viewer</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
              {artifacts.length} total
            </span>
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {content && (
            <button
              onClick={handleCopyContent}
              className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/[0.08] text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <a
            href={activeArtifact.downloadUrl}
            download={activeArtifact.fileName}
            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Left Sidebar: Artifacts Navigation List */}
        <div
          className={`lg:col-span-4 space-y-3 flex flex-col ${
            !sidebarOpen ? "hidden lg:flex" : ""
          }`}
        >
          {/* Search & Category Filter */}
          <div className="glass-panel p-3.5 rounded-xl border border-white/[0.08] space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search artifacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/[0.1] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    selectedCategory === cat
                      ? "bg-brand-500 text-zinc-950 font-bold"
                      : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Artifact Item Selection List */}
          <div className="flex-1 overflow-auto space-y-1.5 pr-1 max-h-[550px]">
            {filteredArtifacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                No artifacts match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredArtifacts.map((art) => {
                const isSelected = activeArtifact.id === art.id;

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtifactId(art.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? "bg-white/[0.08] border-brand-500/60 shadow-md ring-1 ring-brand-500/40"
                        : "glass-panel border-white/[0.08] hover:border-white/[0.16]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.06] shrink-0">
                        {getArtifactIcon(art.type)}
                      </div>
                      <div className="truncate">
                        <div
                          className={`font-medium truncate ${
                            isSelected ? "text-brand-300" : "text-white"
                          }`}
                        >
                          {art.fileName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex items-center gap-1.5">
                          <span>{art.type.replace(/_/g, " ")}</span>
                          <span>•</span>
                          <span>{art.formattedSize}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane: Active Artifact Content & Toolbar */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Sub Navigation Bar: Previous / Next & Info */}
          <div className="p-3 bg-black/40 border border-white/[0.08] rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded bg-black/40 border border-white/[0.06] shrink-0">
                {getArtifactIcon(activeArtifact.type)}
              </span>
              <span className="font-bold text-white truncate">
                {activeArtifact.fileName}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 bg-white/[0.05] rounded border border-white/[0.06] shrink-0">
                {activeArtifact.type.replace(/_/g, " ")}
              </span>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="px-2 py-1 rounded bg-black/40 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/40 text-zinc-300 border border-white/[0.08] transition-colors flex items-center gap-1 text-[11px]"
                title="Previous Artifact (Left Arrow)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <span className="text-[11px] text-zinc-500 px-1">
                {currentIndex + 1} / {filteredArtifacts.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="px-2 py-1 rounded bg-black/40 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-black/40 text-zinc-300 border border-white/[0.08] transition-colors flex items-center gap-1 text-[11px]"
                title="Next Artifact (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Viewer */}
          <div className="flex-1 min-h-[500px]">
            {renderViewer()}
          </div>
        </div>
      </div>
    </div>
  );
}
