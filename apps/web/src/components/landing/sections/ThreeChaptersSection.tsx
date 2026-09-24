"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../primitives/Container";

const CHAPTERS = [
  {
    num: "01",
    eyebrow: "CHAPTER 01 / SPEC CREATION",
    title: "Record interactions or author native Playwright code.",
    body: "Inspect elements with resilient locator resolution. Author in standard TypeScript or capture click workflows directly in our browser recorder with zero brittle selectors.",
    linkText: "Explore spec generation →",
    href: "#features",
  },
  {
    num: "02",
    eyebrow: "CHAPTER 02 / PARALLEL GRID",
    title: "Dispatch across 4 to 32 parallel cloud workers.",
    body: "Pre-warmed microVMs boot in sub-180ms. Chromium, WebKit, and Firefox run in isolated sandboxes with zero crosstalk, zero state leaks, and zero cold-boot delays.",
    linkText: "Explore worker orchestration →",
    href: "#dashboard",
  },
  {
    num: "03",
    eyebrow: "CHAPTER 03 / MERGE GATING",
    title: "Audit pixel diffs, a11y violations, and API schemas.",
    body: "Detect regressions before deployment. Visual drift routes to team review checkpoints, while passing assertion suites unlock green merge gates on GitHub pull requests.",
    linkText: "Explore pull request gates →",
    href: "#pricing",
  },
];

export const ThreeChaptersSection: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Monitor scroll for pinned progression on desktop
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el || window.innerWidth < 768) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= 100 && rect.bottom >= windowHeight) {
        const scrolled = -rect.top + 100;
        const total = rect.height - windowHeight;
        const ratio = Math.max(0, Math.min(1, scrolled / total));

        if (ratio < 0.33) {
          setActiveChapter(0);
        } else if (ratio < 0.66) {
          setActiveChapter(1);
        } else {
          setActiveChapter(2);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="chapters"
      className="relative w-full bg-[#0F1B1D] text-white border-b border-white/[0.08]"
    >
      {/* Desktop View: Pinned sticky-scroll experience (>= 768px) */}
      <div ref={containerRef} className="hidden md:block relative h-[270vh] w-full">
        <div className="sticky top-20 h-[calc(100vh-80px)] flex items-center">
          <Container className="w-full">
            <div className="grid grid-cols-12 gap-12 items-center">
              {/* Left Column: 3-item list with active item expanded & ghost numeral */}
              <div className="col-span-5 relative flex flex-col justify-center">
                {/* Giant ghost numeral behind text */}
                <div className="absolute -top-16 -left-6 font-mono text-[140px] font-black text-white/[0.04] select-none pointer-events-none leading-none">
                  {CHAPTERS[activeChapter].num}
                </div>

                <div className="space-y-6 relative z-10">
                  {CHAPTERS.map((chap, idx) => {
                    const isActive = activeChapter === idx;
                    return (
                      <div
                        key={chap.num}
                        onClick={() => setActiveChapter(idx)}
                        className={`p-6 rounded-[8px] border transition-all duration-300 cursor-pointer ${
                          isActive
                            ? "bg-[#16262A] border-[#2BB5A6] shadow-lg"
                            : "bg-transparent border-white/[0.06] hover:border-white/20 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="font-mono text-[11px] font-bold text-[#2BB5A6] tracking-wider uppercase mb-1 flex items-center justify-between">
                          <span>{chap.eyebrow}</span>
                          <span className="text-[12px] font-mono text-white/40">{chap.num}</span>
                        </div>

                        <h3 className="text-[20px] font-bold text-white tracking-tight leading-snug">
                          {chap.title}
                        </h3>

                        {isActive && (
                          <div className="mt-3 pt-3 border-t border-white/[0.08] animate-[fadeIn_0.3s_ease]">
                            <p className="text-[15px] text-[#A2AEAF] leading-relaxed">
                              {chap.body}
                            </p>
                            <a
                              href={chap.href}
                              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0E9F6E] hover:underline"
                            >
                              {chap.linkText}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Persistent Transforming SVG Node Diagram */}
              <div className="col-span-7">
                <div className="w-full rounded-[8px] border border-white/[0.1] bg-[#16262A] p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex items-center justify-center">
                  {/* Top Bar Header */}
                  <div className="absolute top-0 inset-x-0 h-10 bg-[#122023] border-b border-white/[0.08] px-4 flex items-center justify-between font-mono text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <span className="ml-2 text-[#A2AEAF]">
                        pipeline.orchestration.svg
                      </span>
                    </div>
                    <span className="text-[#2BB5A6] font-semibold">
                      STATE: {CHAPTERS[activeChapter].num} / 03
                    </span>
                  </div>

                  {/* Transforming Diagram Content */}
                  <div className="w-full pt-10 select-none">
                    {/* CHAPTER 01: AUTHOR */}
                    {activeChapter === 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6 items-center">
                          {/* Recorder Node */}
                          <div className="p-4 rounded-[6px] border border-[#2BB5A6] bg-[#0F1B1D] text-left">
                            <div className="font-mono text-[11px] text-[#2BB5A6] uppercase font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#2BB5A6] animate-pulse" />
                              DOM RECORDER
                            </div>
                            <div className="text-[14px] font-bold text-white mt-1">
                              Click: #checkout-btn
                            </div>
                            <div className="font-mono text-[12px] text-[#A2AEAF] mt-1">
                              page.getByRole(&apos;button&apos;, &#123; name: &apos;Checkout&apos; &#125;)
                            </div>
                          </div>

                          {/* Code Generator Node */}
                          <div className="p-4 rounded-[6px] border border-[#0E9F6E] bg-[#0F1B1D] text-left">
                            <div className="font-mono text-[11px] text-[#0E9F6E] uppercase font-bold flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
                              PLAYWRIGHT SPEC
                            </div>
                            <div className="text-[14px] font-bold text-white mt-1">
                              checkout.spec.ts
                            </div>
                            <div className="font-mono text-[12px] text-[#0E9F6E] mt-1">
                              await expect(page).toHaveURL(/confirm/);
                            </div>
                          </div>
                        </div>

                        {/* Connector Line */}
                        <div className="flex items-center justify-center gap-2 font-mono text-[12px] text-[#2BB5A6]">
                          <span className="h-0.5 w-16 bg-[#2BB5A6]" />
                          <span>SYNTHESIZING RESILIENT LOCATOR</span>
                          <span className="h-0.5 w-16 bg-[#2BB5A6]" />
                        </div>

                        <div className="p-3 rounded-[4px] bg-[#122023] border border-white/[0.08] font-mono text-[12px] flex items-center justify-between text-[#A2AEAF]">
                          <span>Output: Zero brittle XPath/CSS selectors</span>
                          <span className="text-[#0E9F6E] font-bold">100% TS VALID</span>
                        </div>
                      </div>
                    )}

                    {/* CHAPTER 02: EXECUTE */}
                    {activeChapter === 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] font-mono text-[12px]">
                          <span className="text-[#FF5A1F] font-bold">4 WORKERS RUNNING</span>
                          <span className="text-[#A2AEAF]">COLD BOOT: 180ms</span>
                        </div>

                        {/* 4 Parallel Worker Nodes */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: "POD 01: CHROMIUM", test: "auth.spec.ts", time: "1.2s", status: "PASS" },
                            { name: "POD 02: WEBKIT", test: "cart.spec.ts", time: "2.0s", status: "RUNNING" },
                            { name: "POD 03: FIREFOX", test: "checkout.spec.ts", time: "1.6s", status: "PASS" },
                            { name: "POD 04: API POD", test: "orders.spec.ts", time: "0.4s", status: "PASS" },
                          ].map((worker, i) => (
                            <div
                              key={i}
                              className="p-3.5 rounded-[6px] border border-white/[0.1] bg-[#0F1B1D] flex flex-col justify-between"
                            >
                              <div className="font-mono text-[11px] text-[#A2AEAF]">{worker.name}</div>
                              <div className="text-[14px] font-bold text-white my-1">{worker.test}</div>
                              <div className="flex items-center justify-between font-mono text-[12px]">
                                <span className="text-[#5B6668]">{worker.time}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold ${
                                    worker.status === "PASS"
                                      ? "bg-[#0E9F6E]/15 text-[#0E9F6E]"
                                      : "bg-[#FF5A1F]/15 text-[#FF5A1F] animate-pulse"
                                  }`}
                                >
                                  {worker.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-[4px] bg-[#122023] border border-white/[0.08] font-mono text-[12px] flex items-center justify-between text-[#A2AEAF]">
                          <span>Forensic Capture: trace.zip, HAR, 60fps video</span>
                          <span className="text-[#0E9F6E] font-bold">TRACE CAPTURED</span>
                        </div>
                      </div>
                    )}

                    {/* CHAPTER 03: VERIFY */}
                    {activeChapter === 2 && (
                      <div className="space-y-6">
                        {/* 3 Verification Check Nodes */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-[6px] border border-[#E5484D] bg-[#E5484D]/10">
                            <div className="font-mono text-[10px] text-[#E5484D] font-bold">VISUAL DIFF</div>
                            <div className="text-[13px] font-bold text-white mt-1">0.4% Drift</div>
                            <div className="text-[10px] font-mono text-[#E5484D] mt-1">FLAGGED FOR REVIEW</div>
                          </div>
                          <div className="p-3 rounded-[6px] border border-[#0E9F6E] bg-[#0E9F6E]/10">
                            <div className="font-mono text-[10px] text-[#0E9F6E] font-bold">AXE-CORE</div>
                            <div className="text-[13px] font-bold text-white mt-1">0 Violations</div>
                            <div className="text-[10px] font-mono text-[#0E9F6E] mt-1">WCAG 2.2 PASS</div>
                          </div>
                          <div className="p-3 rounded-[6px] border border-[#0E9F6E] bg-[#0E9F6E]/10">
                            <div className="font-mono text-[10px] text-[#0E9F6E] font-bold">OPENAPI</div>
                            <div className="text-[13px] font-bold text-white mt-1">100% Match</div>
                            <div className="text-[10px] font-mono text-[#0E9F6E] mt-1">CONTRACT VALID</div>
                          </div>
                        </div>

                        {/* Route to Human Review -> PR Gate Approved */}
                        <div className="p-4 rounded-[6px] border border-[#0E9F6E] bg-[#0F1B1D] space-y-2">
                          <div className="flex items-center justify-between font-mono text-[12px]">
                            <span className="text-[#A2AEAF]">Human Review Checkpoint:</span>
                            <span className="text-[#0E9F6E] font-bold">DRIFT APPROVED BY QA</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                            <span className="text-[14px] font-bold text-white">
                              GitHub PR Gate #418
                            </span>
                            <span className="px-2 py-0.5 rounded-[3px] bg-[#0E9F6E] text-white font-mono text-[11px] font-bold">
                              MERGE APPROVED
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-[4px] bg-[#122023] border border-white/[0.08] font-mono text-[12px] flex items-center justify-between text-[#A2AEAF]">
                          <span>Security &amp; SEO Verified</span>
                          <span className="text-[#0E9F6E] font-bold">2 ISSUES BLOCKED &amp; RESOLVED</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile Stacked View (< 768px): Three standalone chapter blocks */}
      <div className="md:hidden py-16">
        <Container className="space-y-16">
          {CHAPTERS.map((chap, idx) => (
            <div key={chap.num} className="space-y-6">
              <div>
                <div className="font-mono text-[11px] font-bold text-[#2BB5A6] uppercase tracking-wider mb-1">
                  {chap.eyebrow}
                </div>
                <h3 className="text-[22px] font-bold text-white tracking-tight">{chap.title}</h3>
                <p className="text-[15px] text-[#A2AEAF] leading-relaxed mt-2">{chap.body}</p>
              </div>

              {/* Mobile Diagram Snapshot */}
              <div className="rounded-[8px] border border-white/[0.1] bg-[#16262A] p-4 text-[13px] font-mono">
                {idx === 0 && (
                  <div className="space-y-2">
                    <div className="text-[#2BB5A6] font-bold">DOM RECORDER → PLAYWRIGHT SPEC</div>
                    <div className="text-[#A2AEAF]">page.getByRole(&apos;button&apos;, &#123; name: &apos;Checkout&apos; &#125;)</div>
                    <div className="text-[#0E9F6E]">✓ Resilient locator synthesized</div>
                  </div>
                )}
                {idx === 1 && (
                  <div className="space-y-2">
                    <div className="text-[#FF5A1F] font-bold">4 WORKER PODS CONCURRENT</div>
                    <div className="text-[#A2AEAF]">Chromium • WebKit • Firefox • Node API</div>
                    <div className="text-[#0E9F6E]">✓ 180ms cold boot • Traces captured</div>
                  </div>
                )}
                {idx === 2 && (
                  <div className="space-y-2">
                    <div className="text-[#E5484D] font-bold">0.4% DRIFT DETECTED → REVIEWED</div>
                    <div className="text-[#0E9F6E]">✓ WCAG 2.2 AA (0 errors) • OpenAPI Valid</div>
                    <div className="text-[#0E9F6E] font-bold">✓ GITHUB PR GATE APPROVED</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
};
