import React from "react";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { ProblemSection } from "@/components/problem-section";
import { CapabilitiesSection } from "@/components/capabilities-section";
import { HowItWorks } from "@/components/how-it-works";
import { RecorderSection } from "@/components/recorder-section";
import { VisualTestingSection } from "@/components/visual-testing-section";
import { DeveloperWorkflow } from "@/components/developer-workflow";
import { DashboardPreview } from "@/components/dashboard-preview";
import { GithubCiSection } from "@/components/github-ci-section";
import { PricingSection } from "@/components/pricing-section";
import { FaqSection } from "@/components/faq-section";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      {/* 1. Navigation */}
      <Navigation />

      <main className="flex-1">
        {/* 2. Hero */}
        <Hero />

        {/* 3. Problem */}
        <ProblemSection />

        {/* 4. Testing capabilities */}
        <CapabilitiesSection />

        {/* 5. How OmniTest works */}
        <HowItWorks />

        {/* 6. Test recorder */}
        <RecorderSection />

        {/* 7. Visual testing */}
        <VisualTestingSection />

        {/* 8. Developer workflow */}
        <DeveloperWorkflow />

        {/* 9. Dashboard preview */}
        <DashboardPreview />

        {/* 10. GitHub/CI integration */}
        <GithubCiSection />

        {/* 11. Pricing preview */}
        <PricingSection />

        {/* 12. FAQ */}
        <FaqSection />

        {/* 13. Final CTA */}
        <FinalCta />
      </main>

      {/* 14. Footer */}
      <Footer />
    </>
  );
}
