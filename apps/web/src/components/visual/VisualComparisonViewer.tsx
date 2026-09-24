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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS ({metrics?.differencePercentage ?? 0}% Diff)
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            FAIL ({metrics?.differencePercentage ?? 0}% Diff)
          </span>
        );
      case "DIMENSION_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            DIMENSION MISMATCH
          </span>
        );
      case "NO_BASELINE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            NO BASELINE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Metrics Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100">Visual Regression Comparison</h2>
              {renderStatusBadge()}
            </div>
            {testTitle && <p className="text-sm text-slate-400 font-mono">{testTitle}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {testId && currentArtifactId && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {status === "NO_BASELINE" ? "Set as Baseline" : "Update Baseline"}
              </button>
            )}

            {effectiveDiffUrl && (
              <a
                href={effectiveDiffUrl}
                download="diff.png"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Diff
              </a>
            )}
          </div>
        </div>

        {updateSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-xs font-medium">
            <Check className="w-4 h-4" />
            Baseline updated successfully! Future test executions will compare against this screenshot.
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Difference %</span>
            <span
              className={`text-sm font-bold font-mono ${
                status === "PASSED" ? "text-emerald-400" : status === "FAILED" ? "text-rose-400" : "text-slate-200"
              }`}
            >
              {metrics ? `${metrics.differencePercentage}%` : "—"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Threshold %</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {metrics ? `${metrics.thresholdPercentage}%` : "0.1%"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Changed Pixels</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {metrics ? metrics.changedPixels.toLocaleString() : "—"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Total Pixels</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {metrics ? metrics.totalPixels.toLocaleString() : "—"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Current Dim.</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {metrics ? `${metrics.currentWidth} × ${metrics.currentHeight}` : "—"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Baseline Dim.</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {metrics ? `${metrics.baselineWidth} × ${metrics.baselineHeight}` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "side-by-side"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side
          </button>

          <button
            onClick={() => setViewMode("diff")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "diff"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Diff View
          </button>

          <button
            onClick={() => setViewMode("slider")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "slider"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Split Slider
          </button>

          <button
            onClick={() => setViewMode("overlay")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "overlay"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Opacity Overlay
          </button>
        </div>

        {/* View mode specific controls */}
        {viewMode === "slider" && (
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span>Split: {Math.round(sliderPosition)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-36 accent-indigo-500 cursor-pointer"
            />
          </div>
        )}

        {viewMode === "overlay" && (
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span>Current Opacity: {overlayOpacity}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-36 accent-indigo-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden min-h-[500px] flex items-center justify-center">
        {/* Mode 1: Side by Side */}
        {viewMode === "side-by-side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Baseline Column */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span className="font-semibold text-slate-300">Baseline Image</span>
                <span>{metrics ? `${metrics.baselineWidth} × ${metrics.baselineHeight} px` : "Expected"}</span>
              </div>
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50 flex items-center justify-center p-2 min-h-[300px]">
                {effectiveBaselineUrl ? (
                  <img
                    src={effectiveBaselineUrl}
                    alt="Baseline"
                    className="max-w-full h-auto object-contain rounded shadow"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-500 text-xs">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No baseline image set yet.
                  </div>
                )}
              </div>
            </div>

            {/* Current Column */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span className="font-semibold text-slate-300">Current Screenshot</span>
                <span>{metrics ? `${metrics.currentWidth} × ${metrics.currentHeight} px` : "Actual"}</span>
              </div>
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50 flex items-center justify-center p-2 min-h-[300px]">
                {effectiveCurrentUrl ? (
                  <img
                    src={effectiveCurrentUrl}
                    alt="Current Screenshot"
                    className="max-w-full h-auto object-contain rounded shadow"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-500 text-xs">
                    No current screenshot captured.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Diff View */}
        {viewMode === "diff" && (
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <div className="flex items-center justify-between w-full max-w-4xl text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">Pixel Difference Highlight (Magenta = Changed)</span>
              <span className="text-rose-400 font-mono font-medium">
                {metrics ? `${metrics.changedPixels.toLocaleString()} pixels changed (${metrics.differencePercentage}%)` : ""}
              </span>
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/80 p-3 max-w-full shadow-2xl">
              {effectiveDiffUrl ? (
                <img
                  src={effectiveDiffUrl}
                  alt="Visual Diff"
                  className="max-w-full h-auto object-contain rounded shadow"
                />
              ) : status === "NO_BASELINE" ? (
                <div className="text-center p-12 text-slate-500 text-sm">
                  Diff image unavailable because no baseline was set for this test.
                </div>
              ) : (
                <div className="text-center p-12 text-emerald-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  0 pixel difference detected! The screenshot matches the baseline perfectly.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 3: Split Slider */}
        {viewMode === "slider" && (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-xs text-slate-400">
              Drag the center slider or use mouse to wipe between Baseline (left) and Current (right).
            </p>
            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              className="relative max-w-4xl w-full border border-slate-800 rounded-lg overflow-hidden select-none cursor-ew-resize bg-slate-900"
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
                className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-[10px] text-white font-bold">
                  ⟷
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 4: Opacity Overlay */}
        {viewMode === "overlay" && (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-xs text-slate-400">
              Baseline is fixed underneath. Adjust the Current screenshot opacity to detect shifts.
            </p>
            <div className="relative max-w-4xl w-full border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
              {/* Baseline */}
              {effectiveBaselineUrl ? (
                <img
                  src={effectiveBaselineUrl}
                  alt="Baseline fixed"
                  className="w-full h-auto block select-none"
                />
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">No baseline set</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-100">
                {status === "NO_BASELINE" ? "Set Initial Baseline?" : "Replace Existing Baseline?"}
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {status === "NO_BASELINE"
                ? "This will save the current screenshot as the golden baseline for all future runs of this test."
                : "This action will permanently replace the active baseline for this test with the current screenshot. All subsequent visual regression tests will be evaluated against this new image."}
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isUpdatingBaseline}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBaseline}
                disabled={isUpdatingBaseline}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
              >
                {isUpdatingBaseline && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {status === "NO_BASELINE" ? "Confirm & Set Baseline" : "Confirm Baseline Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
