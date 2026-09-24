"use client";

import React, { useState } from "react";
import { Eye, Check, X, Sliders, Layers, Sparkles, AlertCircle } from "lucide-react";

export function VisualTestingSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeDiffMode, setActiveDiffMode] = useState<"slider" | "diff" | "baseline">("slider");

  return (
    <section id="visual-testing" className="py-20 relative bg-[#090A0F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-rose-400 uppercase bg-rose-950/40 px-2.5 py-1 rounded border border-rose-500/20">
            Pixel-Level Regression
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Catch visual bugs before your users do
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Automated visual regression testing with anti-aliasing detection and smart threshold tuning. Compare PR screenshots against production baselines in seconds.
          </p>
        </div>

        {/* Visual Diff Mockup Studio */}
        <div className="max-w-5xl mx-auto rounded-lg surface-card border border-white/[0.08] overflow-hidden">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0D0F14] border-b border-white/[0.08] gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="font-mono text-xs text-zinc-300">
                Checkout_Modal_Desktop_1440x900.png
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                0.24% Drift
              </span>
            </div>

            {/* Mode selection buttons */}
            <div className="flex items-center rounded bg-black/50 p-0.5 border border-white/[0.08] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveDiffMode("slider")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDiffMode === "slider" ? "bg-white/10 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
              >
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setActiveDiffMode("diff")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDiffMode === "diff" ? "bg-white/10 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
              >
                Redline Diff
              </button>
              <button
                type="button"
                onClick={() => setActiveDiffMode("baseline")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDiffMode === "baseline" ? "bg-white/10 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
              >
                Baseline
              </button>
            </div>

            {/* Baseline action decisions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2.5 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08] flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                Reject
              </button>
              <button
                type="button"
                className="px-2.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
          </div>

          {/* Canvas comparison surface */}
          <div className="relative min-h-[340px] bg-[#07080B] p-6 flex items-center justify-center select-none overflow-hidden">
            {/* Visual canvas representation */}
            <div className="w-full max-w-2xl rounded-md border border-white/[0.08] bg-[#111319] p-5 relative overflow-hidden">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                    O
                  </div>
                  <span className="font-semibold text-xs text-white">Acme Store Checkout</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Total: $129.00</span>
              </div>

              {/* Fake UI Body with highlighted diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="space-y-2.5">
                  <div className="h-3.5 w-3/4 rounded bg-white/[0.08]" />
                  <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
                  <div className="h-2.5 w-2/3 rounded bg-white/[0.04]" />
                  
                  {/* Visual drift highlight box */}
                  <div className="relative p-2.5 rounded border border-rose-500/60 bg-rose-500/10">
                    <span className="absolute -top-2.5 -right-1 px-1 py-0.5 rounded bg-rose-600 text-[9px] font-mono font-bold text-white shadow">
                      Padding Shift (+6px)
                    </span>
                    <div className="h-2.5 w-4/5 rounded bg-rose-400/30 mb-1.5" />
                    <div className="h-2.5 w-3/5 rounded bg-rose-400/30" />
                  </div>
                </div>

                <div className="space-y-2.5 p-3.5 rounded bg-black/40 border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Payment Method</span>
                    <span className="text-emerald-400 font-mono">Card ending 4242</span>
                  </div>
                  <div className="h-8 rounded bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-zinc-950 font-semibold text-xs cursor-pointer">
                    Pay $129.00
                  </div>
                </div>
              </div>

              {/* Diff banner indicator */}
              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Viewport: Desktop 1440 × 900</span>
                <span className="text-zinc-500">Engine: Pixelmatch 5.3 (Tolerance: 0.05)</span>
              </div>
            </div>
          </div>

          {/* Interactive slider controller */}
          <div className="px-5 py-3 bg-[#0D0F14] border-t border-white/[0.08] flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 w-full max-w-md">
              <Sliders className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Sensitivity:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-zinc-200 font-mono">{sliderPos}%</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-zinc-500">
              <span>Anti-aliasing: ON</span>
              <span>•</span>
              <span>Dynamic masking: ON</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
