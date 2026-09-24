"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../primitives/Container";

export const PrecisionDevWorkflow: React.FC = () => {
  const [ciStatus, setCiStatus] = useState<"pending" | "passed">("pending");

  useEffect(() => {
    const interval = setInterval(() => {
      setCiStatus((prev) => (prev === "pending" ? "passed" : "pending"));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="workflow"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#00E58F] text-[#0E0D0B] border-y border-[#0E0D0B]/20 overflow-hidden"
    >
      <Container>
        {/* Section Header with dark text on mint */}
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-[12px] text-[#0E0D0B]/70 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E0D0B]" />
            <span>DEVELOPER WORKFLOW</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold tracking-tight text-[#0E0D0B] leading-[1.05]">
            Built for the pull request lifecycle.
          </h2>
          <p className="mt-4 text-[18px] text-[#0E0D0B]/80 max-w-2xl leading-relaxed font-medium">
            Run locally in your terminal or gate merges automatically in GitHub Actions.
            Zero manual status syncing.
          </p>
        </div>

        {/* Split Composition: Left Terminal <-> Right GitHub PR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Local Terminal (Dark container for contrast) */}
          <div className="lg:col-span-5 rounded-[6px] border border-[#0E0D0B]/20 bg-[#0E0D0B] text-[#F5F3EE] p-6 font-mono text-[14px] leading-relaxed shadow-lg overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px] text-[#A29E94]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/10" />
                <span className="ml-2 text-[#F5F3EE]">terminal — zsh</span>
              </div>
              <span className="text-[#00E58F]">LOCAL RUNNER</span>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <span className="text-[#00E58F] font-bold">$ </span>
                <span className="text-[#F5F3EE]">git commit -m &quot;feat: checkout&quot;</span>
              </div>
              <div>
                <span className="text-[#00E58F] font-bold">$ </span>
                <span className="text-[#F5F3EE]">git push origin main</span>
              </div>
              <div className="pt-2 text-[#A29E94]">
                <span>-&gt; Initiating cloud verification matrix...</span>
              </div>
              <div>
                <span className="text-[#00E58F] font-bold">$ </span>
                <span className="text-[#38BDF8]">omnitest run --ci --record</span>
              </div>
              <div className="p-3 rounded-[4px] border border-white/[0.08] bg-[#161512] text-[13px] space-y-1">
                <div className="text-[#A29E94]">[grid] 4 browser pods allocated (12ms)</div>
                <div className="text-[#00E58F]">
                  ✓ 142 passed, 0 failed, 0 flaky in 4.8s
                </div>
                <div className="text-[#6B675E] text-[11px]">
                  Artifacts synced: https://omnitest.dev/r/8492
                </div>
              </div>
            </div>
          </div>

          {/* Center Connection Indicator ("push -> checks") */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center font-mono text-[12px] font-bold text-[#0E0D0B] uppercase tracking-wider select-none py-4 lg:py-0">
            <div className="hidden lg:flex items-center gap-2">
              <span className="h-0.5 w-8 bg-[#0E0D0B]" />
              <div className="px-3 py-1.5 rounded-[4px] border border-[#0E0D0B] bg-[#00E58F] text-[#0E0D0B] whitespace-nowrap shadow-sm">
                PUSH → CHECKS
              </div>
              <span className="h-0.5 w-8 bg-[#0E0D0B]" />
            </div>
            <div className="lg:hidden px-3 py-1 rounded-[4px] border border-[#0E0D0B] bg-[#00E58F]">
              ↓ PUSH DISPATCHED ↓
            </div>
          </div>

          {/* Right: GitHub PR Checks Interface */}
          <div className="lg:col-span-5 rounded-[6px] border border-[#0E0D0B]/20 bg-[#0E0D0B] text-[#F5F3EE] p-6 font-mono text-[14px] leading-relaxed shadow-lg overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px]">
              <div className="flex items-center gap-2 text-[#F5F3EE] font-bold">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>github.com/acme/web — PR #418</span>
              </div>
              <span className={`text-[11px] font-bold ${ciStatus === "passed" ? "text-[#00E58F]" : "text-[#F59E0B]"}`}>
                {ciStatus === "passed" ? "ALL CHECKS PASSED" : "CHECKS IN PROGRESS"}
              </span>
            </div>

            <div className="pt-4 space-y-3 font-mono text-[13px]">
              {[
                { name: "omnitest/e2e", desc: "142/142 tests passed (4.2s)" },
                { name: "omnitest/visual", desc: "0 visual regressions detected" },
                { name: "omnitest/a11y", desc: "0 WCAG 2.2 violations" },
                { name: "omnitest/vitals", desc: "Lighthouse performance 98/100" },
              ].map((check) => (
                <div
                  key={check.name}
                  className="flex items-center justify-between p-2.5 rounded-[4px] border border-white/[0.06] bg-[#161512]"
                >
                  <div className="flex items-center gap-2.5">
                    {ciStatus === "passed" ? (
                      <span className="w-4 h-4 rounded-full bg-[#00E58F]/10 border border-[#00E58F] text-[#00E58F] flex items-center justify-center text-[10px] font-bold animate-pass-tick">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin inline-block" />
                    )}
                    <span className="text-[#F5F3EE] font-medium">{check.name}</span>
                  </div>
                  <span className="text-[12px] text-[#A29E94]">{check.desc}</span>
                </div>
              ))}

              <div className="mt-4 p-3 rounded-[4px] bg-[#12110E] border border-white/[0.08] text-[12px] flex items-center justify-between">
                <span className="text-[#A29E94]">omnitest-bot: Status check approved</span>
                <span className="text-[#00E58F] font-bold">READY TO MERGE</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
