"use client";

import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingNavbar } from "./landing-navbar";
import { QuoteSection } from "./quote-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <main>
        <HeroSection />
        <QuoteSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
