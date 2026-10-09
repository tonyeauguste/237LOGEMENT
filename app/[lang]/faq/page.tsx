import type { Metadata } from "next";
import { getMessages, getPageMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import FaqPageClient from "./FaqPageClient";
import { IntlProvider } from "@/i18n/IntlProvider";

// Titre/description SEO — la page elle-même est "use client" (accordéon,
// filtre par catégorie), ce que Next.js interdit pour generateMetadata.
// Ce wrapper serveur ne fait que ça, et rend le contenu interactif
// inchangé (voir FaqPageClient.tsx) — même pattern que a-propos/
// comment-ca-marche/confidentialite, trouvé lors de l'audit pré-déploiement.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { Faq: { metaTitle: string; metaDescription: string } }).Faq;
  return { title: t.metaTitle, description: t.metaDescription };
}

// Namespaces propres à cette page — les transverses (navigation, pied
// de page, cartes d'annonce…) viennent déjà de la mise en page.
const NAMESPACES = ["Faq", "FaqCategories", "FaqItems"] as const;

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return (
    <IntlProvider messages={await getPageMessages(locale, NAMESPACES)}>
      <FaqPageClient />
    </IntlProvider>
  );
}
