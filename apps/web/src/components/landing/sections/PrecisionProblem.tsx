"use client";

import React, { useEffect, useRef, useState } from "react";
import { Container } from "../primitives/Container";

const TOOLS = [
  { id: "e2e", name: "Cypress / Playwright", role: "Browser E2E", cost: "$400/mo", x: 15, y: 20 },
  { id: "visual", name: "Percy / Chromatic", role: "Visual Diffs", cost: "$299/mo", x: 80, y: 15 },
  { id: "api", name: "Postman / Newman", role: "API Contracts", cost: "$150/mo", x: 10, y: 75 },
  { id: "a11y", name: "axe-core CLI", role: "Accessibility", cost: "Manual", x: 82, y: 80 },
  { id: "perf", name: "Lighthouse CI", role: "Web Vitals", cost: "Fragmented", x: 50, y: 90 },
];

export const PrecisionProblem: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress 0 to 1 as it scrolls through viewport
      const totalScroll = rect.height + viewportHeight;
      const currentScroll = viewportHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / (totalScroll * 0.75)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Is collapsed when progress > 0.5
  const isCollapsed = scrollProgress > 0.45;

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08] overflow-hidden"
    >
      <Container>
        {/* Giant statement revealed word by word */}
        <div className="max-w-4xl mx-auto text-center mb-16 select-none">
          <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest mb-4">
            THE TOOLING CONVERGENCE
          </div>

          <h2 className="text-[clamp(2rem,5.5vw,4.5rem)] font-extrabold tracking-[-0.035em] leading-[1.1] transition-all duration-500">
            {isCollapsed ? (
              <span className="text-[#00E58F] animate-pass-tick inline-block">
                1 run.
              </span>
            ) : (
              <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <span
                  className="transition-opacity duration-300"
                  style={{ opacity: scrollProgress > 0.1 ? 1 : 0.2 }}
                >
                  5 tools.
                </span>
                <span
                  className="transition-opacity duration-300"
                  style={{ opacity: scrollProgress > 0.2 ? 1 : 0.2 }}
                >
                  5 configs.
                </span>
                <span
                  className="text-[#F43F5E] transition-opacity duration-300"
                  style={{ opacity: scrollProgress > 0.3 ? 1 : 0.2 }}
                >
                  5 dashboards.
                </span>
              </span>
            )}
          </h2>

          <p className="mt-4 text-[16px] md:text-[18px] text-[#A29E94] font-normal max-w-xl mx-auto">
            {isCollapsed
              ? "Every check executed concurrently inside one containerized process. Zero context switching."
              : "Modern engineering teams juggle half a dozen disparate testing vendors. Build pipelines crawl and alerts fracture."}
          </p>
        </div>

        {/* Dynamic Convergence Arena: 5 tool chips pulled into ONE OmniTest Node */}
        <div className="relative w-full max-w-4xl mx-auto h-[420px] md:h-[480px] rounded-[6px] border border-white/[0.08] bg-[#12110E] p-4 flex items-center justify-center overflow-hidden">
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current text-white/10 z-0">
            {TOOLS.map((tool) => {
              // Current position interpolating toward center (50%, 50%)
              const currentX = isCollapsed ? 50 : tool.x;
              const currentY = isCollapsed ? 50 : tool.y;

              return (
                <line
                  key={tool.id}
                  x1={`${tool.x}%`}
                  y1={`${tool.y}%`}
                  x2="50%"
                  y2="50%"
                  stroke={isCollapsed ? "#00E58F" : "rgba(255,255,255,0.12)"}
                  strokeWidth={isCollapsed ? 1.5 : 1}
                  strokeDasharray={isCollapsed ? "none" : "4 4"}
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
          </svg>

          {/* Floating Tool Chips */}
          {TOOLS.map((tool) => {
            const offsetX = isCollapsed ? 0 : (tool.x - 50) * 3.4;
            const offsetY = isCollapsed ? 0 : (tool.y - 50) * 2.8;

            return (
              <div
                key={tool.id}
                className="absolute z-10 transition-all duration-700 ease-out font-mono select-none"
                style={{
                  transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${
                    isCollapsed ? 0.4 : 1
                  })`,
                  opacity: isCollapsed ? 0 : 1,
                  pointerEvents: isCollapsed ? "none" : "auto",
                }}
              >
                <div className="px-3.5 py-2 rounded-[6px] border border-white/[0.12] bg-[#161512] shadow-sm flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#F5F3EE]">
                      {tool.name}
                    </div>
                    <div className="text-[11px] text-[#6B675E] flex items-center gap-2">
                      <span>{tool.role}</span>
                      <span>•</span>
                      <span className="text-[#A29E94]">{tool.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Central OmniTest Node */}
          <div
            className={`relative z-20 transition-all duration-700 ease-out flex flex-col items-center select-none ${
              isCollapsed ? "scale-105" : "scale-90 opacity-60"
            }`}
          >
            <div className="relative p-6 rounded-[6px] border border-[#00E58F] bg-[#161512] flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-[6px] bg-[#00E58F] text-[#0E0D0B] font-mono font-black text-[22px] flex items-center justify-center">
                Ω
              </div>
              <div className="font-mono text-[16px] font-bold text-[#F5F3EE] tracking-tight">
                omnitest.config.ts
              </div>
              <div className="font-mono text-[12px] text-[#00E58F] flex items-center gap-1.5 uppercase font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
                <span>UNIFIED PIPELINE ACTIVE</span>
              </div>
            </div>

            {/* Spec details under node when collapsed */}
            <div
              className={`mt-4 font-mono text-[12px] text-[#A29E94] transition-all duration-500 text-center ${
                isCollapsed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              1 command • 1 configuration • 1 synchronized report
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
