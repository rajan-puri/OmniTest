"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function PricingMatrix() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 08/08: CLEAR PRICING
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            Predictable pricing tied to parallel execution minutes.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            No unexpected billing spikes. Choose the worker concurrency and retention window your engineering team requires.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-lg bg-[#161512] border border-white/[0.08] font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-3 py-1.5 rounded transition-colors ${
                !isAnnual ? "bg-[#1D1B17] text-[#F5F3EE] font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                isAnnual ? "bg-[#1D1B17] text-[#00E58F] font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00E58F]/20 text-[#00E58F]">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Column Telemetry Table Comparison (No Fake Ribbons) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan 1: Developer */}
          <div className="rounded-lg bg-[#161512] border border-white/[0.08] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400 font-bold uppercase">DEVELOPER</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">Hobby &amp; OSS</span>
              </div>

              <div>
                <span className="text-4xl font-mono font-bold text-[#F5F3EE]">$0</span>
                <span className="text-xs font-mono text-zinc-500 ml-1">/ month</span>
              </div>

              <p className="text-xs text-[#A29E94]">
                Everything needed to run Playwright, a11y, and API tests on local and personal repos.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.06] font-mono text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>300 monthly execution minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>1 concurrent worker pod</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>7-day artifact &amp; trace retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>CLI &amp; GitHub Actions runner</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup"
              className="w-full py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F3EE] font-mono text-xs font-semibold text-center border border-white/[0.08] transition-colors"
            >
              Start Free Developer
            </Link>
          </div>

          {/* Plan 2: Team Pro (Clear Focus) */}
          <div className="rounded-lg bg-[#1D1B17] border border-[#00E58F]/40 p-6 flex flex-col justify-between space-y-6 shadow-xl relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#00E58F] font-bold uppercase">TEAM PRO</span>
                <span className="px-2 py-0.5 rounded bg-[#00E58F]/15 text-[#00E58F]">Scale-Up</span>
              </div>

              <div>
                <span className="text-4xl font-mono font-bold text-[#F5F3EE]">
                  ${isAnnual ? "39" : "49"}
                </span>
                <span className="text-xs font-mono text-zinc-500 ml-1">/ month</span>
              </div>

              <p className="text-xs text-[#A29E94]">
                For production engineering teams needing parallel CI pipelines and visual regression.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.06] font-mono text-xs text-zinc-200">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span className="font-semibold text-[#F5F3EE]">3,000 monthly execution minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span className="font-semibold text-[#F5F3EE]">5 concurrent worker pods</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>30-day artifact, video, and HAR retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>Automated visual regression diffing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>axe-core accessibility &amp; Lighthouse CWV</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup"
              className="w-full py-2.5 rounded bg-[#00E58F] hover:bg-[#00d680] text-[#0E0D0B] font-mono text-xs font-semibold text-center flex items-center justify-center gap-2 transition-colors"
            >
              <span>Start 14-Day Free Pro Grid</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="rounded-lg bg-[#161512] border border-white/[0.08] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400 font-bold uppercase">ENTERPRISE</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">Custom VPC</span>
              </div>

              <div>
                <span className="text-4xl font-mono font-bold text-[#F5F3EE]">Custom</span>
              </div>

              <p className="text-xs text-[#A29E94]">
                Dedicated cloud clusters, custom VPC runner agents, and enterprise compliance.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/[0.06] font-mono text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>Unlimited concurrency &amp; execution minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>Private VPC / On-Prem runner agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>365-day custom artifact retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>SAML SSO, Okta, and audit log streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E58F] shrink-0" />
                  <span>99.99% uptime SLA &amp; dedicated Slack channel</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup"
              className="w-full py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F3EE] font-mono text-xs font-semibold text-center border border-white/[0.08] transition-colors"
            >
              Contact Engineering Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
