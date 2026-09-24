import React from "react";
import { Terminal, GitPullRequest, GitBranch, Check, Copy } from "lucide-react";

export function DeveloperWorkflow() {
  const cliCommands = [
    {
      label: "Run entire test suite locally or on cloud grid",
      cmd: "npx omnitest run",
    },
    {
      label: "Filter execution by tags (e.g. smoke or critical path)",
      cmd: "npx omnitest run --tags=@smoke,@checkout",
    },
    {
      label: "Execute against an ephemeral branch preview deployment",
      cmd: "npx omnitest run --url=https://preview-pr-42.acme.store",
    },
    {
      label: "Inspect interactive trace and video in local browser",
      cmd: "npx omnitest show-trace ./artifacts/run_9b1d.zip",
    },
  ];

  return (
    <section id="workflow" className="py-24 relative bg-[#08090C] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
            Developer Experience First
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Fits right into your existing terminal and Git loops.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Zero proprietary lock-in. No complex web setup rituals. Run your entire quality suite directly from your CLI or let your CI pipeline do the heavy lifting.
          </p>
        </div>

        {/* Terminal & Workflow Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* CLI Terminal Mockup */}
          <div className="lg:col-span-7 rounded-2xl glass-panel-elevated border border-white/[0.1] overflow-hidden shadow-2xl">
            {/* Terminal Title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0D0F14] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-zinc-400 font-medium ml-2">
                  zsh — ~/projects/acme-store
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">@omnitest/cli v0.1</span>
            </div>

            {/* Terminal Output */}
            <div className="p-5 font-mono text-xs bg-[#090B0E] space-y-2.5 text-zinc-300 overflow-x-auto leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="text-brand-400">❯</span>
                <span className="text-white font-bold">npx omnitest run --tags=@smoke --parallel=4</span>
              </div>

              <div className="text-zinc-400 pt-1">
                <span className="text-cyan-400 font-bold">[OmniTest]</span> Initializing cloud runner orchestrator...
              </div>
              <div className="text-zinc-400">
                <span className="text-cyan-400 font-bold">[OmniTest]</span> Dispatched 12 test suites to 4 ephemeral workers.
              </div>

              <div className="py-2 space-y-1">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ ui / checkout-flow.spec.ts (Chromium)</span>
                  <span className="text-emerald-400 font-bold">PASSED (1.8s)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ api / order-creation-contract.spec.ts</span>
                  <span className="text-emerald-400 font-bold">PASSED (142ms)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ a11y / wcag-aa-compliance.spec.ts</span>
                  <span className="text-emerald-400 font-bold">PASSED (0 violations)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ perf / lighthouse-core-web-vitals.spec.ts</span>
                  <span className="text-emerald-400 font-bold">PASSED (Score: 98/100)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] text-emerald-400 font-bold flex items-center justify-between">
                <span>Summary: 12 passed in 3.42s</span>
                <span className="text-zinc-500 font-normal">Artifacts: s3://omnitest-artifacts/...</span>
              </div>
            </div>
          </div>

          {/* CLI Feature Highlights */}
          <div className="lg:col-span-5 space-y-4">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-panel border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              >
                <p className="text-xs text-zinc-400 mb-1.5">{item.label}</p>
                <div className="flex items-center justify-between bg-black/50 px-3 py-2 rounded-lg border border-white/[0.06] font-mono text-xs text-brand-300">
                  <code>{item.cmd}</code>
                  <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
