"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I run existing Playwright test files directly in OmniTest?",
      a: "Yes. OmniTest uses standard Playwright syntax and requires zero proprietary file conversions. You can point the CLI to your current tests directory immediately. Adding the optional @omnitest/playwright package unlocks automated cloud worker distribution and synchronized forensic artifact streaming.",
    },
    {
      q: "How does OmniTest handle secrets and environment variables?",
      a: "Secrets are encrypted with hardware-backed AES-256-GCM. They are loaded exclusively into worker RAM during execution and automatically scrubbed from stdout, stderr, and network HAR recordings before artifacts are uploaded to S3.",
    },
    {
      q: "How does the visual regression engine prevent flaky false positives?",
      a: "We use Pixelmatch with configurable color tolerance, anti-aliasing detection, and automated dynamic element masking (for timestamps and avatars). You can test across Chromium, Firefox, and WebKit viewports with sub-pixel precision.",
    },
    {
      q: "Can I test internal endpoints on localhost or inside private corporate VPCs?",
      a: "Yes. For local development, the CLI runs against localhost:3000 directly on your machine. For staging environments behind firewalls, lightweight self-hosted runner agents execute queries directly within your private network.",
    },
    {
      q: "How fast do headless cloud worker pods boot?",
      a: "OmniTest maintains warm container pools with snapshot caching, giving workers typical boot times under 180ms. Jobs are dispatched via BullMQ with zero Docker host maintenance on your part.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative py-24 bg-[#0E0D0B] border-b border-white/[0.08]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:pr-52">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1D1B17] border border-white/[0.1] text-xs font-mono text-[#F5F3EE] mb-4">
            <span>TECHNICAL SPECIFICATIONS</span>
          </div>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold tracking-[-0.035em] text-[#F5F3EE] leading-[1.05]">
            Frequently answered questions.
          </h2>
        </div>

        {/* Minimal Large-Type Accordion */}
        <div className="space-y-3 font-mono">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-lg bg-[#161512] border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans text-base sm:text-lg font-semibold text-[#F5F3EE]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#00E58F]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#A29E94] leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
