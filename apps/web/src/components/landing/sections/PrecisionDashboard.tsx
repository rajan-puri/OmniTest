"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../primitives/Container";
import { CountUp } from "../primitives/CountUp";

export const PrecisionDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState(8);
  const [timelineStep, setTimelineStep] = useState(2);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the top enters the lower half of viewport, reduce tilt to 0
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 0.75)));
        setTilt(8 * (1 - progress));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Step timeline auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="dashboard"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08] overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
            <span>CENTRAL OBSERVABILITY</span>
          </div>
          <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold tracking-tight text-[#F5F3EE] leading-[1.05]">
            Engineered for forensic inspection.
          </h2>
          <p className="mt-4 text-[17px] text-[#A29E94] max-w-2xl leading-relaxed">
            Eliminate triage ambiguity. Replay DOM snapshots, network waterfalls,
            and video frames aligned to the millisecond.
          </p>
        </div>

        {/* Perspective Container */}
        <div
          ref={containerRef}
          style={{
            perspective: "1200px",
          }}
          className="w-full"
        >
          {/* Full Container App Window with 3D Tilt */}
          <div
            style={{
              transform: `rotateX(${tilt}deg)`,
              transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="w-full rounded-[6px] border border-white/[0.12] bg-[#161512] shadow-2xl overflow-hidden font-mono"
          >
            {/* Window Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1D1B17] border-b border-white/[0.08] select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-white/20 bg-white/5" />
                  <span className="w-3 h-3 rounded-full border border-white/20 bg-white/5" />
                  <span className="w-3 h-3 rounded-full border border-white/20 bg-white/5" />
                </div>
                <span className="text-[13px] text-[#A29E94] font-medium ml-2">
                  omnitest-cloud.app/runs/8492
                </span>
              </div>

              <div className="flex items-center gap-3 text-[12px]">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#00E58F]/10 border border-[#00E58F]/30 text-[#00E58F] font-bold">
                  LIVE RUN COMPLETED
                </span>
                <span className="text-[#6B675E] hidden sm:inline">SHA: 7a82f1b</span>
              </div>
            </div>

            {/* Dashboard Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#12110E] border-b border-white/[0.08]">
              <div>
                <div className="text-[11px] text-[#8E8A80] uppercase tracking-wider">PASSED TESTS</div>
                <div className="text-[26px] font-bold text-[#00E58F] tabular-nums mt-0.5">
                  <CountUp end={142} suffix="/142" />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8E8A80] uppercase tracking-wider">FAILURES / FLAKES</div>
                <div className="text-[26px] font-bold text-[#F5F3EE] tabular-nums mt-0.5">
                  <CountUp end={0} suffix=" FAILED" />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8E8A80] uppercase tracking-wider">DURATION</div>
                <div className="text-[26px] font-bold text-[#F5F3EE] tabular-nums mt-0.5">
                  <CountUp end={4.8} suffix="s" decimals={1} />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8E8A80] uppercase tracking-wider">CLOUD WORKERS</div>
                <div className="text-[26px] font-bold text-[#38BDF8] tabular-nums mt-0.5">
                  <CountUp end={4} suffix=" PODS" />
                </div>
              </div>
            </div>

            {/* App Body Grid (Sidebar + Run Timeline + Video/Trace Viewer) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Left Column: Navigation & Run List (3 cols) */}
              <div className="lg:col-span-3 border-r border-white/[0.08] p-4 bg-[#141310] space-y-4">
                <div className="text-[11px] text-[#6B675E] uppercase tracking-wider font-bold">
                  TEST SUITES
                </div>
                <div className="space-y-1 text-[13px]">
                  {[
                    { name: "e2e-checkout.spec.ts", count: "18 tests", ok: true },
                    { name: "auth-oauth2.spec.ts", count: "12 tests", ok: true },
                    { name: "billing-plans.spec.ts", count: "24 tests", ok: true },
                    { name: "api-v2-contracts.spec.ts", count: "48 tests", ok: true },
                    { name: "wcag-audit.spec.ts", count: "40 tests", ok: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-[4px] flex items-center justify-between cursor-pointer transition-colors ${
                        i === 0
                          ? "bg-[#1D1B17] border border-white/[0.1] text-[#F5F3EE]"
                          : "text-[#A29E94] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-[#6B675E] shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Column: Execution Timeline (5 cols) */}
              <div className="lg:col-span-5 p-5 border-r border-white/[0.08] bg-[#161512] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] text-[#A29E94]">
                    <span>STEP TIMELINE (RUN #8492)</span>
                    <span className="text-[#00E58F]">100% PASS</span>
                  </div>

                  <div className="pt-4 space-y-2 text-[13px]">
                    {[
                      { step: "01", name: "page.goto('/checkout')", time: "340ms" },
                      { step: "02", name: "page.getByRole('button', { name: 'Promo' })", time: "180ms" },
                      { step: "03", name: "page.getByTestId('stripe-input').fill()", time: "420ms" },
                      { step: "04", name: "page.getByRole('button', { name: 'Pay' }).click()", time: "610ms" },
                      { step: "05", name: "expect(page).toHaveURL('/confirmation')", time: "140ms" },
                    ].map((step, idx) => (
                      <div
                        key={step.step}
                        className={`p-2.5 rounded-[4px] border flex items-center justify-between transition-all ${
                          idx === timelineStep
                            ? "bg-[#1D1B17] border-[#00E58F] text-[#F5F3EE]"
                            : idx < timelineStep
                            ? "bg-[#12110E] border-white/[0.06] text-[#A29E94]"
                            : "bg-transparent border-transparent text-[#6B675E]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-5 h-5 rounded-[3px] text-[10px] font-bold flex items-center justify-center shrink-0 ${
                              idx <= timelineStep
                                ? "bg-[#00E58F] text-[#0E0D0B]"
                                : "bg-white/10 text-[#6B675E]"
                            }`}
                          >
                            {step.step}
                          </span>
                          <span className="truncate">{step.name}</span>
                        </div>
                        <span className="text-[12px] text-[#6B675E] shrink-0 tabular-nums">
                          {step.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px] text-[#6B675E]">
                  <span>Tracing: Full DOM Snapshot Active</span>
                  <span className="text-[#00E58F]">ALL ASSERTIONS MET</span>
                </div>
              </div>

              {/* Right Column: Synchronized Video & Trace Scrubber (4 cols) */}
              <div className="lg:col-span-4 p-5 bg-[#12110E] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] text-[#A29E94]">
                    <span>RECORDING &amp; TRACE</span>
                    <span className="text-[#38BDF8]">60 FPS</span>
                  </div>

                  {/* Mock Video Canvas */}
                  <div className="my-4 aspect-video rounded-[4px] border border-white/[0.08] bg-[#0E0D0B] p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between text-[11px] text-[#6B675E]">
                      <span>FRAME 0142</span>
                      <span className="text-[#00E58F]">DOM MATCH</span>
                    </div>

                    <div className="text-center py-4">
                      <div className="inline-block p-3 rounded-[4px] bg-[#161512] border border-[#00E58F] text-[#00E58F] text-[13px] font-bold">
                        ✓ Order Completed Successfully
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#6B675E]">
                      <span>1920 × 1080 WebKit</span>
                      <span>TIME: 00:04.28</span>
                    </div>
                  </div>

                  {/* Scrubber Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#6B675E]">
                      <span>SEEK TRACE</span>
                      <span>{timelineStep * 25}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-[2px] overflow-hidden">
                      <div
                        className="h-full bg-[#00E58F] transition-all duration-300"
                        style={{ width: `${(timelineStep + 1) * 20}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px]">
                  <span className="text-[#A29E94]">HAR telemetry synced</span>
                  <button className="text-[#00E58F] hover:underline font-bold">
                    Export Archive →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
