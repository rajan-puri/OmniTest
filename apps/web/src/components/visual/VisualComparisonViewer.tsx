/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  Columns,
  Layers,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Download,
  Check,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { VisualComparisonResult, VisualComparisonStatus } from "@/lib/visual/visual-types";

interface VisualComparisonViewerProps {
  projectId: string;
  testId?: string | null;
  runId: string;
  resultId: string;
  testTitle?: string;
  visualComparison?: VisualComparisonResult | null;
  baselineUrl?: string | null;
  currentUrl?: string | null;
  diffUrl?: string | null;
  currentArtifactId?: string | null;
  onBaselineUpdated?: () => void;
}

export function VisualComparisonViewer({
  projectId,
  testId,
  runId,
  resultId,
  testTitle,
  visualComparison,
  baselineUrl,
  currentUrl,
  diffUrl,
  currentArtifactId,
  onBaselineUpdated,
}: VisualComparisonViewerProps) {
  type ViewMode = "side-by-side" | "diff" | "slider" | "overlay";
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [overlayOpacity, setOverlayOpacity] = useState<number>(50); // 0 to 100%
  const [isUpdatingBaseline, setIsUpdatingBaseline] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveBaselineUrl = baselineUrl || visualComparison?.baselineUrl;
  const effectiveCurrentUrl = currentUrl || visualComparison?.currentUrl;
  const effectiveDiffUrl = diffUrl || visualComparison?.diffUrl;
  const metrics = visualComparison?.metrics;
  const status: VisualComparisonStatus = visualComparison?.status || (effectiveBaselineUrl ? "PASSED" : "NO_BASELINE");

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Drag handler for Split Slider
  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleUpdateBaseline = async () => {
    if (!testId || !currentArtifactId) {
      setErrorMessage("Cannot update baseline: missing test ID or current screenshot artifact.");
      return;
    }

    setIsUpdatingBaseline(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/tests/${testId}/visual-regression/baseline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifactId: currentArtifactId,
          runId,
          resultId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update baseline");
      }

      setUpdateSuccess(true);
      setShowConfirmModal(false);
      if (onBaselineUpdated) {
        onBaselineUpdated();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update baseline");
    } finally {
      setIsUpdatingBaseline(false);
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PASS ({metrics?.differencePercentage ?? 0}% Diff)
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            FAIL ({metrics?.differencePercentage ?? 0}% Diff)
          </span>
        );
      case "DIMENSION_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            DIMENSION MISMATCH
          </span>
        );
      case "NO_BASELINE":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            NO BASELINE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Header & Metrics Bar */}
      <div className="surface-card border border-white/[0.08] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white font-mono">Visual Regression Comparison</h2>
              {renderStatusBadge()}
            </div>
            {testTitle && <p className="text-xs text-zinc-400 font-mono">{testTitle}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {testId && currentArtifactId && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-mono font-medium rounded-md border border-white/[0.08] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                {status === "NO_BASELINE" ? "Set as Baseline" : "Update Baseline"}
              </button>
            )}

            {effectiveDiffUrl && (
              <a
                href={effectiveDiffUrl}
                download="diff.png"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono font-medium rounded-md border border-white/[0.08] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                Download Diff
              </a>
            )}
          </div>
        </div>

        {updateSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Check className="w-4 h-4 shrink-0" />
            Baseline updated successfully. Future test runs will compare against this screenshot.
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center gap-2 text-rose-400 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs font-mono">
          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Diff %</span>
            <span
              className={`text-sm font-bold ${
                status === "PASSED" ? "text-emerald-400" : status === "FAILED" ? "text-rose-400" : "text-zinc-200"
              }`}
            >
              {metrics ? `${metrics.differencePercentage}%` : "—"}
            </span>
          </div>

          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Threshold</span>
            <span className="text-sm font-semibold text-zinc-200">
              {metrics ? `${metrics.thresholdPercentage}%` : "0.1%"}
            </span>
          </div>

          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Changed</span>
            <span className="text-sm font-semibold text-zinc-200">
              {metrics ? metrics.changedPixels.toLocaleString() : "—"}
            </span>
          </div>

          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Total Pixels</span>
            <span className="text-sm font-semibold text-zinc-200">
              {metrics ? metrics.totalPixels.toLocaleString() : "—"}
            </span>
          </div>

          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Current Dim</span>
            <span className="text-sm font-semibold text-zinc-200">
              {metrics ? `${metrics.currentWidth}×${metrics.currentHeight}` : "—"}
            </span>
          </div>

          <div className="bg-black/40 p-2 rounded-md border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase">Baseline Dim</span>
            <span className="text-sm font-semibold text-zinc-200">
              {metrics ? `${metrics.baselineWidth}×${metrics.baselineHeight}` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 surface-card border border-white/[0.08] p-1.5 rounded-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              viewMode === "side-by-side"
                ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side
          </button>

          <button
            onClick={() => setViewMode("diff")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              viewMode === "diff"
                ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Diff View
          </button>

          <button
            onClick={() => setViewMode("slider")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              viewMode === "slider"
                ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Split Slider
          </button>

          <button
            onClick={() => setViewMode("overlay")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              viewMode === "overlay"
                ? "bg-white/[0.08] text-white font-semibold border border-white/[0.08]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Opacity Overlay
          </button>
        </div>

        {/* View mode specific controls */}
        {viewMode === "slider" && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300 pr-2">
            <span>Split: {Math.round(sliderPosition)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-32 accent-emerald-400 cursor-pointer"
            />
          </div>
        )}

        {viewMode === "overlay" && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300 pr-2">
            <span>Current Opacity: {overlayOpacity}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-32 accent-emerald-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-black/60 border border-white/[0.08] rounded-lg p-4 overflow-hidden min-h-[460px] flex items-center justify-center">
        {/* Mode 1: Side by Side */}
        {viewMode === "side-by-side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Baseline Column */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs px-1 font-mono text-zinc-400">
                <span className="font-semibold text-zinc-300">Baseline Image</span>
                <span>{metrics ? `${metrics.baselineWidth} × ${metrics.baselineHeight} px` : "Expected"}</span>
              </div>
              <div className="border border-white/[0.08] rounded-md overflow-hidden bg-black/40 flex items-center justify-center p-2 min-h-[300px]">
                {effectiveBaselineUrl ? (
                  <img
                    src={effectiveBaselineUrl}
                    alt="Baseline"
                    className="max-w-full h-auto object-contain rounded"
                  />
                ) : (
                  <div className="text-center p-8 text-zinc-500 text-xs font-mono">
                    <HelpCircle className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                    No baseline image set yet.
                  </div>
                )}
              </div>
            </div>

            {/* Current Column */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs px-1 font-mono text-zinc-400">
                <span className="font-semibold text-zinc-300">Current Screenshot</span>
                <span>{metrics ? `${metrics.currentWidth} × ${metrics.currentHeight} px` : "Actual"}</span>
              </div>
              <div className="border border-white/[0.08] rounded-md overflow-hidden bg-black/40 flex items-center justify-center p-2 min-h-[300px]">
                {effectiveCurrentUrl ? (
                  <img
                    src={effectiveCurrentUrl}
                    alt="Current Screenshot"
                    className="max-w-full h-auto object-contain rounded"
                  />
                ) : (
                  <div className="text-center p-8 text-zinc-500 text-xs font-mono">
                    No current screenshot captured.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Diff View */}
        {viewMode === "diff" && (
          <div className="flex flex-col items-center justify-center w-full gap-3">
            <div className="flex items-center justify-between w-full max-w-4xl text-xs font-mono text-zinc-400 px-1">
              <span className="font-semibold text-zinc-300">Pixel Difference Highlight (Magenta = Changed)</span>
              <span className="text-rose-400 font-medium">
                {metrics ? `${metrics.changedPixels.toLocaleString()} pixels changed (${metrics.differencePercentage}%)` : ""}
              </span>
            </div>
            <div className="border border-white/[0.08] rounded-md overflow-hidden bg-black/40 p-2 max-w-full">
              {effectiveDiffUrl ? (
                <img
                  src={effectiveDiffUrl}
                  alt="Visual Diff"
                  className="max-w-full h-auto object-contain rounded"
                />
              ) : status === "NO_BASELINE" ? (
                <div className="text-center p-12 text-zinc-500 text-xs font-mono">
                  Diff image unavailable because no baseline was set for this test.
                </div>
              ) : (
                <div className="text-center p-12 text-emerald-400 text-xs font-mono flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  0 pixel difference detected. The screenshot matches the baseline perfectly.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 3: Split Slider */}
        {viewMode === "slider" && (
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-xs font-mono text-zinc-500">
              Drag the center divider to compare Baseline (left) and Current (right).
            </p>
            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              className="relative max-w-4xl w-full border border-white/[0.08] rounded-md overflow-hidden select-none cursor-ew-resize bg-black/40"
            >
              {/* Baseline Image (Underneath) */}
              {effectiveBaselineUrl && (
                <img
                  src={effectiveBaselineUrl}
                  alt="Baseline Underneath"
                  className="w-full h-auto block select-none pointer-events-none"
                />
              )}

              {/* Current Image (Clipped on top) */}
              {effectiveCurrentUrl && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  }}
                >
                  <img
                    src={effectiveCurrentUrl}
                    alt="Current Clipped"
                    className="w-full h-auto block select-none pointer-events-none"
                  />
                </div>
              )}

              {/* Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-zinc-900 rounded-full border border-white/50 flex items-center justify-center shadow text-[9px] text-white">
                  ⟷
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 4: Opacity Overlay */}
        {viewMode === "overlay" && (
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-xs font-mono text-zinc-500">
              Baseline is fixed underneath. Adjust the Current screenshot opacity slider above.
            </p>
            <div className="relative max-w-4xl w-full border border-white/[0.08] rounded-md overflow-hidden bg-black/40">
              {/* Baseline */}
              {effectiveBaselineUrl ? (
                <img
                  src={effectiveBaselineUrl}
                  alt="Baseline fixed"
                  className="w-full h-auto block select-none"
                />
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono">No baseline set</div>
              )}

              {/* Current overlaid with opacity */}
              {effectiveCurrentUrl && (
                <img
                  src={effectiveCurrentUrl}
                  alt="Current overlaid"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-75"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Baseline Replacement */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111319] border border-white/[0.1] rounded-lg max-w-md w-full p-5 shadow-2xl flex flex-col gap-3 font-mono">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">
                {status === "NO_BASELINE" ? "Set Initial Baseline?" : "Replace Baseline?"}
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {status === "NO_BASELINE"
                ? "This will save the current screenshot as the golden baseline for all future runs of this test."
                : "This action will permanently replace the active baseline for this test with the current screenshot. All subsequent visual regression tests will be evaluated against this new image."}
            </p>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isUpdatingBaseline}
                className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs rounded-md border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBaseline}
                disabled={isUpdatingBaseline}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-md transition-colors disabled:opacity-50"
              >
                {isUpdatingBaseline && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {status === "NO_BASELINE" ? "Confirm & Set Baseline" : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
