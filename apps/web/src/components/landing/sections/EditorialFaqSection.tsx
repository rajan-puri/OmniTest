"use client";

import React, { useState } from "react";
import { Container } from "../primitives/Container";

const FAQS = [
  {
    q: "Can I import existing Playwright or Cypress test suites?",
    a: "Yes. OmniTest is built natively on standard Playwright primitives. You can run your existing test files without changes. For Cypress users, our CLI includes an automated migration codemod that maps cy commands to Playwright page assertions.",
  },
  {
    q: "How does the visual diff engine prevent cross-browser rendering noise?",
    a: "Every visual snapshot executes inside deterministic Linux microVMs configured with identical subpixel rendering engines, font libraries, and viewport coordinates. Intelligent thresholding filters minor anti-aliasing variations automatically.",
  },
  {
    q: "How does cloud worker allocation achieve sub-180ms initialization?",
    a: "We maintain pre-warmed, sandboxed browser pods globally. When your CI triggers a run, a WebSocket connection attaches instantly to an idle worker container, bypassing the multi-minute container image pull overhead of standard CI setups.",
  },
  {
    q: "How does flake suppression work without masking genuine regressions?",
    a: "OmniTest uses historical telemetry heuristics. When an assertion fails, the engine analyzes DOM mutation logs, render times, and network latency. If the failure matches an ephemeral timing spike, it is quarantined for review while allowing clean PR gates to proceed.",
  },
  {
    q: "Can OmniTest run tests against private staging VPCs?",
    a: "Yes. We offer secure tunneling via our CLI daemon as well as dedicated VPC peering for Enterprise clusters, allowing your tests to target internal staging environments with zero exposure to the public internet.",
  },
  {
    q: "What accessibility standards are verified during execution?",
    a: "OmniTest embeds the latest axe-core engine to test against WCAG 2.0, 2.1, and 2.2 Levels A, AA, and Section 508 guidelines, checking color contrast, aria labels, keyboard navigation, and form element landmarks.",
  },
];

export const EditorialFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#FBFAF7] text-[#0E1719] border-b border-[#E4E6E3]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Sticky Heading */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-wider">
                COMMON QUESTIONS
              </div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.08]">
                Frequently asked engineering questions.
              </h2>
              <p className="text-[17px] text-[#5B6668] leading-relaxed">
                Have architectural questions or custom security requirements? Read our{" "}
                <a href="#docs" className="text-[#0E9F6E] underline hover:text-[#0B855C]">
                  documentation
                </a>{" "}
                or chat with our systems engineers.
              </p>
            </div>
          </div>

          {/* Right Column: Large-Type Accordion */}
          <div className="lg:col-span-7 divide-y divide-[#E4E6E3] border-y border-[#E4E6E3]">
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
                    <span className="text-[18px] md:text-[20px] font-bold text-[#0E1719] group-hover:text-[#0E9F6E] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-[4px] border border-[#E4E6E3] bg-white flex items-center justify-center font-mono text-[14px] text-[#5B6668] group-hover:border-[#0E1719] transition-all shrink-0 ${
                        isOpen ? "bg-[#0E9F6E] text-white border-[#0E9F6E]" : ""
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-4 text-[16px] text-[#5B6668] leading-relaxed font-sans pr-6">
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
