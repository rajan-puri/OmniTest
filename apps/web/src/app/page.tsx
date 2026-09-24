import React from "react";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { EditorialNav } from "@/components/landing/EditorialNav";
import { ProgressRail } from "@/components/landing/ProgressRail";
import { EditorialHero } from "@/components/landing/sections/EditorialHero";
import { ActionIntroSection } from "@/components/landing/sections/ActionIntroSection";
import { ThreeChaptersSection } from "@/components/landing/sections/ThreeChaptersSection";
import { FeatureRowsSection } from "@/components/landing/sections/FeatureRowsSection";
import { CapabilityCardsSection } from "@/components/landing/sections/CapabilityCardsSection";
import { EditorialDashboardSection } from "@/components/landing/sections/EditorialDashboardSection";
import { ResultsCarouselSection } from "@/components/landing/sections/ResultsCarouselSection";
import { EditorialPricingSection } from "@/components/landing/sections/EditorialPricingSection";
import { EditorialFaqSection } from "@/components/landing/sections/EditorialFaqSection";
import { EditorialFooterSection } from "@/components/landing/sections/EditorialFooterSection";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      {/* 5-Step Pipeline Progress Rail (Mobile top bar / Desktop side rail) */}
      <ProgressRail />

      {/* 1. Announcement Bar & Sticky Navigation */}
      <EditorialNav />

      <main className="flex-1 w-full overflow-hidden">
        {/* 2. Hero: Warm paper bg, 8-word headline, SVG isometric test grid, marquee */}
        <EditorialHero />

        {/* 3. "See a test run in action": Perspective floor grid, orange path line, word cycle */}
        <ActionIntroSection />

        {/* 4. Three Chapters: Ghost numerals 01/02/03, expanding list, persistent transforming SVG diagram */}
        <ThreeChaptersSection />

        {/* 5. Feature Rows: 3 alternating rows (diff slider, a11y scan, API contract) + emerald recorder banner */}
        <FeatureRowsSection />

        {/* 6. Capability Cards: Pastel-gradient mosaic cards, ready to use tag, explore buttons */}
        <CapabilityCardsSection />

        {/* 7. Dashboard: Full app window scaling in on scroll, live counters, trace scrubber */}
        <EditorialDashboardSection />

        {/* 8. Results Carousel: Case study cards, 2 big stats separated by hairlines, 01-07 indicator */}
        <ResultsCarouselSection />

        {/* 9. Pricing: 3 columns, Team Pro brand outline, monthly/annual toggle */}
        <EditorialPricingSection />

        {/* 10. FAQ: Two-column, sticky heading left, large-type accordion right */}
        <EditorialFaqSection />

        {/* 11 & 12. "Ready to start?" Pale mint CTA + 5-column footer with giant cropped wordmark */}
        <EditorialFooterSection />
      </main>
    </SmoothScrollProvider>
  );
}
