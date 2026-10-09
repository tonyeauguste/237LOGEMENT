import type { Metadata } from "next";
import { getMessages, getPageMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import ComptePageClient from "./ComptePageClient";
import { IntlProvider } from "@/i18n/IntlProvider";

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

// Namespaces propres à cette page — les transverses (navigation, pied
// de page, cartes d'annonce…) viennent déjà de la mise en page.
const NAMESPACES = ["Dashboard", "Auth", "AdminOverview", "AdminAnnonces", "AdminUsers"] as const;

export default async function ComptePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return (
    <IntlProvider messages={await getPageMessages(locale, NAMESPACES)}>
      <ComptePageClient />
    </IntlProvider>
  );
}
