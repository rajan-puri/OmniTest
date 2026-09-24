"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 relative bg-[#090A0F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-emerald-400 uppercase bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
            Pricing
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            One subscription. Every test.
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            No surprise overages. Pay for the concurrency and execution minutes your team actually needs.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!isAnnual ? "text-white" : "text-zinc-400"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-11 h-6 rounded-full bg-zinc-800 p-0.5 flex items-center transition-colors relative border border-white/[0.1]"
              aria-label="Toggle annual billing discount"
            >
              <div
                className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-zinc-400"}`}>
              Annual
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {/* Card 1: Free Developer */}
          <div className="p-6 rounded-lg surface-card border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Developer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                  Free
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Perfect for hobby projects, open source, and evaluating the platform.
              </p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-white font-mono">$0</span>
                <span className="text-xs text-zinc-400 font-mono ml-1">/ month</span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>300 monthly test execution minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1 concurrent worker slot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>7-day artifact &amp; trace retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Playwright UI &amp; API test runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CLI &amp; GitHub Actions integration</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs transition-colors border border-white/[0.08]"
            >
              Start Free
            </button>
          </div>

          {/* Card 2: Team Pro (Highlighted) */}
          <div className="p-6 rounded-lg surface-card border border-emerald-500/40 relative flex flex-col justify-between shadow-lg shadow-emerald-950/20">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-bold text-[10px] font-mono uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Team Pro</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Scale Fast
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                For fast-shipping teams needing parallel execution and visual regression.
              </p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-white font-mono">
                  ${isAnnual ? "39" : "49"}
                </span>
                <span className="text-xs text-zinc-400 font-mono ml-1">/ month</span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-200 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium text-white">3,000 monthly test minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium text-white">5 concurrent worker slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>30-day artifact, trace &amp; video retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Visual regression diffing (pixelmatch)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Accessibility (axe-core) &amp; Core Web Vitals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority email &amp; Discord support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="p-6 rounded-lg surface-card border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Enterprise</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                  Custom
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-5">
                Dedicated infrastructure, compliance, on-prem VPC agents, and strict SLAs.
              </p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-white font-mono">Custom</span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited concurrency &amp; test minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Self-hosted / VPC private runner agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>90 to 365-day custom artifact retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>SAML / Okta SSO &amp; enterprise audit logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dedicated Slack channel &amp; 99.9% uptime SLA</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs transition-colors border border-white/[0.08]"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
