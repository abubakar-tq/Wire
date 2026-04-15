import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { TickerBar } from "@/components/landing/TickerBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { NFTShowcase } from "@/components/landing/NFTShowcase";
import { StatsSection } from "@/components/landing/StatsSection";
import { LeaderboardPreview } from "@/components/landing/LeaderboardPreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "WireFluid Arena — Web3 Fantasy Cricket",
  description:
    "Build your dream squad, mint it as an NFT, and win real crypto rewards in the world's first fully on-chain fantasy cricket platform.",
  openGraph: {
    title: "WireFluid Arena — Web3 Fantasy Cricket",
    description: "Build. Mint. Win. The future of fantasy sports is on-chain.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingNav />
      <main>
        <HeroSection />
        <TickerBar />
        <HowItWorks />
        <StatsSection />
        <NFTShowcase />
        <LeaderboardPreview />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
