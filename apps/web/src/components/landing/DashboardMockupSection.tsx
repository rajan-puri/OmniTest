"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, Play, Video, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";

export function DashboardMockupSection() {
  const [passCount, setPassCount] = useState(0);

  // Animated counter on mount / scroll
  useEffect(() => {
    let start = 0;
    const end = 142;
    const duration = 1200;
    const stepTime = Math.abs(Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 2;
      if (start >= end) {
        setPassCount(end);
        clearInterval(timer);
      } else {
        setPassCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="dashboard"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 07/08: OBSERVABILITY DASHBOARD
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            A developer dashboard built for high-density diagnostics.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            Inspect live streaming executions, scrub interactive Playwright traces, and watch synchronized video replays with zero lag.
          </p>
        </div>

        {/* Large Mockup Console */}
        <div className="rounded-lg bg-[#161512] border border-white/[0.1] overflow-hidden shadow-2xl">
          {/* Dashboard Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#1D1B17] border-b border-white/[0.08] gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#00E58F]/15 text-[#00E58F] font-bold border border-[#00E58F]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PASSED #482
              </span>
              <span className="text-[#F5F3EE] font-semibold">
                PR #84: Add Apple Pay &amp; Express Checkout
              </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00E58F]" />
                1.82s total
              </span>
              <span className="text-[#00E58F] font-semibold">
                {passCount}/142 tests passing
              </span>
            </div>
          </div>

          {/* Subheader Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] bg-[#12110E] border-b border-white/[0.06] font-mono text-xs">
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Execution Fleet</span>
              <span className="text-[#F5F3EE] font-semibold">4 Workers (Chromium)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Accessibility (axe)</span>
              <span className="text-[#00E58F] font-semibold">0 Violations (WCAG AA)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Core Web Vitals</span>
              <span className="text-[#00E58F] font-semibold">LCP 1.1s (98/100)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Visual Drift</span>
              <span className="text-[#00E58F] font-semibold">0.00% (Baseline Match)</span>
            </div>
          </div>

          {/* Split Stage: Suite Tree (Left) + Video / Trace Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] bg-[#0E0D0B]">
            {/* Left Column: Suite Timeline */}
            <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-white/[0.08] space-y-2 font-mono text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                Execution Steps Waterfall
              </div>

              <div className="p-3 rounded bg-[#1D1B17] border border-[#00E58F]/20 space-y-1.5">
                <div className="flex items-center justify-between text-[#F5F3EE] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E58F]" />
                    e2e / customer-checkout.spec.ts
                  </span>
                  <span className="text-[11px] text-zinc-400">1.42s</span>
                </div>
                <div className="pl-5 space-y-1 text-[11px] text-[#A29E94]">
                  <div className="flex justify-between">
                    <span>1. goto(/checkout)</span>
                    <span className="text-zinc-500">180ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. fill(input#email)</span>
                    <span className="text-zinc-500">60ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. click(button#pay)</span>
                    <span className="text-zinc-500">140ms</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#161512] border border-white/[0.04] flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  api / stripe-webhook-handler.spec.ts
                </span>
                <span className="text-[11px] text-zinc-500">140ms</span>
              </div>

              <div className="p-3 rounded bg-[#161512] border border-white/[0.04] flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                  a11y / wcag-aa-checkout.spec.ts
                </span>
                <span className="text-[11px] text-zinc-500">280ms</span>
              </div>
            </div>

            {/* Right Column: Synchronized Video & Trace Scrubber */}
            <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-[#12110E]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                  <span className="text-[#F5F3EE] flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#00E58F]" />
                    Synchronized Video Recording &amp; Interactive Playwright Trace
                  </span>
                  <span className="text-zinc-500 text-[11px]">DOM Snapshot: 100%</span>
                </div>

                {/* Mock Video Canvas */}
                <div className="rounded border border-white/[0.08] bg-black/60 aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="w-10 h-10 rounded-full bg-[#00E58F] text-[#0E0D0B] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform cursor-pointer">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="mt-2 text-xs font-mono text-zinc-400">
                    Replay headless browser execution
                  </span>

                  {/* Scrubber Timeline */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-300">01:42 / 01:42</span>
                    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#00E58F] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Diagnostics Strip */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-zinc-400">
                <span>Memory: 182 MB • CPU: 14%</span>
                <span className="text-[#00E58F]">Network Waterfall: 24/24 OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
