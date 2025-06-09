import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LiveQuizDemoSection } from "@/components/landing/live-quiz-demo-section";
import { StatisticsSection } from "@/components/landing/statistics-section";
import { CTASection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col container mx-auto px-5">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <LiveQuizDemoSection />
        <StatisticsSection />
        <CTASection />
      </main>
    </div>
  );
}
