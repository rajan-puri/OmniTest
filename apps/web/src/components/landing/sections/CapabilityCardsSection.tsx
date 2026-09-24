"use client";

import React from "react";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

interface CapabilityCardData {
  title: string;
  tag: string;
  gradient: string;
  desc: string;
  links: string[];
}

const CARDS: CapabilityCardData[] = [
  {
    title: "Core Web Vitals",
    tag: "Ready to use",
    gradient: "from-[#EAF6F1] via-[#F4FAF7] to-[#FBFAF7]",
    desc: "Track LCP, FID, and CLS automatically against Lighthouse 11 baseline budgets.",
    links: ["Lighthouse threshold audits", "Device emulation profiles"],
  },
  {
    title: "SEO Integrity",
    tag: "Ready to use",
    gradient: "from-[#EEF5FB] via-[#F5F9FD] to-[#FBFAF7]",
    desc: "Verify canonical link references, meta tags, and structured schemas before deployment.",
    links: ["Sitemap & robots crawler", "Schema.org validator"],
  },
  {
    title: "Transport Security",
    tag: "Ready to use",
    gradient: "from-[#FBF5EE] via-[#FDF9F5] to-[#FBFAF7]",
    desc: "Enforce Content-Security-Policy, HSTS, and CORS origin headers across environments.",
    links: ["OWASP header analyzer", "SSL handshake verification"],
  },
  {
    title: "Parallel Cloud Workers",
    tag: "Ready to use",
    gradient: "from-[#F3EEFB] via-[#F8F5FD] to-[#FBFAF7]",
    desc: "Spin up isolated headless microVMs on demand with sub-180ms initialization.",
    links: ["Chromium & WebKit matrix", "Auto-balancing queue"],
  },
  {
    title: "Forensic Artifacts",
    tag: "Ready to use",
    gradient: "from-[#EAF6F1] via-[#F3F9F6] to-[#FBFAF7]",
    desc: "Every run bundles full Playwright trace archives, HAR session logs, and 60fps video.",
    links: ["Trace viewer inspection", "Network request timeline"],
  },
  {
    title: "Smart Baselines",
    tag: "Ready to use",
    gradient: "from-[#FBF0F0] via-[#FDF7F7] to-[#FBFAF7]",
    desc: "Dynamic tolerance algorithms automatically differentiate pixel noise from regressions.",
    links: ["Subpixel threshold tuner", "Cross-OS font smoothing"],
  },
];

export const CapabilityCardsSection: React.FC = () => {
  return (
    <section
      id="capabilities"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#FBFAF7] text-[#0E1719] border-b border-[#E4E6E3]"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-wider mb-2">
            INTEGRATED CAPABILITIES
          </div>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05]">
            Modular tools. One unified pipeline.
          </h2>
          <p className="mt-3 text-[17px] text-[#5B6668]">
            Every capability integrates directly into your existing test runner.
            Enable what you need with zero configuration overhead.
          </p>
        </div>

        {/* 3 -> 2 -> 1 Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card, idx) => (
            <div
              key={idx}
              className={`rounded-[8px] border border-[#E4E6E3] p-6 bg-gradient-to-br ${card.gradient} mosaic-grid flex flex-col justify-between shadow-sm hover:border-[#0E9F6E]/40 transition-all duration-200`}
            >
              <div>
                {/* Header: Ready to use tag + Line icon */}
                <div className="flex items-center justify-between pb-4">
                  <span className="font-mono text-[11px] font-semibold text-[#0E1719] px-2.5 py-0.5 rounded-[4px] bg-white/90 border border-[#E4E6E3] shadow-xs">
                    {card.tag}
                  </span>
                  <div className="w-7 h-7 rounded-[4px] border border-[#E4E6E3] bg-white flex items-center justify-center text-[#5B6668]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-[20px] font-bold text-[#0E1719] tracking-tight mt-2">
                  {card.title}
                </h3>
                <p className="text-[14px] text-[#5B6668] leading-relaxed mt-2">
                  {card.desc}
                </p>
              </div>

              {/* Two link items each with an outline Explore button */}
              <div className="pt-6 mt-6 border-t border-[#E4E6E3]/60 space-y-3">
                {card.links.map((link, lIdx) => (
                  <div
                    key={lIdx}
                    className="flex items-center justify-between text-[13px] font-medium text-[#0E1719]"
                  >
                    <span className="truncate pr-2">{link}</span>
                    <Button
                      href="#chapters"
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-[30px] min-h-[30px] px-2.5 font-mono"
                    >
                      Explore
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
