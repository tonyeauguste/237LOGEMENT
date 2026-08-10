import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import FeaturedSection from "@/components/sections/FeaturedSection";
import HowItWorksSplit from "@/components/sections/HowItWorksSplit";
import ValuesSection from "@/components/sections/ValuesSection";
import CtaSection from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedSection />
      <HowItWorksSplit />
      <ValuesSection />
      <CtaSection />
    </>
  );
}
