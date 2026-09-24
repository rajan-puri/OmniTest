"use client";

import React, { useState } from "react";
import { Terminal, GitPullRequest, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";

export function WorkflowCiSection() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const cliSnippets = [
    { label: "Run smoke suite across 4 workers", cmd: "omnitest run --smoke --parallel=4" },
    { label: "Run against preview deploy branch", cmd: "omnitest run --url=https://preview-pr-42.dev" },
    { label: "Open interactive forensic trace", cmd: "omnitest report run_9b1deb4d" },
  ];

  return (
    <section
      id="workflow"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 06/08: LOCAL LOOP &amp; PR GATES
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            Fits right into your terminal and GitHub Pull Requests.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            Run the entire test suite locally before pushing. When you open a PR, the OmniTest GitHub App runs parallel checks and comments with deep forensic traces.
          </p>
        </div>

        {/* Side-by-Side: Local CLI (Left) & GitHub PR Check Runs (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Local Terminal CLI */}
          <div className="lg:col-span-6 rounded-lg bg-[#161512] border border-white/[0.1] flex flex-col justify-between overflow-hidden">
            <div>
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1D1B17] border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-xs text-zinc-400 ml-2">
                    zsh — ~/work/storefront
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">omnitest v0.1.0</span>
              </div>

              {/* Terminal Body */}
              <div className="p-4 font-mono text-xs space-y-2.5 bg-[#0E0D0B] text-zinc-300 leading-relaxed overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[#00E58F]">❯</span>
                  <span className="text-[#F5F3EE] font-bold">omnitest run --smoke --parallel=4</span>
                </div>

                <div className="text-zinc-500 text-[11px]">
                  [Orchestrator] Booted 4 worker pods in 142ms.
                </div>

                <div className="py-1 space-y-1 text-[11px]">
                  <div className="flex justify-between text-[#F5F3EE]">
                    <span>✓ ui / checkout.spec.ts</span>
                    <span className="text-[#00E58F]">PASSED (1.4s)</span>
                  </div>
                  <div className="flex justify-between text-[#F5F3EE]">
                    <span>✓ api / checkout-contract.spec.ts</span>
                    <span className="text-[#00E58F]">PASSED (110ms)</span>
                  </div>
                  <div className="flex justify-between text-[#F5F3EE]">
                    <span>✓ a11y / wcag-aa.spec.ts</span>
                    <span className="text-[#00E58F]">PASSED (0 violations)</span>
                  </div>
                  <div className="flex justify-between text-[#F5F3EE]">
                    <span>✓ visual / modal-diff.spec.ts</span>
                    <span className="text-[#00E58F]">PASSED (0.00% drift)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex justify-between text-[#00E58F] font-semibold text-[11px]">
                  <span>12 passed in 1.82s</span>
                  <span className="text-zinc-500 font-normal">Exit code 0</span>
                </div>
              </div>
            </div>

            {/* Quick Copy Snippets */}
            <div className="p-3 bg-[#13120E] border-t border-white/[0.06] space-y-2">
              {cliSnippets.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => copy(item.cmd)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && copy(item.cmd)}
                  className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/[0.04] hover:border-white/[0.14] font-mono text-[11px] text-zinc-300 cursor-pointer transition-colors"
                >
                  <span className="truncate">{item.cmd}</span>
                  <span className="text-zinc-500 hover:text-white pl-2">
                    {copiedCmd === item.cmd ? (
                      <Check className="w-3.5 h-3.5 text-[#00E58F]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simulated GitHub PR Check Runs */}
          <div className="lg:col-span-6 rounded-lg bg-[#161512] border border-white/[0.1] p-5 flex flex-col justify-between overflow-hidden">
            <div>
              {/* PR Header */}
              <div className="pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 mb-1.5">
                  <GitPullRequest className="w-3.5 h-3.5 text-[#00E58F]" />
                  <span>acme-inc / web-storefront</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-[#F5F3EE]">PR #84</span>
                </div>
                <h3 className="text-sm font-semibold text-[#F5F3EE]">
                  feat(checkout): add Apple Pay button &amp; 1-click order fulfillment
                </h3>
              </div>

              {/* GitHub Checks List */}
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                  All 4 checks passed
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E58F]" />
                    <span className="text-[#F5F3EE]">OmniTest / Browser Workflows</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">12/12 passed (Chromium, WebKit)</span>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E58F]" />
                    <span className="text-[#F5F3EE]">OmniTest / Visual Drift</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">0.00% drift (Pixelmatch)</span>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E58F]" />
                    <span className="text-[#F5F3EE]">OmniTest / Accessibility</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">0 violations (WCAG 2.1 AA)</span>
                </div>
              </div>

              {/* PR Bot Comment */}
              <div className="mt-4 p-3 rounded bg-black/50 border border-white/[0.06] font-mono text-[11px]">
                <div className="flex items-center gap-2 pb-1.5 mb-2 border-b border-white/[0.06] text-zinc-400">
                  <span className="px-1.5 py-0.2 rounded bg-[#00E58F]/20 text-[#00E58F] font-bold text-[10px]">
                    bot
                  </span>
                  <span className="text-[#F5F3EE]">omnitest-bot</span> commented 1 minute ago
                </div>
                <p className="text-[#00E58F] font-semibold mb-1">
                  ✓ Run #482 passed in 1.82s
                </p>
                <p className="text-zinc-400">
                  Artifacts synced: 1 trace (.zip), 1 video (.webm), 24 HAR logs captured.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>GitHub App Integration</span>
              <span className="text-[#00E58F]">Automatic PR Quality Gate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
