import React from "react";
import { GitPullRequest, CheckCircle2, ExternalLink, ShieldCheck, Terminal } from "lucide-react";

export function GithubCiSection() {
  return (
    <section className="py-24 relative bg-[#08090C] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-violet-400 uppercase bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20">
            Turnkey CI/CD
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Quality gates embedded directly in your Pull Requests.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Install the OmniTest GitHub App in two clicks. Get granular check runs and rich PR summary comments that make code review 10x faster.
          </p>
        </div>

        {/* GitHub Pull Request Mockup Card */}
        <div className="max-w-4xl mx-auto rounded-2xl glass-panel-elevated border border-white/[0.1] overflow-hidden shadow-2xl">
          {/* GitHub PR Header */}
          <div className="p-5 bg-[#0D0F14] border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
              <GitPullRequest className="w-4 h-4 text-brand-400" />
              <span>acme-inc / web-storefront</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">Pull Request #42</span>
            </div>
            <h3 className="text-base font-bold text-white">
              feat: Implement 1-click Express Checkout with Apple Pay
            </h3>
          </div>

          {/* GitHub Check Runs Block */}
          <div className="p-6 bg-[#0A0C10] space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              GitHub Check Runs (4 checks passed)
            </div>

            <div className="space-y-2">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / UI &amp; Workflows</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      12 browser tests passed across Chromium &amp; WebKit
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-brand-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / Accessibility (WCAG 2.1 AA)</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      0 critical or serious violations detected
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-brand-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">OmniTest / Core Web Vitals</span>
                    <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                      Score: 98/100 (LCP 1.1s, CLS 0.002)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-brand-400 hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Simulated Bot Comment */}
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/[0.06] text-zinc-400">
                <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold text-[10px]">
                  bot
                </span>
                <span className="font-semibold text-zinc-200">omnitest-bot</span> commented 2 minutes ago
              </div>
              <p className="text-zinc-300 font-semibold mb-2">
                🚀 OmniTest Run #284 Complete: <span className="text-emerald-400">ALL GREEN</span>
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
