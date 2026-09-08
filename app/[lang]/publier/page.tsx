import type { Metadata } from "next";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import PublierPageClient from "./PublierPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as { Publish: { metaTitle: string; metaDescription: string } }).Publish;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function PublierPage() {
  return <PublierPageClient />;
}
