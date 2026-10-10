import type { Metadata } from "next";
import { getMessages, getPageMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import MotDePasseClient from "./MotDePasseClient";
import { IntlProvider } from "@/i18n/IntlProvider";

// noindex : page atteinte uniquement via un lien de réinitialisation à
// usage unique envoyé par email, aucun intérêt pour la recherche.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { ResetPassword: { metaTitle: string } }).ResetPassword;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

// Namespaces propres à cette page — les transverses (navigation, pied
// de page, cartes d'annonce…) viennent déjà de la mise en page.
const NAMESPACES = ["ResetPassword", "Password"] as const;

export default async function MotDePassePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return (
    <IntlProvider messages={await getPageMessages(locale, NAMESPACES)}>
      <MotDePasseClient />
    </IntlProvider>
  );
}
