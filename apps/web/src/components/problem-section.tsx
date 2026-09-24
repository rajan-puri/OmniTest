import React from "react";
import { Layers, AlertTriangle, DollarSign, ArrowDown, Check, X } from "lucide-react";

export function ProblemSection() {
  return (
    <section className="py-24 border-t border-white/[0.06] bg-[#0A0C10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase bg-rose-950/30 px-3 py-1 rounded-full border border-rose-500/20">
            The Status Quo Is Broken
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop stitching together 5 disparate testing tools.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Modern development teams have turned testing into an unmaintainable maze of conflicting dashboards, flaky CI containers, and runaway SaaS subscriptions.
          </p>
        </div>

        {/* 3 Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Tool Sprawl */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Painful Tool Sprawl</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Cypress for UI, Postman for APIs, axe-core for a11y, Lighthouse for Core Web Vitals, Percy for visual diffs. Five tabs, five logins, zero unified visibility on pull requests.
            </p>
          </div>

          {/* Card 2: Opaque Debugging */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Flaky CI &amp; Opaque Logs</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When a test fails in GitHub Actions, you get a cryptic exit code 1 and a truncated 2,000-line terminal dump. No video replay, no interactive DOM trace, no clue what broke.
            </p>
          </div>

          {/* Card 3: Multiplied SaaS Spend */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Compounding SaaS Bills</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Paying $400/mo for Cypress Cloud, $300/mo for Percy, and $200/mo for API runners. You are spending thousands monthly on fractured infrastructure instead of building your product.
            </p>
          </div>
        </div>

        {/* Side-by-side Architectural Comparison */}
        <div className="max-w-4xl mx-auto rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-white/[0.1]">
          <h3 className="text-center text-lg font-mono font-bold text-zinc-200 mb-6">
            The Quality Architecture Shift
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Fractured Way */}
            <div className="space-y-3 p-5 rounded-xl bg-rose-950/10 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                <X className="w-4 h-4" />
                The Fragmented Status Quo
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>5 disjointed configuration files and runtimes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>Flaky CI runs with manual Docker image maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>Scattered reports with zero cross-discipline signals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>Separate bills for Cypress, Percy, Postman &amp; Calibre</span>
                </li>
              </ul>
            </div>

            {/* The OmniTest Way */}
            <div className="space-y-3 p-5 rounded-xl bg-emerald-950/15 border border-emerald-500/25">
              <div className="flex items-center gap-2 text-brand-400 font-mono text-xs font-bold uppercase">
                <Check className="w-4 h-4" />
                The OmniTest Unified Engine
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>1 config file: UI, API, a11y, and CWV orchestrated together</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Managed ephemeral cloud workers with zero host maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Synchronized video, interactive trace, and DOM inspector</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>One single, predictable subscription for your whole team</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
