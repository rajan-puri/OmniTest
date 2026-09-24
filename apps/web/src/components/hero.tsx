import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle, Terminal, Sparkles, Shield, Cpu } from "lucide-react";
import { InteractivePreview } from "./interactive-preview";

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-white/[0.06]">
      {/* Subtle top light wash */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>OmniTest Engine v0.1</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Playwright, axe-core &amp; Visual Diffing</span>
          </div>

          {/* Core Positioning Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Unified web testing <br />
            <span className="text-zinc-400">for modern engineering teams.</span>
          </h1>

          {/* Supporting Subheading */}
          <p className="mt-5 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Run browser workflows, API contract assertions, accessibility audits, and pixel-level visual regression in one high-performance testing grid.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              Start Testing Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-4 py-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/[0.08]"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Interactive Spec Preview</span>
            </a>
          </div>

          {/* Trust / Micro-features */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Headless Chromium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Native Playwright specs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Full trace &amp; video artifacts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>WCAG 2.1 AA audits</span>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Preview Hero Widget */}
        <div id="interactive-demo" className="mt-4 max-w-5xl mx-auto">
          <InteractivePreview />
        </div>
      </div>
    </section>
  );
}
