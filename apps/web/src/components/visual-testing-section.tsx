"use client";

import React, { useState } from "react";
import { Eye, Check, X, Sliders, Layers, Sparkles, AlertCircle } from "lucide-react";

export function VisualTestingSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeDiffMode, setActiveDiffMode] = useState<"slider" | "diff" | "baseline">("slider");

  return (
    <section id="visual-testing" className="py-24 relative bg-[#0A0C10] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-fuchsia-400 uppercase bg-fuchsia-950/40 px-3 py-1 rounded-full border border-fuchsia-500/20">
            Pixel-Perfect Precision
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Catch visual bugs before your users do.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Automated visual regression testing with anti-aliasing detection and smart threshold tuning. Compare PR screenshots against production baselines in seconds.
          </p>
        </div>

        {/* Visual Diff Mockup Studio */}
        <div className="max-w-5xl mx-auto rounded-2xl glass-panel-elevated border border-white/[0.1] overflow-hidden shadow-2xl">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#0D0F14] border-b border-white/[0.08] gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="font-mono text-xs font-semibold text-zinc-200">
                Checkout_Modal_Desktop_1440x900.png
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                0.24% Pixel Drift Detected
              </span>
            </div>

            {/* Mode selection buttons */}
            <div className="flex items-center rounded-lg bg-black/40 p-1 border border-white/[0.06] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveDiffMode("slider")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeDiffMode === "slider" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setActiveDiffMode("diff")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeDiffMode === "diff" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Redline Diff
              </button>
              <button
                type="button"
                onClick={() => setActiveDiffMode("baseline")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeDiffMode === "baseline" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Original Baseline
              </button>
            </div>

            {/* Baseline action decisions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold border border-white/[0.08] flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                Reject Change
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve as New Baseline
              </button>
            </div>
          </div>

          {/* Canvas comparison surface */}
          <div className="relative min-h-[380px] bg-[#07080B] p-8 flex items-center justify-center select-none overflow-hidden">
            {/* Visual canvas representation */}
            <div className="w-full max-w-3xl rounded-xl border border-white/[0.08] bg-[#12141B] p-6 shadow-2xl relative overflow-hidden">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-brand-500/20 flex items-center justify-center font-bold text-xs text-brand-400">
                    O
                  </div>
                  <span className="font-semibold text-sm text-white">Acme Store Checkout</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Total: $129.00</span>
              </div>

              {/* Fake UI Body with highlighted diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
                  
                  {/* Visual drift highlight box */}
                  <div className="relative p-3 rounded-lg border-2 border-rose-500 bg-rose-500/10">
                    <span className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded bg-rose-600 text-[10px] font-mono font-bold text-white shadow">
                      Padding Shift (+6px)
                    </span>
                    <div className="h-3 w-4/5 rounded bg-rose-400/30 mb-2" />
                    <div className="h-3 w-3/5 rounded bg-rose-400/30" />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-black/40 border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Payment Method</span>
                    <span className="text-brand-400">Card ending 4242</span>
                  </div>
                  <div className="h-10 rounded-lg bg-brand-500 flex items-center justify-center text-zinc-950 font-bold text-xs shadow-md">
                    Pay $129.00
                  </div>
                </div>
              </div>

              {/* Diff banner indicator */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Viewport: Desktop 1440 × 900</span>
                <span className="text-fuchsia-400">Engine: Pixelmatch 5.3 (Tolerance: 0.05)</span>
              </div>
            </div>
          </div>

          {/* Interactive slider controller */}
          <div className="px-6 py-4 bg-[#0D0F14] border-t border-white/[0.08] flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 w-full max-w-md">
              <Sliders className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Sensitivity Threshold:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="text-zinc-200 font-bold">{sliderPos}%</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span>Anti-aliasing: ON</span>
              <span>•</span>
              <span>Mask dynamic elements: ON</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
