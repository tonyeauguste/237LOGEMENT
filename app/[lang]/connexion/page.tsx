import type { Metadata } from "next";
import { getMessages, getPageMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import ConnexionPageClient from "./ConnexionPageClient";
import { IntlProvider } from "@/i18n/IntlProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { Auth: { metaTitle: string; metaDescription: string } }).Auth;
  return { title: t.metaTitle, description: t.metaDescription };
}

// Namespaces propres à cette page — les transverses (navigation, pied
// de page, cartes d'annonce…) viennent déjà de la mise en page.
const NAMESPACES = ["Auth", "AuthHero", "Password"] as const;

export default async function ConnexionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return (
    <IntlProvider messages={await getPageMessages(locale, NAMESPACES)}>
      <ConnexionPageClient />
    </IntlProvider>
  );
}
