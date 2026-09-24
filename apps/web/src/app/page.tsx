import React from "react";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { PrecisionNav } from "@/components/landing/PrecisionNav";
import { ProgressRail } from "@/components/landing/ProgressRail";
import { PrecisionHero } from "@/components/landing/sections/PrecisionHero";
import { PrecisionProblem } from "@/components/landing/sections/PrecisionProblem";
import { PrecisionHowItWorks } from "@/components/landing/sections/PrecisionHowItWorks";
import { PrecisionVisualDiff } from "@/components/landing/sections/PrecisionVisualDiff";
import { PrecisionBento } from "@/components/landing/sections/PrecisionBento";
import { PrecisionDevWorkflow } from "@/components/landing/sections/PrecisionDevWorkflow";
import { PrecisionDashboard } from "@/components/landing/sections/PrecisionDashboard";
import { PrecisionPricing } from "@/components/landing/sections/PrecisionPricing";
import { PrecisionFaq } from "@/components/landing/sections/PrecisionFaq";
import { PrecisionFinalCta } from "@/components/landing/sections/PrecisionFinalCta";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      {/* 5-Step Fixed Telemetry Progress Rail (Top Bar < 768px / Fixed Rail >= 768px) */}
      <ProgressRail />

      {/* Navigation Header */}
      <PrecisionNav />

      <main className="flex-1 w-full overflow-hidden">
        {/* Section 01: Hero (100vh, bleeding browser mockup, live cursor & locators, marquee) */}
        <PrecisionHero />

        {/* Section 02: Problem ("5 tools. 5 configs. 5 dashboards." SVG convergence to "1 run.") */}
        <PrecisionProblem />

        {/* Section 03: How It Works (Desktop Pinned 01/02/03, Mobile Stacked Blocks) */}
        <PrecisionHowItWorks />

        {/* Section 04: Visual Regression (Light Theme #F1EFE8 Full-Bleed 90vw Stage with Redline Highlights) */}
        <PrecisionVisualDiff />

        {/* Section 05: Capabilities Bento (12-Col Unequal Grid: 7/5, 4/4/4, 5/7) */}
        <PrecisionBento />

        {/* Section 06: Developer Workflow (Accent Mint #00E58F Section: Terminal <-> GitHub PR) */}
        <PrecisionDevWorkflow />

        {/* Section 07: Observability Dashboard (Full Container 3D Tilt App Window) */}
        <PrecisionDashboard />

        {/* Section 08: Pricing (Comparison Table with Team Pro Mint Outline & Annual Toggle) */}
        <PrecisionPricing />

        {/* Section 09: FAQ (Two-Column with Sticky Heading & Large-Type Accordion) */}
        <PrecisionFaq />

        {/* Section 10: Final CTA (Full-Bleed Giant Headline, Typing Assertion, Slim Footer) */}
        <PrecisionFinalCta />
      </main>
    </SmoothScrollProvider>
  );
}
