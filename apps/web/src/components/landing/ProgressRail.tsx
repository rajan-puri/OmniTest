"use client";

import React, { useEffect, useState } from "react";

export type RailStepState = "QUEUED" | "RUNNING" | "PASSED";

interface RailStep {
  id: string;
  sectionId: string;
  label: string;
  stepNum: string;
}

const STEPS: RailStep[] = [
  { id: "connect", sectionId: "hero", label: "Connect", stepNum: "01" },
  { id: "author", sectionId: "action-intro", label: "Author", stepNum: "02" },
  { id: "execute", sectionId: "chapters", label: "Execute", stepNum: "03" },
  { id: "verify", sectionId: "features", label: "Verify", stepNum: "04" },
  { id: "pass", sectionId: "dashboard", label: "Pass", stepNum: "05" },
];

export const ProgressRail: React.FC = () => {
  const [stepStates, setStepStates] = useState<Record<string, RailStepState>>({
    connect: "RUNNING",
    author: "QUEUED",
    execute: "QUEUED",
    verify: "QUEUED",
    pass: "QUEUED",
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const positions = STEPS.map((step) => {
        const el = document.getElementById(step.sectionId);
        if (!el) return { ...step, top: Infinity, bottom: -Infinity };
        const rect = el.getBoundingClientRect();
        return {
          ...step,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
        };
      });

      const newStates: Record<string, RailStepState> = {
        connect: "QUEUED",
        author: "QUEUED",
        execute: "QUEUED",
        verify: "QUEUED",
        pass: "QUEUED",
      };

      let highestIndex = 0;

      positions.forEach((pos, index) => {
        if (pos.bottom < viewportHeight * 0.25) {
          newStates[pos.id] = "PASSED";
          highestIndex = Math.max(highestIndex, index + 1);
        } else if (pos.top <= viewportHeight * 0.65 && pos.bottom >= viewportHeight * 0.25) {
          newStates[pos.id] = "RUNNING";
          highestIndex = Math.max(highestIndex, index);
        }
      });

      if (scrollY < 100) {
        newStates["connect"] = "RUNNING";
        highestIndex = 0;
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 150) {
        STEPS.forEach((s) => {
          newStates[s.id] = "PASSED";
        });
        highestIndex = STEPS.length - 1;
      }

      setStepStates(newStates);
      setActiveStepIndex(Math.min(highestIndex, STEPS.length - 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Mobile Top Progress Bar (< 768px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#FBFAF7]/95 backdrop-blur-md border-b border-[#E4E6E3] px-3 py-1.5 flex items-center justify-between font-mono text-[11px] tabular-nums select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
          <span className="text-[#5B6668]">TEST PIPELINE:</span>
          <span className="text-[#0E9F6E] font-bold">
            {STEPS[activeStepIndex]?.label.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((step) => {
            const state = stepStates[step.id];
            return (
              <button
                key={step.id}
                onClick={() => scrollToSection(step.sectionId)}
                className={`w-5 h-1.5 rounded-[2px] transition-all duration-300 ${
                  state === "PASSED"
                    ? "bg-[#0E9F6E]"
                    : state === "RUNNING"
                    ? "bg-[#FF5A1F] animate-pulse"
                    : "bg-[#E4E6E3]"
                }`}
                aria-label={`Jump to ${step.label} (${state})`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop Fixed Slim Rail (>= 1280px) */}
      <aside
        className="hidden xl:flex fixed right-4 2xl:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-3 bg-white/95 backdrop-blur-md rounded-[8px] border border-[#E4E6E3] font-mono select-none shadow-sm"
        aria-label="Execution pipeline rail"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#E4E6E3] text-[10px] text-[#5B6668] tracking-widest uppercase">
          <span>PIPELINE</span>
          <span className="text-[#0E9F6E] font-bold">LIVE</span>
        </div>

        <div className="flex flex-col gap-1 pt-1">
          {STEPS.map((step) => {
            const state = stepStates[step.id];
            const isPassed = state === "PASSED";
            const isRunning = state === "RUNNING";

            return (
              <button
                key={step.id}
                onClick={() => scrollToSection(step.sectionId)}
                className={`group flex items-center justify-between gap-4 px-2.5 py-1.5 rounded-[4px] text-left transition-all text-[12px] tabular-nums border ${
                  isRunning
                    ? "bg-[#FFF6F2] border-[#FF5A1F]/30 text-[#0E1719]"
                    : isPassed
                    ? "bg-transparent border-transparent text-[#0E1719] hover:bg-[#F8F7F2]"
                    : "bg-transparent border-transparent text-[#5B6668]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isPassed
                        ? "bg-[#0E9F6E]"
                        : isRunning
                        ? "bg-[#FF5A1F] animate-pulse"
                        : "bg-[#E4E6E3]"
                    }`}
                  />
                  <span className="font-mono text-[11px] text-[#5B6668]">
                    {step.stepNum}
                  </span>
                  <span className="font-medium">{step.label}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider font-semibold">
                  {isPassed ? (
                    <span className="text-[#0E9F6E] flex items-center gap-1 animate-pass-tick">
                      <svg
                        className="w-3 h-3 text-[#0E9F6E]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      PASS
                    </span>
                  ) : isRunning ? (
                    <span className="text-[#FF5A1F]">RUN</span>
                  ) : (
                    <span className="text-[#5B6668]">WAIT</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
