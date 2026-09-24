"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../primitives/Container";
import { MockWindow } from "../primitives/MockWindow";

const STEPS = [
  {
    num: "01",
    title: "Author & Record",
    headline: "Write once in TypeScript or record browser actions in real time.",
    subtext: "Generates standard resilient Playwright locators with zero vendor lock-in.",
  },
  {
    num: "02",
    title: "Parallel Execution",
    headline: "Orchestrate 4 to 32 isolated browser pods with zero cold boots.",
    subtext: "Tests execute in parallel across Chromium, WebKit, and Firefox in sandboxed containers.",
  },
  {
    num: "03",
    title: "Instant Artifacts",
    headline: "Inspect pixel-perfect video recordings, trace archives, and network HARs.",
    subtext: "Every run bundles full forensic telemetry to debug failures down to the exact frame.",
  },
];

export const PrecisionHowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Monitor scroll for desktop pinned progression
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el || window.innerWidth < 768) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= 100 && rect.bottom >= windowHeight) {
        const scrolledDistance = -rect.top + 100;
        const totalDistance = rect.height - windowHeight;
        const ratio = Math.max(0, Math.min(1, scrolledDistance / totalDistance));

        if (ratio < 0.33) {
          setActiveStep(0);
        } else if (ratio < 0.66) {
          setActiveStep(1);
        } else {
          setActiveStep(2);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      className="relative w-full bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08]"
    >
      {/* Desktop View: Pinned sticky-scroll experience (>= 768px) */}
      <div
        ref={containerRef}
        className="hidden md:block relative h-[280vh] w-full"
      >
        <div className="sticky top-20 h-[calc(100vh-80px)] flex items-center">
          <Container className="w-full">
            <div className="grid grid-cols-12 gap-12 items-center">
              {/* Left Column: Huge step number and short headline */}
              <div className="col-span-5 flex flex-col justify-center">
                <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest mb-4">
                  EXECUTION LIFECYCLE
                </div>

                <div className="font-mono text-[clamp(4.5rem,7vw,7rem)] font-black text-[#00E58F] leading-none tracking-tight mb-4 select-none">
                  {STEPS[activeStep].num}
                </div>

                <h3 className="text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold tracking-tight text-[#F5F3EE] mb-4">
                  {STEPS[activeStep].headline}
                </h3>

                <p className="text-[16px] text-[#A29E94] leading-relaxed mb-8">
                  {STEPS[activeStep].subtext}
                </p>

                {/* Step indicator buttons */}
                <div className="flex items-center gap-2">
                  {STEPS.map((s, idx) => (
                    <button
                      key={s.num}
                      onClick={() => setActiveStep(idx)}
                      className={`h-1.5 rounded-[2px] transition-all duration-300 ${
                        activeStep === idx
                          ? "w-12 bg-[#00E58F]"
                          : "w-6 bg-white/[0.12] hover:bg-white/[0.24]"
                      }`}
                      aria-label={`Jump to step ${s.num}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Large Visual Panel */}
              <div className="col-span-7">
                {activeStep === 0 && (
                  <MockWindow
                    title="checkout.spec.ts — Code Authoring"
                    badge="SYNTAX VALID"
                    badgeVariant="mint"
                    telemetry={<span className="font-mono text-[11px] text-[#6B675E]">PLAYWRIGHT SPEC</span>}
                    bodyClassName="bg-[#12110E] p-6 font-mono text-[14px] leading-relaxed space-y-2 min-h-[380px]"
                  >
                    <div className="text-[#8E8A80]">{"// 01: Define end-to-end user scenario"}</div>
                    <div>
                      <span className="text-[#C084FC]">import</span>
                      <span className="text-[#F5F3EE]"> &#123; test, expect &#125; </span>
                      <span className="text-[#C084FC]">from</span>
                      <span className="text-[#34D399]"> &apos;@omnitest/core&apos;</span>
                      <span className="text-[#F5F3EE]">;</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[#38BDF8]">test</span>
                      <span className="text-[#F5F3EE]">(</span>
                      <span className="text-[#34D399]">&apos;user can complete stripe checkout flow&apos;</span>
                      <span className="text-[#F5F3EE]">, </span>
                      <span className="text-[#C084FC]">async</span>
                      <span className="text-[#F5F3EE]"> (&#123; </span>
                      <span className="text-[#FBBF24]">page</span>
                      <span className="text-[#F5F3EE]"> &#125;) =&gt; &#123;</span>
                    </div>
                    <div className="pl-6 space-y-1.5 border-l border-white/[0.08]">
                      <div>
                        <span className="text-[#C084FC]">await</span>
                        <span className="text-[#F5F3EE]"> page.</span>
                        <span className="text-[#38BDF8]">goto</span>
                        <span className="text-[#F5F3EE]">(</span>
                        <span className="text-[#34D399]">&apos;https://app.store.dev/checkout&apos;</span>
                        <span className="text-[#F5F3EE]">);</span>
                      </div>
                      <div>
                        <span className="text-[#C084FC]">await</span>
                        <span className="text-[#F5F3EE]"> page.</span>
                        <span className="text-[#38BDF8]">getByRole</span>
                        <span className="text-[#F5F3EE]">(</span>
                        <span className="text-[#34D399]">&apos;button&apos;</span>
                        <span className="text-[#F5F3EE]">, &#123; name: </span>
                        <span className="text-[#34D399]">&apos;Confirm Order&apos;</span>
                        <span className="text-[#F5F3EE]"> &#125;).</span>
                        <span className="text-[#38BDF8]">click</span>
                        <span className="text-[#F5F3EE]">();</span>
                      </div>
                      <div>
                        <span className="text-[#C084FC]">await</span>
                        <span className="text-[#38BDF8]"> expect</span>
                        <span className="text-[#F5F3EE]">(page).</span>
                        <span className="text-[#38BDF8]">toHaveURL</span>
                        <span className="text-[#F5F3EE]">(</span>
                        <span className="text-[#34D399]">/\/success/</span>
                        <span className="text-[#F5F3EE]">);</span>
                      </div>
                    </div>
                    <div className="text-[#F5F3EE]">&#125;);</div>

                    <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[12px] text-[#A29E94]">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
                        <span>Code Generator: Zero flaky selectors</span>
                      </span>
                      <span className="text-[#00E58F]">TS CHECK: PASSED</span>
                    </div>
                  </MockWindow>
                )}

                {activeStep === 1 && (
                  <MockWindow
                    title="orchestrator --concurrency=4"
                    badge="4 PODS RUNNING"
                    badgeVariant="mint"
                    telemetry={<span className="font-mono text-[11px] text-[#00E58F]">100% HEALTH</span>}
                    bodyClassName="bg-[#12110E] p-6 font-mono text-[14px] min-h-[380px] space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "pod-01", target: "chromium:auth.spec.ts", time: "1.4s", status: "PASS", cpu: "18%" },
                        { id: "pod-02", target: "webkit:cart.spec.ts", time: "2.1s", status: "RUNNING", cpu: "42%" },
                        { id: "pod-03", target: "firefox:checkout.spec.ts", time: "1.8s", status: "PASS", cpu: "12%" },
                        { id: "pod-04", target: "api:stripe_webhook.spec.ts", time: "0.4s", status: "PASS", cpu: "5%" },
                      ].map((pod) => (
                        <div
                          key={pod.id}
                          className="p-3 rounded-[6px] border border-white/[0.08] bg-[#161512] flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#6B675E]">
                            <span className="uppercase">{pod.id}</span>
                            <span className="text-[#A29E94]">CPU: {pod.cpu}</span>
                          </div>
                          <div className="my-2 text-[13px] text-[#F5F3EE] truncate font-semibold">
                            {pod.target}
                          </div>
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[#A29E94]">{pod.time}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                                pod.status === "PASS"
                                  ? "text-[#00E58F] bg-[#00E58F]/10 border border-[#00E58F]/30"
                                  : "text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 animate-pulse"
                              }`}
                            >
                              {pod.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Stream Terminal Log */}
                    <div className="p-3 rounded-[6px] border border-white/[0.08] bg-[#0E0D0B] text-[12px] space-y-1 text-[#A29E94]">
                      <div className="text-[#8E8A80]">{"// Stream output from active runner pods:"}</div>
                      <div className="text-[#F5F3EE]">
                        [pod-02] ✓ Response 200 OK received for /api/cart/sync (34ms)
                      </div>
                      <div className="text-[#00E58F]">
                        [pod-01] ✓ Accessibility scan: 0 critical, 0 serious violations
                      </div>
                    </div>
                  </MockWindow>
                )}

                {activeStep === 2 && (
                  <MockWindow
                    title="artifacts-viewer --run=RUN-8492"
                    badge="3 ARTIFACTS CAPTURED"
                    badgeVariant="mint"
                    telemetry={<span className="font-mono text-[11px] text-[#6B675E]">SHA-256 VERIFIED</span>}
                    bodyClassName="bg-[#12110E] p-6 font-mono text-[14px] min-h-[380px] space-y-4"
                  >
                    {[
                      {
                        name: "trace.zip",
                        type: "Playwright Complete Trace",
                        size: "2.4 MB",
                        desc: "Step-by-step DOM snapshots, console logs, and action timings.",
                      },
                      {
                        name: "video_run_8492.webm",
                        type: "High-Res Browser Recording",
                        size: "8.1 MB",
                        desc: "Full 60fps viewport recording synchronized with timestamped clicks.",
                      },
                      {
                        name: "network_telemetry.har",
                        type: "Complete HTTP/2 Session Archive",
                        size: "1.1 MB",
                        desc: "Every request header, payload, status code, and SSL handshake timing.",
                      },
                    ].map((art) => (
                      <div
                        key={art.name}
                        className="p-3.5 rounded-[6px] border border-white/[0.08] bg-[#161512] flex items-center justify-between hover:border-white/[0.2] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[4px] bg-[#1D1B17] border border-white/[0.1] flex items-center justify-center text-[#00E58F]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-[#F5F3EE] flex items-center gap-2">
                              <span>{art.name}</span>
                              <span className="text-[11px] font-normal text-[#6B675E]">({art.size})</span>
                            </div>
                            <div className="text-[12px] text-[#A29E94]">{art.desc}</div>
                          </div>
                        </div>

                        <span className="text-[11px] px-2 py-1 rounded-[4px] border border-[#00E58F]/30 bg-[#00E58F]/10 text-[#00E58F] font-semibold uppercase">
                          READY
                        </span>
                      </div>
                    ))}
                  </MockWindow>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile Stacked View (< 768px): Three stacked blocks with exact same visuals */}
      <div className="md:hidden py-16">
        <Container className="space-y-16">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="space-y-6">
              <div>
                <div className="font-mono text-[clamp(3rem,6vw,4.5rem)] font-black text-[#00E58F] leading-none mb-2">
                  {s.num}
                </div>
                <h3 className="text-[22px] font-bold text-[#F5F3EE] mb-2">{s.headline}</h3>
                <p className="text-[15px] text-[#A29E94] leading-relaxed">{s.subtext}</p>
              </div>

              {idx === 0 && (
                <MockWindow
                  title="checkout.spec.ts"
                  badge="SYNTAX VALID"
                  badgeVariant="mint"
                  bodyClassName="bg-[#12110E] p-4 font-mono text-[13px] leading-relaxed"
                >
                  <div className="text-[#C084FC]">import &#123; test, expect &#125; from &apos;@omnitest/core&apos;;</div>
                  <div className="pt-2 text-[#38BDF8]">test(&apos;user checkout&apos;, async (&#123; page &#125;) =&gt; &#123;</div>
                  <div className="pl-4 text-[#A29E94]">
                    await page.getByRole(&apos;button&apos;, &#123; name: &apos;Checkout&apos; &#125;).click();
                  </div>
                  <div className="pl-4 text-[#00E58F]">await expect(page).toHaveURL(/\/success/);</div>
                  <div>&#125;);</div>
                </MockWindow>
              )}

              {idx === 1 && (
                <MockWindow
                  title="orchestrator"
                  badge="4 PODS"
                  badgeVariant="mint"
                  bodyClassName="bg-[#12110E] p-4 font-mono text-[13px] space-y-2"
                >
                  <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#161512] flex items-center justify-between">
                    <span>chromium:auth.spec.ts</span>
                    <span className="text-[#00E58F] font-bold">PASS 1.4s</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#161512] flex items-center justify-between">
                    <span>webkit:cart.spec.ts</span>
                    <span className="text-[#00E58F] font-bold">PASS 2.1s</span>
                  </div>
                </MockWindow>
              )}

              {idx === 2 && (
                <MockWindow
                  title="artifacts"
                  badge="READY"
                  badgeVariant="mint"
                  bodyClassName="bg-[#12110E] p-4 font-mono text-[13px] space-y-2"
                >
                  <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#161512] flex items-center justify-between">
                    <span className="font-bold text-[#F5F3EE]">trace.zip</span>
                    <span className="text-[#00E58F]">2.4 MB</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#161512] flex items-center justify-between">
                    <span className="font-bold text-[#F5F3EE]">recording.webm</span>
                    <span className="text-[#00E58F]">8.1 MB</span>
                  </div>
                </MockWindow>
              )}
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
};
