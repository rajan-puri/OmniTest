"use client";

import React, { useState, useEffect } from "react";
import {
  Code,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
  Check,
} from "lucide-react";

export function CapabilitiesBento() {
  const [recorderStep, setRecorderStep] = useState(1);
  const [a11yScore, setA11yScore] = useState(100);

  // Small looping animation for low-code recorder
  useEffect(() => {
    const interval = setInterval(() => {
      setRecorderStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="quality-fleet"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
            STEP 05/08: MULTI-DISCIPLINE FLEET
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05] max-w-3xl">
            Five testing engines under one configuration.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#A29E94] max-w-2xl">
            Browser automation, accessibility audits, API contract checks, and Core Web Vitals executed concurrently across cloud workers.
          </p>
        </div>

        {/* Asymmetric Bento Grid with Unequal Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tile 1: LARGE TILE (Span 7) - Low-Code Recorder to Playwright TypeScript */}
          <div className="md:col-span-7 rounded-lg bg-[#161512] border border-white/[0.1] p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-[#00E58F] font-bold flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  LOW-CODE RECORDER → CLEAN PLAYWRIGHT
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                  LIVE CODE SYNTHESIS
                </span>
              </div>

              <p className="text-xs text-[#A29E94] mb-4">
                Click naturally through your app. OmniTest automatically extracts stable role-based selectors and generates pure TypeScript without vendor lock-in.
              </p>

              {/* Looping Recorder Execution Sandbox */}
              <div className="space-y-2 font-mono text-xs">
                <div
                  className={`p-3 rounded transition-all duration-300 ${
                    recorderStep >= 1
                      ? "bg-[#1D1B17] border border-[#00E58F]/30 text-[#F5F3EE]"
                      : "bg-black/30 border border-white/[0.04] text-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>1. Click &quot;Add to Cart&quot;</span>
                    {recorderStep >= 1 && <span className="text-[#00E58F]">RECORDED</span>}
                  </div>
                  <div className="text-[11px] text-[#A29E94] mt-0.5">
                    <code>page.getByRole(&apos;button&apos;, &#123; name: &apos;Add to Cart&apos; &#125;)</code>
                  </div>
                </div>

                <div
                  className={`p-3 rounded transition-all duration-300 ${
                    recorderStep >= 2
                      ? "bg-[#1D1B17] border border-[#00E58F]/30 text-[#F5F3EE]"
                      : "bg-black/30 border border-white/[0.04] text-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>2. Fill &quot;Email Address&quot;</span>
                    {recorderStep >= 2 && <span className="text-[#00E58F]">RECORDED</span>}
                  </div>
                  <div className="text-[11px] text-[#A29E94] mt-0.5">
                    <code>page.getByRole(&apos;textbox&apos;, &#123; name: &apos;Email&apos; &#125;).fill(&apos;dev@acme.com&apos;)</code>
                  </div>
                </div>

                <div
                  className={`p-3 rounded transition-all duration-300 ${
                    recorderStep >= 3
                      ? "bg-[#1D1B17] border border-[#00E58F]/30 text-[#F5F3EE]"
                      : "bg-black/30 border border-white/[0.04] text-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>3. Assert confirmation badge visible</span>
                    {recorderStep >= 3 && <span className="text-[#00E58F]">ASSERTED</span>}
                  </div>
                  <div className="text-[11px] text-[#A29E94] mt-0.5">
                    <code>expect(page.getByTestId(&apos;success-modal&apos;)).toBeVisible()</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Export target: .spec.ts</span>
              <span className="text-[#00E58F]">Standard Playwright Runner Compatible</span>
            </div>
          </div>

          {/* Tile 2: Accessibility Scan (Span 5) */}
          <div className="md:col-span-5 rounded-lg bg-[#161512] border border-white/[0.1] p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-[#00E58F] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  ACCESSIBILITY (AXE-CORE)
                </span>
                <span className="text-[#00E58F] font-semibold">WCAG 2.1 AA</span>
              </div>

              <p className="text-xs text-[#A29E94] mb-4">
                Automated DOM scans identify missing ARIA attributes, contrast ratios, and keyboard traps before every merge.
              </p>

              <div className="p-4 rounded bg-[#0E0D0B] border border-white/[0.06] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Critical Violations</span>
                  <span className="text-[#00E58F] font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Color Contrast Checks</span>
                  <span className="text-[#00E58F] font-bold">42/42 Pass</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Keyboard Navigation Traps</span>
                  <span className="text-[#00E58F] font-bold">None</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Engine: axe-core 4.10</span>
              <span className="text-[#00E58F]">Passed in 210ms</span>
            </div>
          </div>

          {/* Tile 3: Core Web Vitals (Span 4) */}
          <div className="md:col-span-4 rounded-lg bg-[#161512] border border-white/[0.1] p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-[#38BDF8] font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  CORE WEB VITALS
                </span>
                <span className="text-[#38BDF8]">SCORE 98</span>
              </div>

              <p className="text-xs text-[#A29E94] mb-4">
                Enforce production performance budgets on preview URLs under throttled CPU conditions.
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/[0.04]">
                  <span className="text-zinc-400">LCP (Largest Paint)</span>
                  <span className="text-[#00E58F] font-semibold">1.1s (Target: 2.5s)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/[0.04]">
                  <span className="text-zinc-400">CLS (Layout Shift)</span>
                  <span className="text-[#00E58F] font-semibold">0.002 (Target: 0.1)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
              Google Lighthouse 12.0
            </div>
          </div>

          {/* Tile 4: API Contract Testing (Span 4) */}
          <div className="md:col-span-4 rounded-lg bg-[#161512] border border-white/[0.1] p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  API CONTRACTS
                </span>
                <span className="text-[#00E58F]">142ms</span>
              </div>

              <p className="text-xs text-[#A29E94] mb-4">
                Validate REST and GraphQL JSON payloads against strict TypeScript schemas in the same pipeline.
              </p>

              <div className="p-3 rounded bg-[#0E0D0B] border border-white/[0.06] font-mono text-[11px] space-y-1 text-zinc-400">
                <div>
                  <span className="text-[#38BDF8]">POST</span> /api/v1/orders/checkout
                </div>
                <div className="text-[#00E58F]">✓ Status: 201 Created</div>
                <div className="text-[#00E58F]">✓ Schema: OrderReceipt.d.ts</div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
              Zero mock drift
            </div>
          </div>

          {/* Tile 5: Security & SEO Checks (Span 4) */}
          <div className="md:col-span-4 rounded-lg bg-[#161512] border border-white/[0.1] p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-[#00E58F] font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  SEO &amp; HEADERS
                </span>
                <span className="text-[#00E58F]">PASS</span>
              </div>

              <p className="text-xs text-[#A29E94] mb-4">
                Verify CSP headers, canonical tags, OpenGraph previews, and robots meta tags automatically.
              </p>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>CSP &amp; HSTS Headers</span>
                  <span className="text-[#00E58F]">VALID</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Canonical URL Match</span>
                  <span className="text-[#00E58F]">VALID</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>OpenGraph 1200x630</span>
                  <span className="text-[#00E58F]">PRESENT</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
              Audited in 85ms
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
