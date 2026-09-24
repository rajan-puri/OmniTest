import React from "react";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { LandingNav } from "@/components/landing/LandingNav";
import { LiveTestRail } from "@/components/landing/LiveTestRail";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemCollapseSection } from "@/components/landing/ProblemCollapseSection";
import { ExecutionPipelineSection } from "@/components/landing/ExecutionPipelineSection";
import { VisualRegressionStage } from "@/components/landing/VisualRegressionStage";
import { CapabilitiesBento } from "@/components/landing/CapabilitiesBento";
import { WorkflowCiSection } from "@/components/landing/WorkflowCiSection";
import { DashboardMockupSection } from "@/components/landing/DashboardMockupSection";
import { PricingMatrix } from "@/components/landing/PricingMatrix";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { AssertionCtaFooter } from "@/components/landing/AssertionCtaFooter";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      {/* Live Test Rail (Mobile Top Bar / Desktop Side Telemetry Rail) */}
      <LiveTestRail />

      {/* Developer Navigation */}
      <LandingNav />

      <main className="flex-1">
        {/* Step 01: Hero & Animated Selector Sandbox */}
        <HeroSection />

        {/* Step 02: Tool Convergence (Before / After Sprawl Collapse) */}
        <ProblemCollapseSection />

        {/* Step 03: Parallel Execution Waterfall Pipeline */}
        <ExecutionPipelineSection />

        {/* Step 04: Visual Regression Studio (Light-Theme Stage) */}
        <VisualRegressionStage />

        {/* Step 05: Multi-Discipline Quality Fleet (Asymmetric Bento) */}
        <CapabilitiesBento />

        {/* Step 06: Developer Workflow & PR Gate */}
        <WorkflowCiSection />

        {/* Step 07: Observability Dashboard Console */}
        <DashboardMockupSection />

        {/* Step 08: Predictable Pricing Matrix */}
        <PricingMatrix />

        {/* Section 09: Technical FAQ */}
        <FaqAccordion />

        {/* Step 10: Final Assertion & Developer Footer */}
        <AssertionCtaFooter />
      </main>
    </SmoothScrollProvider>
  );
}
