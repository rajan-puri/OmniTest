import React from "react";
import {
  CheckCircle2,
  Clock,
  Play,
  Share2,
  Download,
  Terminal,
  Activity,
  ChevronRight,
  ShieldCheck,
  Video,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 relative bg-[#090A0F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-cyan-400 uppercase bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20">
            Unified Observability
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            A test dashboard that engineers actually love
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Real-time step streaming, interactive trace scrubbers, synchronized video replays, and cross-suite health analytics in one fast, dark-mode interface.
          </p>
        </div>

        {/* Dashboard Canvas Mockup */}
        <div className="max-w-6xl mx-auto rounded-lg surface-card border border-white/[0.08] overflow-hidden">
          {/* Dashboard Shell Header */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#0D0F14] border-b border-white/[0.08] gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/25 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PASSED #284
              </span>
              <span className="text-xs font-semibold text-white">
                PR #42 — Add Stripe Checkout &amp; Apple Pay
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                4.82s
              </span>
              <span className="text-zinc-600">|</span>
              <span>12 Suites (12 Passed, 0 Failed)</span>
            </div>
          </div>

          {/* Subheader metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] bg-[#0A0C10] border-b border-white/[0.06] text-xs font-mono">
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Execution Grid</span>
              <span className="text-zinc-200 font-medium">4 Workers (Chromium)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Accessibility (axe)</span>
              <span className="text-emerald-400 font-medium">0 Violations (WCAG AA)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Core Web Vitals</span>
              <span className="text-emerald-400 font-medium">LCP 1.1s (98/100)</span>
            </div>
            <div className="p-3 px-5">
              <span className="text-zinc-500 block text-[11px] mb-0.5">Visual Drift</span>
              <span className="text-zinc-200 font-medium">0.00% (Identical)</span>
            </div>
          </div>

          {/* Split View: Test Tree (Left) and Trace / Video Viewer (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] bg-[#08090C]">
            {/* Left: Test Execution Hierarchy */}
            <div className="lg:col-span-5 p-3.5 border-b lg:border-b-0 lg:border-r border-white/[0.08] space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
                Suite Execution Tree
              </div>

              {/* Suite 1 */}
              <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-white">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    e2e / customer-checkout.spec.ts
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">1.82s</span>
                </div>
                <div className="pl-5 space-y-1 font-mono text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>Step 1: goto(/checkout)</span>
                    <span className="text-zinc-500">220ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Step 2: fill(input#card)</span>
                    <span className="text-zinc-500">80ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Step 3: click(button#pay)</span>
                    <span className="text-zinc-500">140ms</span>
                  </div>
                </div>
              </div>

              {/* Suite 2 */}
              <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-medium text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  api / stripe-webhook-handler.spec.ts
                </span>
                <span className="text-[11px] font-mono text-zinc-500">240ms</span>
              </div>

              {/* Suite 3 */}
              <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-medium text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                  a11y / wcag-compliance-checkout.spec.ts
                </span>
                <span className="text-[11px] font-mono text-zinc-500">410ms</span>
              </div>
            </div>

            {/* Right: Embedded Video / Trace Inspector */}
            <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-[#0C0E14]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                  <span className="text-xs font-mono text-zinc-300 flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    Synchronized Video Recording &amp; Interactive Playwright Trace
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.05]"
                    >
                      Download .zip
                    </button>
                  </div>
                </div>

                {/* Mock Video Canvas */}
                <div className="rounded-md border border-white/[0.08] bg-black/60 aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform cursor-pointer">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="mt-2.5 text-xs font-mono text-zinc-400">
                    Click to replay headless browser execution
                  </span>

                  {/* Video Timeline Scrubber */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-300">01:42 / 01:42</span>
                    <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>DOM Snapshot: Complete</span>
                <span className="text-emerald-400">Memory: 182 MB • CPU: 14%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
