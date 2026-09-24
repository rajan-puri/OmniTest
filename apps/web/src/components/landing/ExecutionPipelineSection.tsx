"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, Video, FileText, Cpu, Terminal, ArrowRight } from "lucide-react";

export function ExecutionPipelineSection() {
  const [activePhase, setActivePhase] = useState<0 | 1 | 2>(1);

  const phases = [
    {
      num: "PHASE 01",
      title: "Author with zero proprietary lock-in",
      desc: "Write native Playwright specs in TypeScript, or record actions with our low-code recorder. No custom runtime wrappers or closed formats.",
      tag: "TYPESCRIPT & PLAYWRIGHT",
    },
    {
      num: "PHASE 02",
      title: "Parallel execution across headless worker pods",
      desc: "Tests are dispatched across stateless Chromium, Firefox, and WebKit cloud pods with sub-180ms cold boots and zero cross-test state leakage.",
      tag: "CONCURRENCY & BULLMQ",
    },
    {
      num: "PHASE 03",
      title: "Instant forensic artifacts on failure",
      desc: "Every step captures interactive Playwright DOM traces, synchronized WebM video, console dumps, and network HAR waterfalls automatically.",
      tag: "S3 TRACES & HAR WATERFALL",
    },
  ];

  return (
    <section
      id="pipeline"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 03/08: EXECUTION WATERFALL
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            From local commit to forensic evidence in seconds.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            A 3-phase automated test execution pipeline built for zero-flakiness and immediate root-cause clarity.
          </p>
        </div>

        {/* Phase Selectors Bar (Tabs on mobile, timeline on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {phases.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhase(idx as 0 | 1 | 2)}
              className={`p-4 rounded-lg text-left transition-all font-mono border ${
                activePhase === idx
                  ? "bg-[#1D1B17] border-[#00E58F]/40 text-[#F5F3EE]"
                  : "bg-[#161512] border-white/[0.06] text-[#A29E94] hover:border-white/[0.14]"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={activePhase === idx ? "text-[#00E58F]" : "text-[#6B675E]"}>
                  {p.num}
                </span>
                <span className="text-[10px] text-[#6B675E]">{p.tag}</span>
              </div>
              <h3 className="text-sm font-semibold font-sans text-[#F5F3EE] mb-1">
                {p.title}
              </h3>
            </button>
          ))}
        </div>

        {/* Interactive Phase Stage Viewer */}
        <div className="rounded-lg bg-[#161512] border border-white/[0.1] overflow-hidden">
          {/* Stage 1: Author */}
          {activePhase === 0 && (
            <div className="p-6 font-mono text-xs text-[#F5F3EE] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-zinc-400">
                <span>tests/e2e/checkout-flow.spec.ts</span>
                <span className="text-[#00E58F]">TypeScript Strict Mode</span>
              </div>
              <pre className="text-[#A29E94] leading-relaxed overflow-x-auto">
                <code>{`import { test, expect } from '@omnitest/playwright';

test('completes express checkout with apple pay', async ({ page }) => {
  await page.goto('/checkout');
  
  // Resilient role-based locators with auto-waiting
  await page.getByRole('textbox', { name: 'Email Address' }).fill('alex@omnitest.dev');
  await page.getByRole('button', { name: 'Complete Order' }).click();

  // Instant multi-discipline assertions
  await expect(page.getByTestId('order-confirmation')).toBeVisible();
  await expect(page).toHaveNoA11yViolations();
  await expect(page).toMatchVisualBaseline('checkout-success');
});`}</code>
              </pre>
            </div>
          )}

          {/* Stage 2: Headless Parallel Waterfall & Live Logs */}
          {activePhase === 1 && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00E58F]" />
                  <span>4 WORKERS ACTIVE • TOTAL DURATION: 1.82s</span>
                </div>
                <span className="text-[#00E58F] font-semibold">12/12 GREEN</span>
              </div>

              {/* Waterfall Rows */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 w-16">Worker 01</span>
                    <span className="text-[#F5F3EE]">ui/checkout-flow.spec.ts (Chromium)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#00E58F] rounded-full" />
                    </div>
                    <span className="text-[#00E58F] font-semibold w-16 text-right">PASSED 1.2s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 w-16">Worker 02</span>
                    <span className="text-[#F5F3EE]">api/stripe-webhook.spec.ts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-[#00E58F] rounded-full" />
                    </div>
                    <span className="text-[#00E58F] font-semibold w-16 text-right">PASSED 140ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 w-16">Worker 03</span>
                    <span className="text-[#F5F3EE]">a11y/wcag-aa-audit.spec.ts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-[#00E58F] rounded-full" />
                    </div>
                    <span className="text-[#00E58F] font-semibold w-16 text-right">PASSED 280ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 w-16">Worker 04</span>
                    <span className="text-[#F5F3EE]">perf/core-web-vitals.spec.ts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[#00E58F] rounded-full" />
                    </div>
                    <span className="text-[#00E58F] font-semibold w-16 text-right">PASSED 420ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Artifacts Captured */}
          {activePhase === 2 && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded bg-[#0E0D0B] border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#00E58F]">
                  <FileText className="w-4 h-4" />
                  <span className="font-semibold">trace.zip</span>
                </div>
                <p className="text-[#A29E94] text-[11px] leading-relaxed">
                  Interactive Playwright DOM tree, action timestamps, network request waterfall, and element states.
                </p>
                <span className="text-[#6B675E] text-[10px] block">Size: 4.2 MB • S3 Encrypted</span>
              </div>

              <div className="p-4 rounded bg-[#0E0D0B] border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#38BDF8]">
                  <Video className="w-4 h-4" />
                  <span className="font-semibold">video-replay.webm</span>
                </div>
                <p className="text-[#A29E94] text-[11px] leading-relaxed">
                  Full 60fps synchronized browser execution recording mapped directly to step failures.
                </p>
                <span className="text-[#6B675E] text-[10px] block">Duration: 1.82s • WebM VP9</span>
              </div>

              <div className="p-4 rounded bg-[#0E0D0B] border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <Terminal className="w-4 h-4" />
                  <span className="font-semibold">console &amp; HAR</span>
                </div>
                <p className="text-[#A29E94] text-[11px] leading-relaxed">
                  Full standard out, browser console exceptions, and HTTP status telemetry with masked secrets.
                </p>
                <span className="text-[#6B675E] text-[10px] block">24 Requests • 0 Secrets Leaked</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
