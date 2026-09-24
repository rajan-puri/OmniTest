"use client";

import React, { useState } from "react";
import { Container } from "../primitives/Container";

const FAQS = [
  {
    q: "How does OmniTest execute 5 test categories in a single run?",
    a: "During the execution lifecycle, our headless orchestrator intercepts DOM states and network events in memory. Rather than running separate test suites that each boot a fresh browser, OmniTest collects E2E workflow assertions, axe-core accessibility audits, visual snapshots, and Lighthouse telemetry simultaneously in each worker pod.",
  },
  {
    q: "Is OmniTest compatible with existing Playwright test suites?",
    a: "Yes. OmniTest is built on top of the native Playwright engine. You can import existing Playwright specs without modification. OmniTest extends standard page objects with zero-config visual diffs, accessibility assertions, and automated cloud orchestration.",
  },
  {
    q: "How does the visual diff engine prevent cross-platform rendering false positives?",
    a: "Snapshots are captured inside deterministic Linux container pods configured with identical font packages, subpixel rendering settings, and fixed virtual viewports. This eliminates anti-aliasing discrepancies between macOS, Windows, and CI runners.",
  },
  {
    q: "How does heuristic flake quarantine prevent CI blocking?",
    a: "When a test failure occurs, OmniTest analyzes historical DOM mutation timings and network latency logs. If the failure matches known transient jitter heuristics, the run is quarantined for telemetry review while allowing non-flaky PR gates to proceed cleanly.",
  },
  {
    q: "Can I run OmniTest offline in local terminal workflows?",
    a: "Yes. The @omnitest/cli runs entirely offline on your local machine using standard local Chromium, Firefox, or WebKit instances. Cloud worker allocation is only activated when passing the --cloud or --ci flags.",
  },
  {
    q: "What is the typical cloud worker pod cold-boot latency?",
    a: "OmniTest maintains pre-warmed container microVMs across global edge regions. Pod allocation and WebSocket handshake typically complete in under 180ms, eliminating the 2-minute container pull delays typical of traditional CI matrices.",
  },
];

export const PrecisionFaq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Sticky Heading */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#F5F3EE] leading-[1.08]">
                Everything you need to know about OmniTest.
              </h2>
              <p className="text-[17px] text-[#A29E94] leading-relaxed">
                Have specific infrastructure or compliance requirements? Read our{" "}
                <a href="#dashboard" className="text-[#00E58F] underline hover:text-white">
                  developer documentation
                </a>{" "}
                or contact our systems engineering team.
              </p>
            </div>
          </div>

          {/* Right Column: Large-Type Accordion */}
          <div className="lg:col-span-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => toggle(idx)}
                    type="button"
                    className="w-full min-h-[44px] flex items-center justify-between gap-4 text-left group focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[18px] md:text-[20px] font-bold text-[#F5F3EE] group-hover:text-[#00E58F] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-[4px] border border-white/[0.12] bg-[#161512] flex items-center justify-center font-mono text-[14px] text-[#A29E94] group-hover:border-white/[0.3] transition-all shrink-0 ${
                        isOpen ? "bg-[#00E58F] text-[#0E0D0B] border-[#00E58F]" : ""
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-4 text-[15px] md:text-[16px] text-[#A29E94] leading-relaxed font-sans pr-6">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
