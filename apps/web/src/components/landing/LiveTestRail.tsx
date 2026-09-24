"use client";

import React, { useEffect, useState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";

export interface TestStep {
  id: string;
  name: string;
  targetId: string;
}

const STEPS: TestStep[] = [
  { id: "step-01", name: "hero.selector", targetId: "hero" },
  { id: "step-02", name: "problem.collapse", targetId: "problem" },
  { id: "step-03", name: "exec.waterfall", targetId: "pipeline" },
  { id: "step-04", name: "diff.pixelmatch", targetId: "visual-diff" },
  { id: "step-05", name: "fleet.matrix", targetId: "quality-fleet" },
  { id: "step-06", name: "workflow.ci", targetId: "workflow" },
  { id: "step-07", name: "dashboard.trace", targetId: "dashboard" },
  { id: "step-08", name: "assert.ready", targetId: "pricing" },
];

export function LiveTestRail() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [passedSteps, setPassedSteps] = useState<Record<number, boolean>>({});
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      setScrollProgress(progress);

      let currentIdx = 0;
      for (let i = 0; i < STEPS.length; i++) {
        const el = document.getElementById(STEPS[i].targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            currentIdx = i;
          }
        }
      }

      setActiveStepIndex(currentIdx);

      setPassedSteps((prev) => {
        const next: Record<number, boolean> = { ...prev };
        for (let i = 0; i < currentIdx; i++) {
          next[i] = true;
        }
        return next;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalPassed = Object.keys(passedSteps).length;
  const currentStep = STEPS[activeStepIndex] || STEPS[0];

  return (
    <>
      {/* 1. Mobile & Tablet Slim Top Progress Bar (< 1280px) */}
      <div className="sticky top-0 left-0 right-0 z-50 xl:hidden bg-[#0E0D0B] border-b border-white/[0.08]">
        <div className="flex items-center justify-between px-3.5 py-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
            <span className="text-zinc-400">
              STEP 0{activeStepIndex + 1}/08
            </span>
            <span className="text-[#F5F3EE] font-semibold truncate max-w-[140px]">
              {currentStep.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00E58F] font-semibold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{totalPassed}/8 PASSED</span>
          </div>
        </div>
        {/* Progress fill bar */}
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div
            className="h-full bg-[#00E58F] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Desktop Fixed Side Telemetry Rail (>= 1280px) */}
      <aside
        aria-label="Live Test Run Progress Rail"
        className="hidden xl:flex fixed right-4 2xl:right-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-3 rounded-lg bg-[#161512]/95 border border-white/[0.1] backdrop-blur-md shadow-2xl w-[185px] font-mono text-xs select-none"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F] animate-pulse" />
            <span className="font-semibold text-zinc-200">LIVE SUITE</span>
          </div>
          <span className="text-[#00E58F] font-bold">{Math.round(scrollProgress * 100)}%</span>
        </div>

        <div className="space-y-0.5 py-1">
          {STEPS.map((step, idx) => {
            const isPassed = passedSteps[idx];
            const isCurrent = idx === activeStepIndex && !isPassed;

            return (
              <a
                key={step.id}
                href={`#${step.targetId}`}
                className={`group flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors ${
                  isCurrent
                    ? "bg-white/[0.08] text-[#F5F3EE] font-medium"
                    : isPassed
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-zinc-500 font-medium">
                    0{idx + 1}
                  </span>
                  <span className="truncate">{step.name}</span>
                </div>

                <div className="shrink-0 ml-1.5">
                  {isPassed ? (
                    <span className="text-[#00E58F] flex items-center gap-0.5 animate-pass-tick">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 text-[#38BDF8] animate-spin" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 text-zinc-700" />
                  )}
                </div>
              </a>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
          <span>PIPELINE: 8 STEPS</span>
          <span className="text-[#00E58F] font-semibold">
            {totalPassed}/8 OK
          </span>
        </div>
      </aside>
    </>
  );
}
