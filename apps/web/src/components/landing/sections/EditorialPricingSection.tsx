"use client";

import React, { useState } from "react";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

export const EditorialPricingSection: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#F8F7F2] text-[#0E1719] border-b border-[#E4E6E3]"
    >
      <Container>
        {/* Header & Annual Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-wider mb-2">
              TRANSPARENT CLOUD PRICING
            </div>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05]">
              Predictable costs. Zero seat tax.
            </h2>
            <p className="mt-3 text-[17px] text-[#5B6668] max-w-xl">
              Pay for concurrent cloud worker capacity, never for the number of
              engineers reviewing pull request assertions.
            </p>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center p-1 rounded-[6px] border border-[#E4E6E3] bg-white font-mono text-[13px] self-start">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-[4px] transition-all min-h-[44px] ${
                !annual ? "bg-[#0E1719] text-white font-bold" : "text-[#5B6668]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-[4px] transition-all flex items-center gap-2 min-h-[44px] ${
                annual ? "bg-[#0E9F6E] text-white font-bold" : "text-[#5B6668]"
              }`}
            >
              <span>Annual</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-[3px] bg-white/20 text-white font-semibold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Developer $0 */}
          <div className="rounded-[8px] border border-[#E4E6E3] bg-white p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="font-mono text-[12px] font-bold text-[#5B6668] uppercase tracking-wider">
                DEVELOPER
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-[44px] font-extrabold text-[#0E1719] tracking-tight">
                  $0
                </span>
                <span className="text-[14px] text-[#5B6668]">forever</span>
              </div>
              <p className="text-[14px] text-[#5B6668] mt-2">
                Free forever for individual engineers and open source contributors.
              </p>

              <div className="mt-8 pt-6 border-t border-[#E4E6E3] space-y-3 font-mono text-[13px]">
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>2 parallel cloud workers</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>500 execution minutes / mo</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>7-day trace &amp; video retention</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>Community GitHub support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E4E6E3]">
              <Button href="/dashboard" variant="outline" size="md" className="w-full">
                Start free
              </Button>
            </div>
          </div>

          {/* Team Pro $39/mo (Highlighted with Brand Outline) */}
          <div className="rounded-[8px] border-2 border-[#0E9F6E] bg-white p-8 flex flex-col justify-between shadow-md relative">
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-[4px] bg-[#0E9F6E] text-white font-mono text-[11px] font-bold uppercase tracking-wider">
              MOST POPULAR
            </div>

            <div>
              <div className="font-mono text-[12px] font-bold text-[#0E9F6E] uppercase tracking-wider">
                TEAM PRO
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-[44px] font-extrabold text-[#0E1719] tracking-tight">
                  ${annual ? "39" : "49"}
                </span>
                <span className="text-[14px] text-[#5B6668]">/ month</span>
              </div>
              <p className="text-[14px] text-[#5B6668] mt-2">
                For growing engineering teams accelerating PR test suites.
              </p>

              <div className="mt-8 pt-6 border-t border-[#E4E6E3] space-y-3 font-mono text-[13px]">
                <div className="flex items-center gap-2.5 text-[#0E1719] font-medium">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>8 parallel cloud workers</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719] font-medium">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>10,000 execution minutes / mo</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719] font-medium">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>60-day trace &amp; video retention</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719] font-medium">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>Automated flake quarantine</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719] font-medium">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>4-hour priority Slack SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E4E6E3]">
              <Button href="/dashboard" variant="primary" size="md" className="w-full">
                Upgrade to Pro
              </Button>
            </div>
          </div>

          {/* Enterprise Custom */}
          <div className="rounded-[8px] border border-[#E4E6E3] bg-white p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="font-mono text-[12px] font-bold text-[#5B6668] uppercase tracking-wider">
                ENTERPRISE
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-[44px] font-extrabold text-[#0E1719] tracking-tight">
                  Custom
                </span>
              </div>
              <p className="text-[14px] text-[#5B6668] mt-2">
                Dedicated infrastructure, compliance guarantees, and custom SLAs.
              </p>

              <div className="mt-8 pt-6 border-t border-[#E4E6E3] space-y-3 font-mono text-[13px]">
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>Unlimited dedicated cloud workers</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>Custom execution minute pools</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>365-day retention or BYO AWS S3</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>SOC 2 Type II &amp; HIPAA compliance</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#0E1719]">
                  <span className="text-[#0E9F6E] font-bold">✓</span>
                  <span>Dedicated architect &amp; 99.99% uptime</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E4E6E3]">
              <Button href="/dashboard" variant="outline" size="md" className="w-full">
                Contact sales
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
