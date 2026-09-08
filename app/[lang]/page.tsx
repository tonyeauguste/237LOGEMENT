import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import FeaturedSection from "@/components/sections/FeaturedSection";
import HowItWorksSplit from "@/components/sections/HowItWorksSplit";
import ValuesSection from "@/components/sections/ValuesSection";
import CtaSection from "@/components/sections/CtaSection";
import { createPublicClient } from "@/lib/supabase/public";
import { rowToProperty } from "@/lib/supabase/mappers";

// Régénère la page en arrière-plan au plus toutes les 60s au lieu de tout
// recalculer à chaque visite : l'accueil n'affiche que des données
// publiques (annonces disponibles), pas de contenu propre à l'utilisateur.
// Voir le commentaire dans lib/supabase/public.ts pour le "pourquoi".
export const revalidate = 60;

export default async function HomePage() {
  const supabase = createPublicClient();
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
