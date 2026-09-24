"use client";

import React, { useState, useRef, useCallback } from "react";
import { Container } from "../primitives/Container";

export const PrecisionVisualDiff: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [tolerance, setTolerance] = useState(0.2);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  // Calculate drift display based on tolerance
  const driftVal = (0.42 * (tolerance / 0.2)).toFixed(2);

  return (
    <section
      id="visual-regression"
      className="relative w-full py-[clamp(64px,10vw,120px)] theme-light-stage bg-[#F1EFE8] text-[#14130F] blueprint-grid-light border-y border-[#14130F]/12 overflow-hidden select-none"
    >
      <Container bleed className="px-4 sm:px-6 md:px-12 flex flex-col items-center">
        {/* Full-bleed stage container ~90vw & ~70vh */}
        <div className="w-full max-w-[1280px]">
          {/* Header controls bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="font-mono text-[11px] text-[#5C584E] uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                <span>VISUAL REGRESSION ENGINE</span>
              </div>
              <h2 className="text-[clamp(1.5rem,3.2vw,2.5rem)] font-extrabold tracking-tight text-[#14130F]">
                Deterministic pixel differential inspection.
              </h2>
            </div>

            {/* Tolerance Control & Drift Counter */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-[13px] bg-white border border-[#14130F]/12 p-3 rounded-[6px] shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#5C584E]">TOLERANCE:</span>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseFloat(e.target.value))}
                  className="w-24 accent-[#14130F] cursor-pointer"
                  aria-label="Diff tolerance threshold"
                />
                <span className="font-bold tabular-nums text-[#14130F] w-12 text-right">
                  {tolerance.toFixed(2)}%
                </span>
              </div>

              <div className="h-4 w-px bg-[#14130F]/14 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] font-bold text-[12px]">
                  DIFF DETECTED
                </span>
                <span className="font-bold tabular-nums text-[#14130F]">
                  {driftVal}% DRIFT
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Draggable Diff Stage (~70vh max height, responsive) */}
          <div
            ref={stageRef}
            tabIndex={0}
            role="slider"
            aria-label="Before and after visual diff slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPos)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onKeyDown={handleKeyDown}
            className="relative w-full h-[65vh] min-h-[440px] max-h-[720px] rounded-[6px] border border-[#14130F]/16 bg-white overflow-hidden shadow-sm cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#14130F]"
          >
            {/* BASELINE LAYER (Before) */}
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between bg-white text-[#14130F] select-none pointer-events-none">
              <div className="flex items-center justify-between border-b border-[#14130F]/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[4px] bg-[#14130F]" />
                  <span className="font-mono font-bold text-[16px]">OmniCloud Console</span>
                </div>
                <div className="font-mono text-[13px] text-[#5C584E]">
                  BASELINE: COMMIT #9c41a2 (v2.3.9)
                </div>
              </div>

              {/* Baseline UI Mockup */}
              <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
                <div className="p-6 rounded-[6px] border border-[#14130F]/12 bg-[#F1EFE8]/50">
                  <div className="font-mono text-[12px] text-[#5C584E] uppercase">Billing Tier</div>
                  <div className="text-[28px] font-bold text-[#14130F] mt-1">$49 / developer / mo</div>
                  <p className="text-[14px] text-[#5C584E] mt-2">
                    Standard production access with unlimited headless concurrency.
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[13px] font-mono text-[#5C584E]">4 dedicated worker pods</span>
                    <button className="px-5 py-2.5 rounded-[4px] bg-[#14130F] text-white font-mono text-[13px] font-semibold">
                      Upgrade Cluster
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#14130F]/10 font-mono text-[12px] text-[#5C584E]">
                <span>VIEWPORT: 1440 × 900 (2x DPR)</span>
                <span>STATUS: 0 PIXEL MISMATCH</span>
              </div>
            </div>

            {/* DIFF LAYER (After with Pixel Redline Highlights) */}
            <div
              className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between bg-[#F8F7F4] text-[#14130F] select-none pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              <div className="flex items-center justify-between border-b border-[#14130F]/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-[4px] bg-[#F43F5E]" />
                  <span className="font-mono font-bold text-[16px]">OmniCloud Console</span>
                </div>
                <div className="font-mono text-[13px] text-[#F43F5E] font-bold">
                  PR #418: HEAD (REGRESSION CANDIDATE)
                </div>
              </div>

              {/* Regressed UI Mockup with Redline Highlights */}
              <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
                <div className="p-6 rounded-[6px] border border-[#F43F5E] bg-[#F43F5E]/5 relative">
                  {/* Red highlight badge */}
                  <div className="absolute -top-3.5 right-6 px-2 py-0.5 rounded-[3px] bg-[#F43F5E] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    PADDING DRIFT +8PX
                  </div>

                  <div className="font-mono text-[12px] text-[#5C584E] uppercase">Billing Tier</div>
                  {/* Shifted size / font regression */}
                  <div className="text-[32px] font-bold text-[#F43F5E] mt-1 relative inline-block">
                    $49 / developer / mo
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#F43F5E]" />
                  </div>
                  <p className="text-[14px] text-[#5C584E] mt-4">
                    Standard production access with unlimited headless concurrency.
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[13px] font-mono text-[#5C584E]">4 dedicated worker pods</span>
                    {/* Shifted button with mismatch highlight */}
                    <div className="relative">
                      <button className="px-7 py-3 rounded-[4px] bg-[#F43F5E] text-white font-mono text-[13px] font-semibold">
                        Upgrade Cluster
                      </button>
                      <div className="absolute -inset-1 border-2 border-dashed border-[#F43F5E] rounded-[6px] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#14130F]/10 font-mono text-[12px] text-[#F43F5E] font-semibold">
                <span>VIEWPORT: 1440 × 900</span>
                <span>REDLINE DIFF: 148 MISMATCHED PIXELS</span>
              </div>
            </div>

            {/* Draggable Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#14130F] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Divider Handle Knob */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#14130F] text-white flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {/* Floating Labels (Baseline on right, Diff on left) */}
            <div className="absolute bottom-4 left-4 pointer-events-none bg-white/90 backdrop-blur-sm border border-[#14130F]/14 px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold text-[#F43F5E]">
              DIFF (PR #418)
            </div>
            <div className="absolute bottom-4 right-4 pointer-events-none bg-white/90 backdrop-blur-sm border border-[#14130F]/14 px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold text-[#14130F]">
              BASELINE (v2.3.9)
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
