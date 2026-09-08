import type { Metadata } from "next";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import MotDePasseClient from "./MotDePasseClient";

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

export default function MotDePassePage() {
  return <MotDePasseClient />;
}
