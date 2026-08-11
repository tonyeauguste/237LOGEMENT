import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import FeaturedSection from "@/components/sections/FeaturedSection";
import HowItWorksSplit from "@/components/sections/HowItWorksSplit";
import ValuesSection from "@/components/sections/ValuesSection";
import CtaSection from "@/components/sections/CtaSection";
import { createClient } from "@/lib/supabase/server";
import { rowToProperty } from "@/lib/supabase/mappers";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const properties = (data ?? []).map(rowToProperty);

  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedSection properties={properties} />
      <HowItWorksSplit />
      <ValuesSection />
      <CtaSection />
    </>
  );
}
