import type { Metadata } from "next";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import ComptePageClient from "./ComptePageClient";

// Pas d'indexation pour un tableau de bord personnel : contenu propre à
// chaque compte, sans intérêt pour la recherche, et jamais le même d'une
// visite à l'autre — noindex plutôt qu'un titre/description qui n'aurait
// de toute façon aucune valeur SEO ici.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { Dashboard: { metaTitle: string } }).Dashboard;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default function ComptePage() {
  return <ComptePageClient />;
}
