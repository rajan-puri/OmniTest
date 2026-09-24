import React from "react";
import { Layers, AlertTriangle, DollarSign, ArrowDown, Check, X } from "lucide-react";

export function ProblemSection() {
  return (
    <section className="py-20 border-t border-white/[0.08] bg-[#090A0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-rose-400 uppercase bg-rose-950/40 px-2.5 py-1 rounded border border-rose-500/20">
            The Status Quo
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Stop stitching together 5 disparate testing tools
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Modern development teams have turned testing into a fragmented maze of conflicting dashboards, flaky CI containers, and runaway SaaS subscriptions.
          </p>
        </div>

        {/* 3 Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* Card 1: Tool Sprawl */}
          <div className="p-5 rounded-lg surface-card border border-white/[0.08]">
            <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Painful Tool Sprawl</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cypress for UI, Postman for APIs, axe-core for a11y, Lighthouse for Core Web Vitals, Percy for visual diffs. Five tabs, five logins, zero unified PR visibility.
            </p>
          </div>

          {/* Card 2: Opaque Debugging */}
          <div className="p-5 rounded-lg surface-card border border-white/[0.08]">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Flaky CI &amp; Opaque Logs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When a test fails in GitHub Actions, you get a cryptic exit code 1 and a truncated 2,000-line terminal dump. No video replay, no interactive DOM trace, no root cause.
            </p>
          </div>

          {/* Card 3: Multiplied SaaS Spend */}
          <div className="p-5 rounded-lg surface-card border border-white/[0.08]">
            <div className="w-8 h-8 rounded bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">Compounding SaaS Bills</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paying $400/mo for Cypress Cloud, $300/mo for Percy, and $200/mo for API runners. Spending thousands monthly on fractured infrastructure instead of product.
            </p>
          </div>
        </div>

        {/* Side-by-side Architectural Comparison */}
        <div className="max-w-4xl mx-auto rounded-lg surface-card p-6 border border-white/[0.08]">
          <h3 className="text-center text-sm font-mono font-semibold text-zinc-300 mb-6 uppercase tracking-wider">
            Architecture Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* The Old Fractured Way */}
            <div className="space-y-3 p-4 rounded-md bg-rose-950/15 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase">
                <X className="w-3.5 h-3.5" />
                Fragmented Status Quo
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>5 disjointed configuration files and runtimes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Flaky CI runs with manual Docker maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Scattered reports with zero cross-discipline signals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Separate bills for Cypress, Percy, Postman &amp; Calibre</span>
                </li>
              </ul>
            </div>

            {/* The OmniTest Way */}
            <div className="space-y-3 p-4 rounded-md bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase">
                <Check className="w-3.5 h-3.5" />
                OmniTest Unified Engine
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>1 config file: UI, API, a11y, and CWV orchestrated together</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>Managed ephemeral cloud workers with zero host maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>Synchronized video, interactive trace, and DOM inspector</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>One single, predictable subscription for your entire team</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
