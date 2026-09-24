import React from "react";
import { GitPullRequest, CheckCircle2, ExternalLink, ShieldCheck, Terminal } from "lucide-react";

export function GithubCiSection() {
  return (
    <section className="py-20 relative bg-[#08090C] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-violet-400 uppercase bg-violet-950/40 px-2.5 py-1 rounded border border-violet-500/20">
            Turnkey CI/CD
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Quality gates embedded directly in your Pull Requests
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Install the OmniTest GitHub App in two clicks. Get granular check runs and rich PR summary comments that make code review 10x faster.
          </p>
        </div>

        {/* GitHub Pull Request Mockup Card */}
        <div className="max-w-4xl mx-auto rounded-lg surface-card border border-white/[0.08] overflow-hidden">
          {/* GitHub PR Header */}
          <div className="p-4 bg-[#0D0F14] border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
              <span>acme-inc / web-storefront</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">Pull Request #42</span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              feat: Implement 1-click Express Checkout with Apple Pay
            </h3>
          </div>

          {/* GitHub Check Runs Block */}
          <div className="p-5 bg-[#090A0F] space-y-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
              GitHub Check Runs (4 checks passed)
            </div>

            <div className="space-y-2">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / UI &amp; Workflows</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      12 browser tests passed across Chromium &amp; WebKit
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / Accessibility (WCAG 2.1 AA)</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      0 critical or serious violations detected
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / Core Web Vitals</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      Score: 98/100 (LCP 1.1s, CLS 0.002)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Simulated Bot Comment */}
            <div className="mt-4 p-3.5 rounded-md bg-black/40 border border-white/[0.06] font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-white/[0.06] text-zinc-400">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[10px]">
                  bot
                </span>
                <span className="font-medium text-zinc-200">omnitest-bot</span> commented 2 minutes ago
              </div>
              <p className="text-zinc-300 font-medium mb-1.5">
                OmniTest Run #284 Complete: <span className="text-emerald-400">ALL GREEN</span>
              </p>
              <div className="space-y-1 text-zinc-400 text-[11px]">
                <p>• Total Duration: 4.82s (Parallelism: 4 workers)</p>
                <p>• Traces &amp; Videos: <span className="text-cyan-400 underline cursor-pointer">View interactive trace</span></p>
                <p>• Performance Budget: Passed (No CWV regressions vs. base branch)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
