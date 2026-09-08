import type { Metadata } from "next";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import FaqPageClient from "./FaqPageClient";

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

export default function FaqPage() {
  return <FaqPageClient />;
}
