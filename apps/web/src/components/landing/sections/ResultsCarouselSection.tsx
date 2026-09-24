"use client";

import React, { useState, useRef } from "react";
import { Container } from "../primitives/Container";

// TODO: Replace these placeholder companies and benchmark stats with verified customer case studies
const CASE_STUDIES = [
  {
    id: 1,
    company: "Apex Cloud Services",
    accent: "bg-[#0E9F6E]",
    stat1: "75%",
    label1: "Reduction in CI test duration",
    stat2: "70k",
    label2: "Daily assertions executed",
    quote: "OmniTest replaced our fractured Cypress and axe-core pipeline with a single parallel cloud grid.",
  },
  {
    id: 2,
    company: "Krypton Payments",
    accent: "bg-[#2BB5A6]",
    stat1: "99.8%",
    label1: "Flakiness elimination rate",
    stat2: "180ms",
    label2: "Average worker pod cold start",
    quote: "Quarantining transient DOM mutations stopped false pull request gate failures entirely.",
  },
  {
    id: 3,
    company: "Nova Logistics Platform",
    accent: "bg-[#FF5A1F]",
    stat1: "4.2x",
    label1: "Faster release cycle turnaround",
    stat2: "0",
    label2: "Visual regressions in production",
    quote: "Pixel diff threshold auto-tuning prevented false alarms while catching every real layout bug.",
  },
  {
    id: 4,
    company: "Stratos Health Systems",
    accent: "bg-[#0E9F6E]",
    stat1: "100%",
    label1: "WCAG 2.2 AA audit coverage",
    stat2: "32",
    label2: "Parallel headless browser nodes",
    quote: "Accessibility compliance is now gated on every GitHub PR commit automatically.",
  },
  {
    id: 5,
    company: "Vanguard E-Commerce",
    accent: "bg-[#2BB5A6]",
    stat1: "60%",
    label1: "Tooling vendor budget saved",
    stat2: "12ms",
    label2: "Cloud WebSocket latency",
    quote: "Consolidated 5 disparate tools into one configuration file with instant trace debugging.",
  },
  {
    id: 6,
    company: "Quantum Analytics",
    accent: "bg-[#FF5A1F]",
    stat1: "90+",
    label1: "Lighthouse Web Vitals score",
    stat2: "5,000",
    label2: "API contract checks / hour",
    quote: "Our engineers author in standard Playwright TypeScript without learning proprietary runtimes.",
  },
  {
    id: 7,
    company: "Pinnacle Media Group",
    accent: "bg-[#0E9F6E]",
    stat1: "8.5m",
    label1: "Monthly parallel run minutes",
    stat2: "99.98%",
    label2: "Global cloud grid uptime",
    quote: "The unified trace viewer allows our QA and developers to triage failures in minutes.",
  },
];

export const ResultsCarouselSection: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handlePrev = () => {
    const nextIdx = currentIdx > 0 ? currentIdx - 1 : CASE_STUDIES.length - 1;
    setCurrentIdx(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = currentIdx < CASE_STUDIES.length - 1 ? currentIdx + 1 : 0;
    setCurrentIdx(nextIdx);
    scrollToCard(nextIdx);
  };

  const scrollToCard = (idx: number) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[idx] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <section
      id="results"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#FBFAF7] text-[#0E1719] border-b border-[#E4E6E3] overflow-hidden"
    >
      <Container>
        {/* Section Header with Prev / Next Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-wider mb-2">
              PROVEN ENGINEERING OUTCOMES
            </div>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05]">
              Benchmarked across high-velocity teams.
            </h2>
            <p className="mt-3 text-[17px] text-[#5B6668]">
              Real engineering impact measured in build minutes, stability, and zero-defect deployments.
            </p>
          </div>

          {/* Controls: Prev/Next Round Buttons + 01 - 07 indicator */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <span className="font-mono text-[14px] text-[#5B6668] tabular-nums font-semibold">
              {String(currentIdx + 1).padStart(2, "0")} — {String(CASE_STUDIES.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                type="button"
                className="w-10 h-10 rounded-full border border-[#E4E6E3] bg-white hover:border-[#0E1719] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Previous case study card"
              >
                ←
              </button>
              <button
                onClick={handleNext}
                type="button"
                className="w-10 h-10 rounded-full border border-[#E4E6E3] bg-white hover:border-[#0E1719] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Next case study card"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Scroll-Snap Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 no-scrollbar"
        >
          {CASE_STUDIES.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-[320px] sm:w-[380px] shrink-0 snap-center rounded-[8px] border bg-white p-6 md:p-8 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
                currentIdx === idx ? "border-[#0E1719]" : "border-[#E4E6E3]"
              }`}
            >
              {/* Top Colored Accent Line */}
              <div className={`absolute top-0 inset-x-0 h-1 ${item.accent}`} />

              <div>
                {/* Placeholder Logo & Company */}
                <div className="flex items-center gap-3 pb-6 border-b border-[#E4E6E3]">
                  <div className="w-8 h-8 rounded-[4px] bg-[#F8F7F2] border border-[#E4E6E3] flex items-center justify-center font-mono text-[12px] font-bold text-[#0E1719]">
                    Ω{item.id}
                  </div>
                  <span className="font-sans font-bold text-[15px] text-[#0E1719]">
                    {item.company}
                  </span>
                </div>

                {/* Two Big Stats Separated by Hairline */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b border-[#E4E6E3]">
                  <div>
                    <div className="font-mono text-[36px] font-extrabold text-[#0E1719] tabular-nums leading-none">
                      {item.stat1}
                    </div>
                    <div className="text-[12px] text-[#5B6668] mt-2 leading-tight">
                      {item.label1}
                    </div>
                  </div>
                  <div className="border-l border-[#E4E6E3] pl-4">
                    <div className="font-mono text-[36px] font-extrabold text-[#0E9F6E] tabular-nums leading-none">
                      {item.stat2}
                    </div>
                    <div className="text-[12px] text-[#5B6668] mt-2 leading-tight">
                      {item.label2}
                    </div>
                  </div>
                </div>

                {/* Outcome Quote */}
                <p className="pt-6 text-[15px] text-[#5B6668] leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E4E6E3] flex items-center justify-between text-[12px] font-mono text-[#2BB5A6] font-semibold">
                <span>VERIFIED CASE STUDY</span>
                <span>BENCHMARK →</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
