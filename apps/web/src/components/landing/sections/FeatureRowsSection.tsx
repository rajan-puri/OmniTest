"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container } from "../primitives/Container";

export const FeatureRowsSection: React.FC = () => {
  // Slider state for Row 1
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // A11y violation count down state for Row 2
  const [a11yErrors, setA11yErrors] = useState(12);

  // Live recorder lines for emerald banner
  const [recLines, setRecLines] = useState<string[]>([
    "await page.goto('https://app.store.dev');",
  ]);

  // Diff slider handlers
  const handleMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPos((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPos((p) => Math.min(100, p + 5));
    }
  };

  // Loop a11y count down
  useEffect(() => {
    const interval = setInterval(() => {
      setA11yErrors((prev) => (prev > 0 ? prev - 1 : 12));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Loop recorder typing
  useEffect(() => {
    const steps = [
      "await page.goto('https://app.store.dev');",
      "await page.getByRole('button', { name: 'Add to Cart' }).click();",
      "await page.getByPlaceholder('Card Number').fill('4242••••••••4242');",
      "await page.getByRole('button', { name: 'Checkout' }).click();",
      "await expect(page).toHaveURL('/order/success');",
    ];
    let idx = 1;
    const interval = setInterval(() => {
      setRecLines(steps.slice(0, idx + 1));
      idx = (idx + 1) % steps.length;
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="features"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#FBFAF7] text-[#0E1719] border-b border-[#E4E6E3] overflow-hidden"
    >
      <Container className="space-y-24">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="font-mono text-[12px] font-bold text-[#2BB5A6] tracking-wider uppercase mb-2">
            PRECISION INSPECTION SUITE
          </div>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05]">
            Engineered for deterministic quality.
          </h2>
          <p className="mt-4 text-[18px] text-[#5B6668] leading-relaxed">
            Eliminate flaky tests with visual diff tolerance, built-in accessibility
            audits, and API schema contracts running in parallel.
          </p>
        </div>

        {/* ================= ROW 1: VISUAL REGRESSION DIFF SLIDER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">
              01 / PIXEL-PERFECT DIFFS
            </div>
            <h3 className="text-[26px] md:text-[30px] font-bold tracking-tight text-[#0E1719]">
              Deterministic visual diffs that ignore font noise.
            </h3>
            <p className="text-[16px] text-[#5B6668] leading-relaxed">
              Compare DOM snapshots against known baselines with subpixel precision.
              Auto-calibrated anti-aliasing filters prevent false failures from minor
              rendering differences across Linux, macOS, and Windows.
            </p>
            <div className="pt-2 font-mono text-[13px] text-[#0E9F6E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
              <span>Tolerance threshold tuned to 0.2%</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Draggable Visual Diff Slider */}
            <div
              ref={sliderRef}
              tabIndex={0}
              role="slider"
              aria-label="Visual regression before and after slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPos)}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onKeyDown={handleKeyDown}
              className="relative w-full h-[320px] md:h-[380px] rounded-[8px] border border-[#E4E6E3] bg-white overflow-hidden shadow-sm cursor-ew-resize select-none focus:outline-none focus:ring-2 focus:ring-[#0E9F6E]"
            >
              {/* Baseline Layer */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between bg-white text-[#0E1719]">
                <div className="flex items-center justify-between border-b border-[#E4E6E3] pb-3 text-[12px] font-mono">
                  <span className="font-bold">BASELINE (v2.3.9)</span>
                  <span className="text-[#5B6668]">1440 × 900</span>
                </div>
                <div className="my-auto max-w-md mx-auto p-4 rounded-[6px] border border-[#E4E6E3] bg-[#FBFAF7] space-y-3">
                  <div className="h-4 w-28 bg-[#0E1719] rounded-[2px]" />
                  <div className="h-2 w-full bg-[#E4E6E3] rounded-[2px]" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-[13px] font-bold">$49/mo</span>
                    <button className="px-4 py-1.5 rounded-[4px] bg-[#0E1719] text-white font-mono text-[12px]">
                      Subscribe
                    </button>
                  </div>
                </div>
                <div className="text-[12px] font-mono text-[#5B6668]">
                  Status: 0 pixel drift
                </div>
              </div>

              {/* Diff Layer with Redline Highlight */}
              <div
                className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between bg-[#FBF7F7] text-[#0E1719]"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <div className="flex items-center justify-between border-b border-[#E5484D]/30 pb-3 text-[12px] font-mono text-[#E5484D]">
                  <span className="font-bold">PR #418 (DIFF DETECTED)</span>
                  <span>+8PX DRIFT</span>
                </div>
                <div className="my-auto max-w-md mx-auto p-4 rounded-[6px] border border-[#E5484D] bg-[#E5484D]/5 space-y-4">
                  <div className="h-4 w-28 bg-[#E5484D] rounded-[2px]" />
                  <div className="h-2 w-full bg-[#E4E6E3] rounded-[2px]" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-[14px] font-bold text-[#E5484D]">
                      $49/mo
                    </span>
                    <button className="px-6 py-2 rounded-[4px] bg-[#E5484D] text-white font-mono text-[12px] ring-2 ring-[#E5484D] ring-offset-1">
                      Subscribe
                    </button>
                  </div>
                </div>
                <div className="text-[12px] font-mono text-[#E5484D] font-bold">
                  Regression: Button padding shifted +8px
                </div>
              </div>

              {/* Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#0E1719] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0E1719] text-white flex items-center justify-center text-[10px] shadow-sm">
                  ⇄
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ROW 2: ACCESSIBILITY SCAN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-[8px] border border-[#E4E6E3] bg-white p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E6E3]">
                <div className="font-mono text-[12px] text-[#5B6668] uppercase font-bold">
                  AXE-CORE AUDIT ENGINE
                </div>
                <span className="px-2 py-0.5 rounded-[3px] bg-[#0E9F6E]/10 text-[#0E9F6E] font-mono text-[11px] font-bold">
                  WCAG 2.2 LEVEL AA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="p-4 rounded-[6px] bg-[#FBFAF7] border border-[#E4E6E3] text-center">
                  <div className="font-mono text-[48px] font-black text-[#0E1719] leading-none tabular-nums">
                    {a11yErrors}
                  </div>
                  <div className="text-[11px] font-mono text-[#5B6668] uppercase mt-1">
                    Violations
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2 font-mono text-[13px]">
                  {[
                    { rule: "Color Contrast Ratio (4.5:1)", status: "PASS" },
                    { rule: "Accessible Form Labels (aria-*)", status: "PASS" },
                    { rule: "Keyboard Focus Order & Traps", status: "PASS" },
                    { rule: "Touch Target Size (min 44px)", status: "PASS" },
                  ].map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-[4px] bg-[#F8F7F2]"
                    >
                      <span className="text-[#0E1719] text-[12px] truncate">{rule.rule}</span>
                      <span className="text-[#0E9F6E] font-bold text-[11px] shrink-0 ml-2">
                        {rule.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <div className="font-mono text-[11px] font-bold text-[#2BB5A6] uppercase tracking-wider">
              02 / ACCESSIBILITY AUTOMATION
            </div>
            <h3 className="text-[26px] md:text-[30px] font-bold tracking-tight text-[#0E1719]">
              WCAG 2.2 accessibility checks on every merge.
            </h3>
            <p className="text-[16px] text-[#5B6668] leading-relaxed">
              Don&apos;t let accessibility debt accumulate. OmniTest automatically audits
              every DOM state encountered during E2E runs using axe-core, ensuring
              color contrast, keyboard navigability, and ARIA roles comply with standards.
            </p>
          </div>
        </div>

        {/* ================= ROW 3: API CONTRACT SCHEMA DIFF ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono text-[11px] font-bold text-[#0E9F6E] uppercase tracking-wider">
              03 / CONTRACT VERIFICATION
            </div>
            <h3 className="text-[26px] md:text-[30px] font-bold tracking-tight text-[#0E1719]">
              Strict contract verification against OpenAPI definitions.
            </h3>
            <p className="text-[16px] text-[#5B6668] leading-relaxed">
              Catch breaking backend schema mutations before browser UI tests run.
              Validate HTTP response codes, latency budgets, and required payload fields
              directly against OpenAPI 3.1 specifications.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[8px] border border-[#E4E6E3] bg-[#0F1B1D] text-white p-6 font-mono text-[13px] leading-relaxed shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] text-[#A2AEAF]">
                <span className="text-[#2BB5A6]">GET /api/v2/orders/ORD-9482</span>
                <span className="text-[#0E9F6E] font-bold">200 OK (28ms)</span>
              </div>
              <div className="text-[#5B6668]">{"// Schema contract diff:"}</div>
              <div className="text-[#0E9F6E]">+ id: &quot;ORD-9482&quot; (string, UUIDv4)</div>
              <div className="text-[#0E9F6E]">+ total_cents: 14900 (integer)</div>
              <div className="text-[#0E9F6E]">+ currency: &quot;USD&quot; (matches enum)</div>
              <div className="text-[#0E9F6E]">+ items: Array&lt;OrderItem&gt; (length: 2)</div>
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[12px]">
                <span className="text-[#A2AEAF]">Latency budget: 28ms &lt; 150ms max</span>
                <span className="px-2 py-0.5 rounded-[3px] bg-[#0E9F6E]/15 text-[#0E9F6E] font-bold">
                  CONTRACT VALID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FULL-COLOR EMERALD BANNER: LOW-CODE RECORDER ================= */}
        <div className="w-full rounded-[8px] bg-[#0E9F6E] text-white p-8 md:p-12 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono text-[12px] text-white/80 font-bold uppercase tracking-wider">
              LOW-CODE STUDIO
            </div>
            <h3 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-white leading-tight">
              Record clicks into human-readable Playwright code.
            </h3>
            <p className="text-[16px] text-white/90 leading-relaxed">
              Empower non-engineers to record end-to-end user journeys that generate
              standard TypeScript specs. Zero proprietary runtime. Zero vendor lock-in.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[6px] border border-white/20 bg-[#0F1B1D] p-5 font-mono text-[13px] leading-relaxed shadow-xl space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[11px] text-[#A2AEAF]">
                <span>omnitest-recorder.ts</span>
                <span className="text-[#0E9F6E] font-bold">LIVE SPEC SYNTHESIS</span>
              </div>
              <div className="text-[#5B6668]">{"// Click recorder stream:"}</div>
              {recLines.map((line, idx) => (
                <div key={idx} className="text-[#FBFAF7] flex items-center gap-2">
                  <span className="text-[#0E9F6E] select-none">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-[11px] text-[#0E9F6E] pt-2">
                <span className="w-1.5 h-3 bg-[#0E9F6E] animate-pulse inline-block" />
                <span className="text-[#A2AEAF]">Synthesizing accessible role locators...</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
