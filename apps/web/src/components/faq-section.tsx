"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does OmniTest compare to Cypress Cloud or raw Playwright?",
      a: "Playwright is a premier open-source browser automation framework, but managing a scalable cloud worker grid, video encoding, interactive trace visualizers, artifact buckets, and multi-tenant teams is a massive engineering effort. Unlike Cypress Cloud which only covers UI tests and locks you into a proprietary runner, OmniTest orchestrates open-source Playwright, axe-core (accessibility), and Lighthouse (performance) under one roof, providing a single consolidated dashboard and PR gate.",
    },
    {
      q: "Do I have to rewrite my existing Playwright test scripts?",
      a: "No! OmniTest supports native Playwright specs out of the box. You can import your standard tests with zero changes, or install `@omnitest/playwright` to unlock auto-instrumented artifact capture, encrypted secret injection, and cloud worker distribution.",
    },
    {
      q: "How does OmniTest keep my staging secrets and environment variables safe?",
      a: "Project secrets and credentials are encrypted at rest using AES-256-GCM with hardware-backed encryption keys. Secrets are decrypted exclusively in-memory inside hardened, ephemeral container pods during test execution. Furthermore, our runner automatically scrubs known secret strings from all stdout logs, stderr dumps, and network HAR traces.",
    },
    {
      q: "Can I run tests against localhost or private staging VPCs?",
      a: "Yes. For local development, the OmniTest CLI runs against `http://localhost:3000` directly on your machine. For private VPCs and staging environments behind corporate firewalls, our Enterprise tier supports lightweight, self-hosted runner agents that execute inside your private cloud network.",
    },
    {
      q: "Which browsers and operating systems are supported?",
      a: "OmniTest provides headless Chromium, Firefox, and WebKit (Safari engine) running on Linux cloud workers. We support emulation for popular mobile and tablet viewports including iPhone 14/15, iPad Pro, and Google Pixel.",
    },
    {
      q: "Is there a free tier for open source and hobby projects?",
      a: "Yes! Our Developer tier is 100% free forever and includes 300 test execution minutes per month, 1 concurrent worker, and 7-day artifact retention. Verified open-source projects can also apply for boosted concurrency quotas.",
    },
  ];

  return (
    <section id="faq" className="py-24 relative bg-[#08090C] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to know.
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Have questions about architecture, security, or migration? We’ve got answers.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-xl glass-panel border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-brand-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
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
