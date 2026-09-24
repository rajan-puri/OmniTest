"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../primitives/Container";
import { CountUp } from "../primitives/CountUp";

export const EditorialDashboardSection: React.FC = () => {
  const [scale, setScale] = useState(0.94);
  const [stepIndex, setStepIndex] = useState(2);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scale in on scroll
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (rect.top <= windowH && rect.bottom >= 0) {
        const progress = Math.min(1, Math.max(0, (windowH - rect.top) / (windowH * 0.75)));
        setScale(0.94 + 0.06 * progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Step timeline auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="dashboard"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#F8F7F2] text-[#0E1719] border-b border-[#E4E6E3] overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-wider mb-2">
            CENTRAL OBSERVABILITY
          </div>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05]">
            One console for all test artifacts.
          </h2>
          <p className="mt-3 text-[17px] text-[#5B6668]">
            Inspect DOM snapshots, step waterfalls, network HAR archives, and
            synchronized video replays in a unified developer workbench.
          </p>
        </div>

        {/* Large App Window Scaling In On Scroll */}
        <div
          ref={containerRef}
          className="w-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="rounded-[8px] border border-[#E4E6E3] bg-[#0F1B1D] text-white shadow-2xl overflow-hidden font-mono text-[14px]">
            {/* Window Header Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#16262A] border-b border-white/[0.08] select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[13px] text-[#A2AEAF] ml-2">
                  app.omnitest.dev/runs/8492
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="px-2 py-0.5 rounded-[3px] bg-[#0E9F6E]/15 border border-[#0E9F6E]/30 text-[#0E9F6E] font-bold">
                  PASSED
                </span>
                <span className="text-[#5B6668] hidden sm:inline">SHA: 8f29c1</span>
              </div>
            </div>

            {/* Metrics Counter Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#122023] border-b border-white/[0.08]">
              <div>
                <div className="text-[11px] text-[#A2AEAF] uppercase tracking-wider">PASSED SUITES</div>
                <div className="text-[26px] font-bold text-[#0E9F6E] tabular-nums mt-0.5">
                  <CountUp end={142} suffix="/142" />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#A2AEAF] uppercase tracking-wider">FAILURES / FLAKES</div>
                <div className="text-[26px] font-bold text-white tabular-nums mt-0.5">
                  <CountUp end={0} suffix=" FAILED" />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#A2AEAF] uppercase tracking-wider">TOTAL TIME</div>
                <div className="text-[26px] font-bold text-white tabular-nums mt-0.5">
                  <CountUp end={4.8} suffix="s" decimals={1} />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#A2AEAF] uppercase tracking-wider">PARALLEL WORKERS</div>
                <div className="text-[26px] font-bold text-[#2BB5A6] tabular-nums mt-0.5">
                  <CountUp end={4} suffix=" PODS" />
                </div>
              </div>
            </div>

            {/* Dashboard Three-Column Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
              {/* Sidebar (3 cols) */}
              <div className="lg:col-span-3 border-r border-white/[0.08] p-4 bg-[#142327] space-y-3">
                <div className="text-[11px] text-[#A2AEAF] uppercase tracking-wider font-bold">
                  TEST SPECIFICATIONS
                </div>
                <div className="space-y-1 text-[13px]">
                  {[
                    { name: "checkout.spec.ts", tests: "18 tests", ok: true },
                    { name: "auth.spec.ts", tests: "12 tests", ok: true },
                    { name: "billing.spec.ts", tests: "24 tests", ok: true },
                    { name: "api-v2.spec.ts", tests: "48 tests", ok: true },
                    { name: "a11y-wcag.spec.ts", tests: "40 tests", ok: true },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-[4px] flex items-center justify-between cursor-pointer ${
                        i === 0
                          ? "bg-[#16262A] text-white font-semibold border border-white/10"
                          : "text-[#A2AEAF] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E]" />
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className="text-[11px] text-[#5B6668] shrink-0">{s.tests}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Timeline (5 cols) */}
              <div className="lg:col-span-5 p-5 border-r border-white/[0.08] bg-[#16262A] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] text-[#A2AEAF]">
                    <span>STEP TIMELINE</span>
                    <span className="text-[#0E9F6E]">STEP {stepIndex + 1} OF 5</span>
                  </div>

                  <div className="pt-4 space-y-2 text-[13px]">
                    {[
                      { step: "01", text: "page.goto('/store')", time: "340ms" },
                      { step: "02", text: "page.getByRole('button', { name: 'Item' })", time: "180ms" },
                      { step: "03", text: "page.getByPlaceholder('Email').fill()", time: "420ms" },
                      { step: "04", text: "page.getByRole('button', { name: 'Pay' })", time: "610ms" },
                      { step: "05", text: "expect(page).toHaveURL('/success')", time: "140ms" },
                    ].map((step, idx) => (
                      <div
                        key={step.step}
                        className={`p-2.5 rounded-[4px] border flex items-center justify-between transition-all ${
                          idx === stepIndex
                            ? "bg-[#0F1B1D] border-[#0E9F6E] text-white"
                            : idx < stepIndex
                            ? "bg-[#122023] border-white/[0.06] text-[#A2AEAF]"
                            : "bg-transparent border-transparent text-[#5B6668]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-5 h-5 rounded-[3px] text-[10px] font-bold flex items-center justify-center shrink-0 ${
                              idx <= stepIndex
                                ? "bg-[#0E9F6E] text-white"
                                : "bg-white/10 text-[#5B6668]"
                            }`}
                          >
                            {step.step}
                          </span>
                          <span className="truncate">{step.text}</span>
                        </div>
                        <span className="text-[12px] text-[#5B6668] tabular-nums shrink-0">
                          {step.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px] text-[#A2AEAF]">
                  <span>Telemetry: DOM Snapshot Verified</span>
                  <span className="text-[#0E9F6E]">PASS 0.5s</span>
                </div>
              </div>

              {/* Video / Trace Viewer (4 cols) */}
              <div className="lg:col-span-4 p-5 bg-[#122023] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] text-[#A2AEAF]">
                    <span>SYNCHRONIZED TRACE REPLAY</span>
                    <span className="text-[#2BB5A6]">60 FPS</span>
                  </div>

                  {/* Video Viewport Canvas */}
                  <div className="my-4 aspect-video rounded-[4px] border border-white/[0.08] bg-[#0F1B1D] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] text-[#5B6668]">
                      <span>FRAME #0142</span>
                      <span className="text-[#0E9F6E]">EVENT CAPTURED</span>
                    </div>

                    <div className="text-center py-4">
                      <span className="px-3 py-1.5 rounded-[4px] bg-[#16262A] border border-[#0E9F6E] text-[#0E9F6E] font-bold text-[13px]">
                        ✓ Order Confirmation Reached
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#5B6668]">
                      <span>1920 × 1080 Chromium</span>
                      <span>00:04.28</span>
                    </div>
                  </div>

                  {/* Seek Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#5B6668]">
                      <span>SEEK TIMELINE</span>
                      <span>{(stepIndex + 1) * 20}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-[2px] overflow-hidden">
                      <div
                        className="h-full bg-[#0E9F6E] transition-all duration-300"
                        style={{ width: `${(stepIndex + 1) * 20}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px]">
                  <span className="text-[#A2AEAF]">HAR &amp; Video bundle</span>
                  <button className="text-[#0E9F6E] hover:underline font-bold">
                    Export trace.zip →
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
