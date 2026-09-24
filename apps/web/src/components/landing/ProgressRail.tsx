"use client";

import React, { useEffect, useState } from "react";

export type StepState = "QUEUED" | "RUNNING" | "PASSED";

interface StepItem {
  id: string;
  sectionId: string;
  label: string;
  stepNum: string;
}

const STEPS: StepItem[] = [
  { id: "connect", sectionId: "hero", label: "Connect", stepNum: "01" },
  { id: "e2e", sectionId: "how-it-works", label: "E2E", stepNum: "02" },
  { id: "visual", sectionId: "visual-regression", label: "Visual", stepNum: "03" },
  { id: "assertions", sectionId: "capabilities", label: "Assertions", stepNum: "04" },
  { id: "pass", sectionId: "dashboard", label: "Pass", stepNum: "05" },
];

export const ProgressRail: React.FC = () => {
  const [stepStates, setStepStates] = useState<Record<string, StepState>>({
    connect: "RUNNING",
    e2e: "QUEUED",
    visual: "QUEUED",
    assertions: "QUEUED",
    pass: "QUEUED",
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Check positions of target sections
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

      const newStates: Record<string, StepState> = {
        connect: "QUEUED",
        e2e: "QUEUED",
        visual: "QUEUED",
        assertions: "QUEUED",
        pass: "QUEUED",
      };
      let highestPassedOrRunningIndex = 0;

      positions.forEach((pos, index) => {
        // If the section's top is well past the viewport top, it has passed
        if (pos.bottom < viewportHeight * 0.25) {
          newStates[pos.id] = "PASSED";
          highestPassedOrRunningIndex = Math.max(highestPassedOrRunningIndex, index + 1);
        } else if (pos.top <= viewportHeight * 0.65 && pos.bottom >= viewportHeight * 0.25) {
          newStates[pos.id] = "RUNNING";
          highestPassedOrRunningIndex = Math.max(highestPassedOrRunningIndex, index);
        } else {
          // If previous is passed, this is queued
          newStates[pos.id] = "QUEUED";
        }
      });

      // Special case: at top of page, Connect is RUNNING
      if (scrollY < 100) {
        newStates["connect"] = "RUNNING";
        newStates["e2e"] = "QUEUED";
        newStates["visual"] = "QUEUED";
        newStates["assertions"] = "QUEUED";
        newStates["pass"] = "QUEUED";
        highestPassedOrRunningIndex = 0;
      }

      // If at bottom of page, all are passed
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 150) {
        STEPS.forEach((s) => {
          newStates[s.id] = "PASSED";
        });
        highestPassedOrRunningIndex = STEPS.length - 1;
      }

      setStepStates(newStates);
      setActiveStepIndex(Math.min(highestPassedOrRunningIndex, STEPS.length - 1));
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
      {/* Mobile & Tablet Top Progress Bar (< 1280px) */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-50 bg-[#0E0D0B]/95 backdrop-blur-md border-b border-white/[0.08] px-3 py-1.5 flex items-center justify-between font-mono text-[11px] tabular-nums">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F] animate-pulse" />
          <span className="text-[#A29E94]">TEST SUITE:</span>
          <span className="text-[#00E58F] font-semibold">
            {STEPS[activeStepIndex]?.label.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((step, idx) => {
            const state = stepStates[step.id];
            return (
              <button
                key={step.id}
                onClick={() => scrollToSection(step.sectionId)}
                className={`w-5 h-1.5 rounded-[2px] transition-all duration-300 ${
                  state === "PASSED"
                    ? "bg-[#00E58F]"
                    : state === "RUNNING"
                    ? "bg-[#F59E0B] animate-pulse"
                    : "bg-white/[0.12]"
                }`}
                aria-label={`Jump to ${step.label} (${state})`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop Fixed Slim Rail (>= 1280px) */}
      <aside
        className="hidden xl:flex fixed right-4 2xl:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-3 bg-[#161512]/90 backdrop-blur-md rounded-[6px] border border-white/[0.08] font-mono select-none"
        aria-label="Test suite progress rail"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[10px] text-[#6B675E] tracking-widest uppercase">
          <span>PIPELINE</span>
          <span className="text-[#00E58F] font-bold">LIVE</span>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
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
                    ? "bg-[#1D1B17] border-[#F59E0B]/30 text-[#F5F3EE]"
                    : isPassed
                    ? "bg-transparent border-transparent text-[#A29E94] hover:text-[#F5F3EE]"
                    : "bg-transparent border-transparent text-[#6B675E]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isPassed
                        ? "bg-[#00E58F]"
                        : isRunning
                        ? "bg-[#F59E0B] animate-pulse"
                        : "bg-[#6B675E]"
                    }`}
                  />
                  <span className="font-mono text-[11px] text-[#6B675E] group-hover:text-[#A29E94]">
                    {step.stepNum}
                  </span>
                  <span className="font-medium">{step.label}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider font-semibold">
                  {isPassed ? (
                    <span className="text-[#00E58F] flex items-center gap-1 animate-pass-tick">
                      <svg
                        className="w-3 h-3 text-[#00E58F]"
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
                    <span className="text-[#F59E0B]">RUN</span>
                  ) : (
                    <span className="text-[#6B675E]">WAIT</span>
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
