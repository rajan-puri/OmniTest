import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle, Terminal, Sparkles, Shield, Cpu } from "lucide-react";
import { InteractivePreview } from "./interactive-preview";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-zinc-300 mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span>Next-Gen Quality Orchestration</span>
            <span className="text-zinc-600">|</span>
            <span className="text-brand-400 font-medium">Powered by Playwright &amp; axe</span>
          </div>

          {/* Core Positioning Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            One platform. <br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Every test.
            </span>
          </h1>

          {/* Supporting Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Orchestrate browser workflows, API contracts, accessibility audits, and Core Web Vitals under a single unified cloud grid. Eliminate 5 disjointed testing SaaS bills.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-base transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center justify-center gap-2 group"
            >
              Start Testing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-white/[0.08] text-white font-semibold text-base transition-colors flex items-center justify-center gap-2 border border-white/[0.1]"
            >
              <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
              View Demo
            </a>
          </div>

          {/* Trust / Micro-features */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>Zero-config cloud runners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Native Playwright specs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
              <span>Full trace &amp; video capture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WCAG 2.1 AA audits</span>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Preview Hero Widget */}
        <div id="interactive-demo" className="mt-6 max-w-5xl mx-auto">
          <InteractivePreview />
        </div>
      </div>
    </section>
  );
}
