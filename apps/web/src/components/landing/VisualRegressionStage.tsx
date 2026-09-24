"use client";

import React, { useState, useRef, useCallback } from "react";
import { AlertCircle, Sliders, Check, X, ArrowLeftRight } from "lucide-react";

export function VisualRegressionStage() {
  const [sliderPos, setSliderPos] = useState(52);
  const [tolerance, setTolerance] = useState(0.05);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(Math.round(pct));
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateSliderFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPos((p) => Math.max(5, p - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPos((p) => Math.min(95, p + 5));
    }
  };

  return (
    <section
      id="visual-diff"
      className="relative py-24 bg-[#F5F3EE] text-[#0E0D0B] border-b border-[#0E0D0B]/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header (Dark typography on Light Background) */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E5E2D9] border border-[#0E0D0B]/10 text-xs font-mono text-[#0E0D0B] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
            STEP 04/08: VISUAL REGRESSION ENGINE
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#0E0D0B] leading-[1.05] max-w-3xl">
            Catch pixel-level layout drift before production builds ship.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#58554C] max-w-2xl">
            Automated image diffing powered by Pixelmatch. Draggable comparison reveals unintended margin collapses, missing assets, and font rendering shifts instantly.
          </p>
        </div>

        {/* Studio Controls Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#0E0D0B]/10 gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0E0D0B]">
              checkout-desktop-1440x900.png
            </span>
            <span className="px-2 py-0.5 rounded bg-[#F43F5E]/15 text-[#F43F5E] font-semibold text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              0.42% Pixel Drift Detected
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#58554C]" />
              <span>Tolerance:</span>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-20 h-1 bg-stone-300 rounded appearance-none cursor-pointer accent-[#0E0D0B]"
                aria-label="Diff Tolerance Threshold"
              />
              <span className="font-semibold">{tolerance}</span>
            </div>
            <span className="text-[#848074]">Anti-aliasing: ON</span>
          </div>
        </div>

        {/* Draggable Before / After Diff Stage Canvas */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Visual regression diff comparison slider"
          aria-valuenow={sliderPos}
          aria-valuemin={5}
          aria-valuemax={95}
          className="relative rounded-lg bg-[#FFFFFF] border border-[#0E0D0B]/12 min-h-[380px] shadow-lg select-none overflow-hidden cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#00E58F]"
        >
          {/* Baseline Canvas (Underneath) */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between bg-[#FAFAFA]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#0E0D0B] text-white font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <span className="font-semibold text-sm text-[#0E0D0B]">Acme Store Checkout</span>
                </div>
                <span className="text-xs font-mono text-stone-500">PROD BASELINE</span>
              </div>

              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-stone-300" />
                  <div className="h-3 w-1/2 rounded bg-stone-200" />
                  <div className="h-3 w-2/3 rounded bg-stone-200" />
                  <div className="p-3 rounded bg-stone-100 border border-stone-200 text-xs font-mono text-stone-600">
                    Standard 16px Container Padding
                  </div>
                </div>
                <div className="p-4 rounded bg-stone-100 border border-stone-200 space-y-3">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">$340.00</span>
                  </div>
                  <div className="h-9 rounded bg-[#0E0D0B] text-white text-xs font-semibold flex items-center justify-center">
                    Pay Now
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-between text-[11px] font-mono text-stone-500">
              <span>Viewport: 1440 × 900</span>
              <span>Baseline: commit 8f2a1b</span>
            </div>
          </div>

          {/* New PR Screenshot Canvas (Clipped by slider position via clip-path) */}
          <div
            className="absolute inset-0 p-8 flex flex-col justify-between bg-white border-r border-[#F43F5E]"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#0E0D0B] text-white font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <span className="font-semibold text-sm text-[#0E0D0B]">Acme Store Checkout</span>
                </div>
                <span className="text-xs font-mono text-[#F43F5E] font-semibold">
                  CURRENT PR RUN (SHIFT DETECTED)
                </span>
              </div>

                <div className="grid grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-stone-300" />
                    <div className="h-3 w-1/2 rounded bg-stone-200" />
                    <div className="h-3 w-2/3 rounded bg-stone-200" />

                    {/* Redline Diff Highlight */}
                    <div className="relative p-3 rounded border-2 border-[#F43F5E] bg-[#F43F5E]/10 text-xs font-mono text-[#F43F5E] font-bold">
                      <span className="absolute -top-3 right-2 px-1.5 py-0.5 rounded bg-[#F43F5E] text-white text-[10px]">
                        +8px Padding Drift
                      </span>
                      Padding Shift (Broken Margin in PR)
                    </div>
                  </div>

                  <div className="p-4 rounded bg-stone-100 border border-stone-200 space-y-3">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold">$340.00</span>
                    </div>
                    <div className="h-9 rounded bg-[#0E0D0B] text-white text-xs font-semibold flex items-center justify-center">
                      Pay Now
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-between text-[11px] font-mono text-stone-500">
                <span>Viewport: 1440 × 900</span>
                <span className="text-[#F43F5E] font-semibold">Diff Pixels: 420 px</span>
              </div>
            </div>

          {/* Draggable Divider Handle */}
          <div
            className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 -ml-4 rounded-full bg-[#0E0D0B] text-white shadow-xl flex items-center justify-center border border-white/20">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Decision Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <span className="text-[#58554C]">
            Use mouse drag, touch swipe, or arrow keys to scrub pixel redline diff.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-white text-[#0E0D0B] border border-stone-300 hover:bg-stone-50 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#F43F5E]" />
              Reject &amp; Fail Check
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded bg-[#0E0D0B] hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-[#00E58F]" />
              Accept as New Baseline
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
