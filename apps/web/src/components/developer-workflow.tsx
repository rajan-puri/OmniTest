import React from "react";
import { Terminal, GitPullRequest, GitBranch, Check, Copy } from "lucide-react";

export function DeveloperWorkflow() {
  const cliCommands = [
    {
      label: "Run entire test suite locally or on cloud grid",
      cmd: "omnitest run",
    },
    {
      label: "Filter execution by tags (e.g. smoke or critical path)",
      cmd: "omnitest run --tags=@smoke,@checkout",
    },
    {
      label: "Execute against an ephemeral branch preview deployment",
      cmd: "omnitest run --url=https://preview-pr-42.acme.store",
    },
    {
      label: "Inspect interactive trace and video in local browser",
      cmd: "omnitest report run_9b1d",
    },
  ];

  return (
    <section id="workflow" className="py-20 relative bg-[#08090C] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-emerald-400 uppercase bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
            Developer Experience
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fits right into your existing terminal and Git loops
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Zero proprietary lock-in. No complex web setup rituals. Run your entire quality suite directly from your CLI or let your CI pipeline do the heavy lifting.
          </p>
        </div>

        {/* Terminal & Workflow Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-5xl mx-auto">
          {/* CLI Terminal Mockup */}
          <div className="lg:col-span-7 rounded-lg surface-card border border-white/[0.08] overflow-hidden">
            {/* Terminal Title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D0F14] border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-zinc-400 ml-2">
                  zsh — ~/projects/acme-store
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">omnitest v0.1</span>
            </div>

            {/* Terminal Output */}
            <div className="p-4 font-mono text-xs bg-[#090A0F] space-y-2 text-zinc-300 overflow-x-auto leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="text-emerald-400">❯</span>
                <span className="text-white font-medium">omnitest run --smoke --parallel=4</span>
              </div>

              <div className="text-zinc-400 pt-0.5">
                <span className="text-cyan-400 font-semibold">[OmniTest]</span> Initializing cloud orchestrator...
              </div>
              <div className="text-zinc-400">
                <span className="text-cyan-400 font-semibold">[OmniTest]</span> Dispatched 12 test suites to 4 workers.
              </div>

              <div className="py-1.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ ui / checkout-flow.spec.ts (Chromium)</span>
                  <span className="text-emerald-400 font-medium">PASSED (1.8s)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ api / order-creation-contract.spec.ts</span>
                  <span className="text-emerald-400 font-medium">PASSED (142ms)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ a11y / wcag-aa-compliance.spec.ts</span>
                  <span className="text-emerald-400 font-medium">PASSED (0 violations)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>✓ perf / lighthouse-core-web-vitals.spec.ts</span>
                  <span className="text-emerald-400 font-medium">PASSED (Score: 98/100)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] text-emerald-400 font-medium flex items-center justify-between text-[11px]">
                <span>Summary: 12 passed in 3.42s</span>
                <span className="text-zinc-500 font-normal">Artifacts stored locally &amp; synced</span>
              </div>
            </div>
          </div>

          {/* CLI Feature Highlights */}
          <div className="lg:col-span-5 space-y-3">
            {cliCommands.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg surface-card border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              >
                <p className="text-xs text-zinc-400 mb-1.5">{item.label}</p>
                <div className="flex items-center justify-between bg-black/50 px-2.5 py-1.5 rounded border border-white/[0.06] font-mono text-xs text-emerald-300">
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
