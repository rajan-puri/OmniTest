"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, ArrowRight, Check, Copy } from "lucide-react";

export function AssertionCtaFooter() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx omnitest init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Final Terminal Assertion CTA */}
      <section
        id="assertion"
        className="relative py-28 bg-[#12110E] border-b border-white/[0.08]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1D1B17] border border-[#00E58F]/30 text-xs font-mono text-[#00E58F]">
            <Terminal className="w-3.5 h-3.5" />
            <span>FINAL ASSERTION PASSING</span>
          </div>

          <div className="p-4 sm:p-6 rounded-lg bg-[#0E0D0B] border border-white/[0.1] font-mono text-sm sm:text-base text-[#F5F3EE] max-w-2xl mx-auto text-left shadow-2xl space-y-2">
            <div className="text-zinc-500 text-xs">// verify release readiness</div>
            <div>
              <span className="text-[#38BDF8]">expect</span>
              <span>(productionBuild.regressions).</span>
              <span className="text-[#00E58F]">toBe</span>(0);
            </div>
            <div>
              <span className="text-[#38BDF8]">assert</span>
              <span>(team.isProductionReady).</span>
              <span className="text-[#00E58F]">toBe</span>(
              <span className="text-[#00E58F]">true</span>);
            </div>
            <div className="pt-2 text-xs text-[#00E58F] font-semibold border-t border-white/[0.06] flex justify-between">
              <span>✓ 8/8 PIPELINE STEPS PASSED</span>
              <span className="text-zinc-400 font-normal">Ready to ship</span>
            </div>
          </div>

          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.035em] text-[#F5F3EE]">
            Start running tests in two minutes.
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#00E58F] hover:bg-[#00d680] text-[#0E0D0B] font-semibold flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.98]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div
              onClick={copyCommand}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && copyCommand()}
              className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 rounded bg-[#1D1B17] border border-white/[0.1] text-zinc-300 cursor-pointer hover:border-white/[0.2] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#00E58F]">$</span>
                <span className="text-[#F5F3EE]">npx omnitest init</span>
              </div>
              <span className="text-zinc-500 pl-2">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#00E58F]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Developer Footer */}
      <footer className="bg-[#0A0907] text-zinc-500 font-mono text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Brand Col */}
            <div className="col-span-2 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <div className="w-6 h-6 rounded bg-[#1D1B17] border border-white/[0.1] flex items-center justify-center text-[#00E58F]">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <span>OmniTest</span>
              </div>
              <p className="text-xs text-[#A29E94] max-w-sm font-sans leading-relaxed">
                The unified test orchestration platform for modern software teams. One platform. Every test.
              </p>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F] animate-pulse" />
                <span>All Grid Workers Operational (99.98% uptime)</span>
              </div>
            </div>

            {/* Column 1 */}
            <div>
              <h4 className="font-semibold text-zinc-300 mb-3 text-[11px] uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#pipeline" className="hover:text-white transition-colors">
                    Parallel Workers
                  </a>
                </li>
                <li>
                  <a href="#visual-diff" className="hover:text-white transition-colors">
                    Visual Regression
                  </a>
                </li>
                <li>
                  <a href="#quality-fleet" className="hover:text-white transition-colors">
                    Axe Accessibility
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-white transition-colors">
                    CLI &amp; GitHub PR
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-zinc-300 mb-3 text-[11px] uppercase tracking-wider">
                Engines
              </h4>
              <ul className="space-y-2 text-xs">
                <li>Playwright Core</li>
                <li>Pixelmatch 7.1</li>
                <li>Google Lighthouse</li>
                <li>axe-core WCAG</li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-zinc-300 mb-3 text-[11px] uppercase tracking-wider">
                Developers
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing Plans
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} OmniTest, Inc. All rights reserved.</p>
            <p>One platform. Every test.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
