import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import FeaturedSection from "@/components/sections/FeaturedSection";
import HowItWorksSplit from "@/components/sections/HowItWorksSplit";
import ValuesSection from "@/components/sections/ValuesSection";
import CtaSection from "@/components/sections/CtaSection";
import { createPublicClient } from "@/lib/supabase/public";
import { IntlProvider } from "@/i18n/IntlProvider";
import { getPageMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { rowToProperty } from "@/lib/supabase/mappers";

// Régénère la page en arrière-plan au plus toutes les 60s au lieu de tout
// recalculer à chaque visite : l'accueil n'affiche que des données
// publiques (annonces disponibles), pas de contenu propre à l'utilisateur.
// Voir le commentaire dans lib/supabase/public.ts pour le "pourquoi".
export const revalidate = 60;

// Toutes les sections de l'accueil lisent le namespace Home (Home.hero,
// Home.stats, Home.featured…) — le reste vient de la mise en page.
const NAMESPACES = ["Home"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const properties = (data ?? []).map(rowToProperty);

  return (
    <IntlProvider messages={await getPageMessages(locale, NAMESPACES)}>
      <Hero />
      <StatsBar />
      <FeaturedSection properties={properties} />
      <HowItWorksSplit />
      <ValuesSection />
      <CtaSection />
    </IntlProvider>
  );
}
