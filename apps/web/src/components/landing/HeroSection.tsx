"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  Check,
  Copy,
  MousePointer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [cursorPhase, setCursorPhase] = useState<"moving" | "targeting" | "clicked">("moving");

  const copyCommand = () => {
    navigator.clipboard.writeText("npm i -g omnitest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Automated cursor cycle simulating live test selector execution
  useEffect(() => {
    const cycle = () => {
      setCursorPhase("moving");
      const t1 = setTimeout(() => {
        setCursorPhase("targeting");
      }, 1200);
      const t2 = setTimeout(() => {
        setCursorPhase("clicked");
      }, 2600);
      const t3 = setTimeout(() => {
        setCursorPhase("moving");
      }, 4800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };

    const interval = setInterval(cycle, 5200);
    const initialCleanup = cycle();

    return () => {
      clearInterval(interval);
      initialCleanup();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Top Telemetry Tag */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 01/08: CONNECT &amp; TARGET
          </span>
          <span className="text-xs font-mono text-[#A29E94]">
            Playwright v1.48 • axe-core v4.10 • Pixelmatch v7.1
          </span>
        </div>

        {/* Asymmetric Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (Headline + Actions) */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-[#F5F3EE]">
              The headless testing grid that catches regressions before Git merges.
            </h1>

            <p className="text-base sm:text-lg text-[#A29E94] leading-relaxed max-w-xl">
              Run Playwright browser tests, pixel-level visual diffs, axe accessibility, and API contracts from one CLI. Parallel cloud workers with instant DOM traces and synchronized video.
            </p>

            {/* Actions: Primary CTA + Terminal Install Snippet */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
              <Link
                href="/signup"
                className="px-5 py-3 rounded bg-[#00E58F] hover:bg-[#00d680] text-[#0E0D0B] font-semibold flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.98]"
              >
                <span>Run 14-Day Free Grid</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              {/* One-Click Copy Install Command */}
              <div
                onClick={copyCommand}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && copyCommand()}
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded bg-[#161512] border border-white/[0.1] text-zinc-300 cursor-pointer hover:border-white/[0.2] transition-colors"
                title="Click to copy CLI command"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#00E58F]">$</span>
                  <span className="text-[#F5F3EE]">npm i -g omnitest</span>
                </div>
                <span className="text-zinc-500 hover:text-white pl-2">
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#00E58F]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </span>
              </div>
            </div>

            {/* Restrained Telemetry Strip */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[11px]">Worker Boot</span>
                <span className="text-[#ECEAE5] font-semibold">&lt; 180ms</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Flake Isolation</span>
                <span className="text-[#ECEAE5] font-semibold">Strict Pod Sandboxing</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Artifacts Captured</span>
                <span className="text-[#00F090] font-semibold">Trace + Video + HAR</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mock Browser Sandbox with Automated Selector Cursor */}
          <div className="lg:col-span-6 rounded-lg bg-[#151411] border border-white/[0.1] overflow-hidden shadow-2xl relative">
            {/* Mock Browser Shell Chrome */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#1B1914] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-[11px] font-mono text-zinc-300">
                  <span className="text-[#00F090]">https://</span>
                  <span>staging.acmestore.dev/checkout</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span className="px-1.5 py-0.5 rounded bg-[#00F090]/15 text-[#00F090] font-bold">
                  200 OK
                </span>
                <span className="hidden sm:inline">Chromium Headless</span>
              </div>
            </div>

            {/* Live Interactive Page Canvas */}
            <div className="p-5 bg-[#0F0E0B] relative min-h-[340px] select-none">
              {/* App UI Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#00F090] text-[#0E0D0B] font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <span className="text-xs font-semibold text-white">Acme Hardware Checkout</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">$340.00 USD</span>
              </div>

              {/* Cart Items list */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-zinc-300">Ergonomic Developer Keyboard</span>
                  <span className="font-mono text-zinc-400">$210.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-zinc-300">Precision USB-C Cable (2m)</span>
                  <span className="font-mono text-zinc-400">$30.00</span>
                </div>
              </div>

              {/* Target Complete Order Button with active Selector Box */}
              <div className="relative mt-6 pt-2">
                <div
                  id="checkout-action-box"
                  className={`p-3 rounded-md transition-all duration-300 ${
                    cursorPhase === "targeting" || cursorPhase === "clicked"
                      ? "ring-2 ring-[#00F090] bg-[#00F090]/10"
                      : "border border-white/[0.06] bg-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-zinc-400 font-mono">Payment: Visa ending 4242</span>
                    <span className="text-[#00F090] text-[11px] font-mono">Verified</span>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      cursorPhase === "clicked"
                        ? "bg-[#00F090] text-[#0E0D0B] scale-[0.98]"
                        : "bg-white text-zinc-950 hover:bg-zinc-200"
                    }`}
                  >
                    <span>Complete Order ($340.00)</span>
                    {cursorPhase === "clicked" && (
                      <Check className="w-3.5 h-3.5 stroke-[3] animate-pass-tick" />
                    )}
                  </button>
                </div>

                {/* Simulated Floating Selector Tag */}
                {(cursorPhase === "targeting" || cursorPhase === "clicked") && (
                  <div className="absolute -top-3.5 left-2 px-2 py-0.5 rounded bg-[#00F090] text-[#0E0D0B] font-mono text-[10px] font-bold shadow-md flex items-center gap-1 z-20 animate-pass-tick">
                    <span>locator: page.getByRole(&apos;button&apos;, &#123; name: &apos;Complete Order&apos; &#125;)</span>
                  </div>
                )}

                {/* Animated Virtual Cursor */}
                <div
                  className={`absolute pointer-events-none transition-all duration-700 ease-out z-30 ${
                    cursorPhase === "moving"
                      ? "top-[-20px] left-[75%] opacity-40 scale-90"
                      : cursorPhase === "targeting"
                      ? "top-[38px] left-[52%] opacity-100 scale-100"
                      : "top-[38px] left-[52%] opacity-100 scale-90"
                  }`}
                >
                  <div className="relative">
                    <MousePointer className="w-5 h-5 text-[#00F090] fill-[#00F090] drop-shadow-md" />
                    {cursorPhase === "clicked" && (
                      <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full border-2 border-[#00F090] animate-ping pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Live Code Telemetry Bar */}
            <div className="p-3 bg-[#11100C] border-t border-white/[0.08] font-mono text-[11px] text-zinc-400 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#00F090]">EXEC:</span>
                <span className="text-zinc-200 truncate">
                  await page.getByRole(&apos;button&apos;, &#123; name: &apos;Complete Order&apos; &#125;).click();
                </span>
              </div>
              <span className="text-[#00F090] font-semibold shrink-0 pl-2">
                {cursorPhase === "clicked" ? "✓ 124ms" : "TARGETING"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
