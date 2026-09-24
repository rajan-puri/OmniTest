"use client";

import React, { useState } from "react";
import { X, Check, ArrowRight, Layers, Cpu, GitCommit } from "lucide-react";

export function ProblemCollapseSection() {
  const [activeTab, setActiveTab] = useState<"fractured" | "unified">("fractured");

  const fracturedSilos = [
    {
      name: "Cypress / Playwright manual scripts",
      scope: "UI E2E",
      cost: "$400/mo",
      issue: "Flaky CI timeouts & Docker maintenance",
    },
    {
      name: "Postman / Newman collections",
      scope: "API Testing",
      cost: "$200/mo",
      issue: "Separate runner, zero PR branch context",
    },
    {
      name: "Percy / Chromatic",
      scope: "Visual Diff",
      cost: "$350/mo",
      issue: "Second billing account, duplicate browser runs",
    },
    {
      name: "axe-cli / manual a11y tests",
      scope: "Accessibility",
      cost: "Manual QA",
      issue: "Ignored until production audits fail",
    },
    {
      name: "Google Lighthouse CI",
      scope: "Performance",
      cost: "$120/mo",
      issue: "Volatile scores without controlled grid CPU",
    },
  ];

  return (
    <section
      id="problem"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            STEP 02/08: TOOL CONVERGENCE
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            Stop stitching five disjointed testing tools into fragile CI scripts.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            Modern QA has become an unmaintainable sprawl of fractured SaaS accounts, conflicting container versions, and blind PR gates.
          </p>
        </div>

        {/* Interactive Before/After Stream (NO CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Left Side: The 5 Fragmented Silos */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-mono">
              <span className="text-[#F43F5E] font-semibold flex items-center gap-1.5">
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                THE FRAGMENTED STATUS QUO
              </span>
              <span className="text-[#6B675E]">5 tools • 5 logins • $1,070+/mo</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {fracturedSilos.map((silo, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded bg-[#161512] border border-white/[0.06] hover:border-white/[0.14] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#F5F3EE] font-semibold">{silo.name}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                      {silo.scope}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A29E94]">
                    <span>{silo.issue}</span>
                    <span className="text-[#F43F5E] font-semibold">{silo.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Connector: Arrow / Convergence Stream */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#1D1B17] border border-[#00E58F]/30 flex items-center justify-center text-[#00E58F]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Right Side: The Single OmniTest Engine */}
          <div className="lg:col-span-5 rounded-lg bg-[#161512] border border-[#00E58F]/30 p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-mono">
              <span className="text-[#00E58F] font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                OMNITEST UNIFIED PIPELINE
              </span>
              <span className="text-[#00E58F]">1 config • 1 CLI</span>
            </div>

            {/* Code Block of Unified omnitest.config.ts */}
            <div className="p-4 rounded bg-[#0E0D0B] border border-white/[0.06] font-mono text-xs text-[#F5F3EE] leading-relaxed overflow-x-auto">
              <div className="text-[#6B675E] mb-2">// omnitest.config.ts</div>
              <div>
                <span className="text-[#38BDF8]">export default</span>{" "}
                <span className="text-[#F5F3EE]">defineConfig(&#123;</span>
              </div>
              <div className="pl-4 text-[#A29E94]">
                project: <span className="text-[#00E58F]">&apos;web-storefront&apos;</span>,
              </div>
              <div className="pl-4 text-[#A29E94]">
                engines: [
                <span className="text-[#00E58F]">&apos;browser&apos;</span>,{" "}
                <span className="text-[#00E58F]">&apos;api&apos;</span>,{" "}
                <span className="text-[#00E58F]">&apos;a11y&apos;</span>,{" "}
                <span className="text-[#00E58F]">&apos;visual&apos;</span>,{" "}
                <span className="text-[#00E58F]">&apos;cwv&apos;</span>
                ],
              </div>
              <div className="pl-4 text-[#A29E94]">
                concurrency: <span className="text-[#F59E0B]">4</span>,
              </div>
              <div className="pl-4 text-[#A29E94]">
                artifacts: &#123; trace: <span className="text-[#38BDF8]">true</span>, video:{" "}
                <span className="text-[#38BDF8]">true</span> &#125;,
              </div>
              <div>&#125;);</div>
            </div>

            {/* Operational Impact Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06] font-mono text-xs">
              <div>
                <span className="text-[#6B675E] block text-[11px]">CI Pipeline Speed</span>
                <span className="text-[#00E58F] font-bold text-sm">3.4x Faster</span>
                <span className="text-[#6B675E] block text-[10px]">Zero redundant boots</span>
              </div>
              <div>
                <span className="text-[#6B675E] block text-[11px]">Tool Consolidation</span>
                <span className="text-[#F5F3EE] font-bold text-sm">5 → 1 Platform</span>
                <span className="text-[#6B675E] block text-[10px]">Single monthly bill</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
