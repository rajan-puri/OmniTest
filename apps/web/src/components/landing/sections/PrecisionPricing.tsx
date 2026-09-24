"use client";

import React, { useState } from "react";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

interface PlanFeature {
  name: string;
  dev: string;
  team: string;
  enterprise: string;
}

const COMPARISON_ROWS: PlanFeature[] = [
  {
    name: "Parallel Cloud Workers",
    dev: "2 isolated pods",
    team: "8 isolated pods",
    enterprise: "Unlimited (custom)",
  },
  {
    name: "Execution Minutes / Mo",
    dev: "500 mins",
    team: "10,000 mins",
    enterprise: "Unlimited dedicated",
  },
  {
    name: "Visual Diff Snapshots",
    dev: "250 / mo",
    team: "5,000 / mo",
    enterprise: "Unlimited snapshots",
  },
  {
    name: "Test Engines Included",
    dev: "All (E2E, A11y, API, CWV)",
    team: "All (E2E, A11y, API, CWV)",
    enterprise: "All + Custom plugins",
  },
  {
    name: "Artifact & Trace Retention",
    dev: "7 days",
    team: "60 days",
    enterprise: "365 days / BYO S3",
  },
  {
    name: "Flakiness Auto-Quarantine",
    dev: "Standard heuristics",
    team: "Advanced quarantine",
    enterprise: "Custom rules & bypass",
  },
  {
    name: "CI/CD & GitHub PR Checks",
    dev: "Included",
    team: "Included (Priority)",
    enterprise: "Self-hosted runner gate",
  },
  {
    name: "Support & SLA",
    dev: "Community GitHub",
    team: "4-hour Slack & Email",
    enterprise: "Dedicated Architect & 99.99%",
  },
];

export const PrecisionPricing: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08]"
    >
      <Container>
        {/* Header and Billing Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
              <span>TRANSPARENT PRICING</span>
            </div>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold tracking-tight text-[#F5F3EE] leading-[1.05]">
              Predictable cloud compute.
            </h2>
            <p className="mt-3 text-[17px] text-[#A29E94] max-w-xl">
              Zero seat tax. Pay for the parallel execution workers your CI demands,
              not the number of engineers on your GitHub team.
            </p>
          </div>

          {/* Billing Frequency Toggle */}
          <div className="flex items-center p-1 rounded-[6px] border border-white/[0.12] bg-[#161512] font-mono text-[13px] self-start select-none">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-[4px] transition-all min-h-[44px] ${
                !annual
                  ? "bg-[#1D1B17] text-[#F5F3EE] font-bold"
                  : "text-[#A29E94] hover:text-[#F5F3EE]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-[4px] transition-all flex items-center gap-2 min-h-[44px] ${
                annual
                  ? "bg-[#00E58F] text-[#0E0D0B] font-bold"
                  : "text-[#A29E94] hover:text-[#F5F3EE]"
              }`}
            >
              <span>Annual</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-[3px] bg-black/20 text-[#0E0D0B] font-semibold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Comparison Table (Not Cards) */}
        <div className="w-full overflow-x-auto rounded-[6px] border border-white/[0.08] bg-[#161512]">
          <table className="w-full text-left font-mono border-collapse min-w-[720px]">
            {/* Table Header: Tiers & Huge Prices */}
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#1D1B17]">
                <th className="p-6 w-1/4 align-bottom">
                  <div className="text-[12px] text-[#8E8A80] uppercase tracking-wider font-semibold">
                    CLUSTER SPECS
                  </div>
                  <div className="text-[14px] text-[#A29E94] font-normal mt-1">
                    All plans include full testing suite
                  </div>
                </th>

                {/* Developer $0 */}
                <th className="p-6 w-1/4 align-bottom border-l border-white/[0.08]">
                  <div className="text-[13px] text-[#A29E94] font-semibold uppercase">
                    Developer
                  </div>
                  <div className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold text-[#F5F3EE] tracking-tight leading-none mt-2">
                    $0
                  </div>
                  <div className="text-[12px] text-[#8E8A80] mt-2 font-normal">
                    Free forever for individuals &amp; OSS
                  </div>
                  <div className="mt-6">
                    <Button href="/dashboard" variant="outline" size="sm" className="w-full">
                      Start Free
                    </Button>
                  </div>
                </th>

                {/* Team Pro $39/mo (Mint outline highlighted) */}
                <th className="p-6 w-1/4 align-bottom border-l border-[#00E58F]/50 bg-[#00E58F]/[0.03] relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#00E58F]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#00E58F] font-bold uppercase">
                      Team Pro
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#00E58F] text-[#0E0D0B] font-black uppercase">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold text-[#00E58F] tracking-tight leading-none mt-2">
                    ${annual ? "39" : "49"}
                    <span className="text-[14px] font-normal text-[#A29E94]">/mo</span>
                  </div>
                  <div className="text-[12px] text-[#A29E94] mt-2 font-normal">
                    {annual ? "Billed annually ($468/yr)" : "Billed monthly"}
                  </div>
                  <div className="mt-6">
                    <Button href="/dashboard" variant="primary" size="sm" className="w-full">
                      Deploy Pro Cluster
                    </Button>
                  </div>
                </th>

                {/* Enterprise Custom */}
                <th className="p-6 w-1/4 align-bottom border-l border-white/[0.08]">
                  <div className="text-[13px] text-[#A29E94] font-semibold uppercase">
                    Enterprise
                  </div>
                  <div className="text-[clamp(2rem,3.5vw,3rem)] font-bold text-[#F5F3EE] tracking-tight leading-none mt-2">
                    Custom
                  </div>
                  <div className="text-[12px] text-[#6B675E] mt-2 font-normal">
                    Dedicated infrastructure &amp; compliance
                  </div>
                  <div className="mt-6">
                    <Button href="/dashboard" variant="outline" size="sm" className="w-full">
                      Contact Sales
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body Rows */}
            <tbody className="divide-y divide-white/[0.06] text-[13px]">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 px-6 text-[#F5F3EE] font-semibold">
                    {row.name}
                  </td>
                  <td className="p-4 px-6 border-l border-white/[0.08] text-[#A29E94]">
                    {row.dev}
                  </td>
                  <td className="p-4 px-6 border-l border-[#00E58F]/30 bg-[#00E58F]/[0.02] text-[#F5F3EE] font-bold">
                    {row.team}
                  </td>
                  <td className="p-4 px-6 border-l border-white/[0.08] text-[#A29E94]">
                    {row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
};
