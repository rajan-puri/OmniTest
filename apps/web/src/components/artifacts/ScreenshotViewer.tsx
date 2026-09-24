"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Maximize,
  Sun,
  Moon,
  Grid,
  Info,
} from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface ScreenshotViewerProps {
  artifact: ArtifactItem;
}

type BgMode = "dark" | "light" | "checkerboard";

export function ScreenshotViewer({ artifact }: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [fitToScreen, setFitToScreen] = useState<boolean>(true);
  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom on artifact change
  useEffect(() => {
    setZoom(1);
    setFitToScreen(true);
    setDimensions(null);
  }, [artifact.id]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setDimensions({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
  };

  const handleZoomIn = () => {
    setFitToScreen(false);
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setFitToScreen(false);
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setFitToScreen(false);
    setZoom(1);
  };

  const handleFitToggle = () => {
    setFitToScreen(true);
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const getBgClass = () => {
    switch (bgMode) {
      case "light":
        return "bg-zinc-100 text-zinc-900";
      case "checkerboard":
        return "bg-[linear-gradient(45deg,#1f1f1f_25%,transparent_25%),linear-gradient(-45deg,#1f1f1f_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f1f1f_75%),linear-gradient(-45deg,transparent_75%,#1f1f1f_75%)] bg-[size:20px_20px] bg-[#121212]";
      case "dark":
      default:
        return "bg-black/80";
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel"
    >
      {/* Viewer Toolbar */}
      <div className="p-3 bg-black/60 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-white text-[11px] min-w-[50px] text-center">
            {fitToScreen ? "FIT" : `${Math.round(zoom * 100)}%`}
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
          <button
            onClick={handleFitToggle}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              fitToScreen
                ? "bg-brand-500/20 text-brand-400"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            Fit
          </button>
          <button
            onClick={handleResetZoom}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
              !fitToScreen && zoom === 1
                ? "bg-brand-500/20 text-brand-400"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            100%
          </button>
        </div>

        {/* Background & Fullscreen options */}
        <div className="flex items-center gap-2">
          {/* Background Toggle */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setBgMode("dark")}
              className={`p-1.5 rounded transition-colors ${
                bgMode === "dark" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Dark Background"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBgMode("light")}
              className={`p-1.5 rounded transition-colors ${
                bgMode === "light" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Light Background"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBgMode("checkerboard")}
              className={`p-1.5 rounded transition-colors ${
                bgMode === "checkerboard" ? "bg-white/15 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Checkerboard Background (Transparency)"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-black/40 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div
        className={`flex-1 overflow-auto flex items-center justify-center p-4 transition-colors relative select-none ${getBgClass()}`}
        style={{ minHeight: "420px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={artifact.url}
          alt={artifact.fileName}
          onLoad={handleImageLoad}
          className={`transition-transform duration-100 ease-out origin-center shadow-2xl rounded-sm ${
            fitToScreen ? "max-w-full max-h-[70vh] object-contain" : ""
          }`}
          style={{
            transform: !fitToScreen ? `scale(${zoom})` : undefined,
          }}
        />
      </div>

      {/* Image Metadata Bar */}
      <div className="p-3 bg-black/60 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          {dimensions && (
            <span>
              Dimensions: <strong className="text-white">{dimensions.width} &times; {dimensions.height}</strong>
            </span>
          )}
          <span>
            Format: <strong className="text-white">{artifact.contentType.split("/")[1]?.toUpperCase() || "PNG"}</strong>
          </span>
          <span>
            Size: <strong className="text-white">{artifact.formattedSize}</strong>
          </span>
        </div>
        <div>
          Captured:{" "}
          <strong className="text-zinc-300">
            {new Date(artifact.createdAt).toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
}
