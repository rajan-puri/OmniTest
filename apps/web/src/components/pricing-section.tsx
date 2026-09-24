"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative bg-[#0A0C10] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-brand-400 uppercase bg-brand-950/40 px-3 py-1 rounded-full border border-brand-500/20">
            Simple, Transparent Pricing
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One subscription. Every test.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            No surprise overages. Pay for the concurrency and execution minutes your team actually needs.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!isAnnual ? "text-white" : "text-zinc-400"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-zinc-800 p-1 flex items-center transition-colors relative border border-white/[0.1]"
              aria-label="Toggle annual billing discount"
            >
              <div
                className={`w-4 h-4 rounded-full bg-brand-500 transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-zinc-400"}`}>
              Annual
              <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Free Developer */}
          <div className="p-8 rounded-2xl glass-panel border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Developer</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                  Free Forever
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Perfect for hobby projects, open source, and evaluating the platform.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                <span className="text-xs text-zinc-400 font-mono ml-1">/ month</span>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>300 monthly test execution minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>1 concurrent worker slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>7-day artifact &amp; trace retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Playwright UI &amp; API test runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>CLI &amp; GitHub Actions integration</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs transition-colors border border-white/[0.08]"
            >
              Start Free
            </button>
          </div>

          {/* Card 2: Team Pro (Highlighted) */}
          <div className="p-8 rounded-2xl glass-panel-elevated border-2 border-brand-500/40 relative flex flex-col justify-between shadow-2xl bg-gradient-to-b from-brand-500/[0.04] to-transparent">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-zinc-950 font-bold text-[10px] font-mono uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Team Pro</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/20">
                  Scale Fast
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                For fast-shipping teams needing parallel execution and visual regression.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">
                  ${isAnnual ? "39" : "49"}
                </span>
                <span className="text-xs text-zinc-400 font-mono ml-1">/ month</span>
              </div>

              <div className="space-y-3 text-xs text-zinc-200 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="font-semibold text-white">3,000 monthly test minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="font-semibold text-white">5 concurrent worker slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>30-day artifact, trace &amp; video retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Visual regression diffing (pixelmatch)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Accessibility (axe-core) &amp; Core Web Vitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Priority email &amp; Discord support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="p-8 rounded-2xl glass-panel border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                  Custom Grid
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Dedicated infrastructure, compliance, on-prem VPC agents, and strict SLAs.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">Custom</span>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Unlimited concurrency &amp; test minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Self-hosted / VPC private runner agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>90 to 365-day custom artifact retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>SAML / Okta SSO &amp; enterprise audit logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Dedicated Slack channel &amp; 99.9% uptime SLA</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs transition-colors border border-white/[0.08]"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
