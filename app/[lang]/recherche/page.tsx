import type { Metadata } from "next";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import RecherchePageClient from "./RecherchePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { Search: { metaTitle: string; metaDescription: string } }).Search;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function RecherchePage() {
  return <RecherchePageClient />;
}
