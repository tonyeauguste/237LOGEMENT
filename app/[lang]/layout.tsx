import type { Metadata, Viewport } from "next";
import { Playfair_Display, Outfit, Cinzel } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Toaster from "@/components/layout/Toaster";
import PageTransition from "@/components/layout/PageTransition";
import { IntlProvider } from "@/i18n/IntlProvider";
import { getMessages, getPageMessages, SHARED_NAMESPACES } from "@/i18n/dictionaries";
import { LOCALES, isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { SITE_URL, SITE_NAME, ogLocale, defaultOgImage } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const meta = (messages as { Meta: { title: string; description: string } }).Meta;
  return {
    // metadataBase : rend absolues les URLs relatives (image d'aperçu, liens
    // canoniques) — WhatsApp et Facebook n'acceptent que des URLs absolues.
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    // Volontairement SANS title/description dans openGraph : Next.js les
    // reprend alors du title/description propres à chaque page (voir
    // inheritFromMetadata). Les fixer ici donnerait le titre de l'accueil à
    // l'aperçu de toutes les pages.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      images: [defaultOgImage(locale)],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#07111E",
  width: "device-width",
  initialScale: 1,
  // Nécessaire pour que env(safe-area-inset-*) renvoie autre chose que 0 —
  // sans ça, les éléments fixes en bas d'écran (toasts, bouton "remonter")
  // peuvent chevaucher la barre de geste des iPhone à encoche/Dynamic Island.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Filet de sécurité : proxy.ts garantit normalement que seul "fr" ou "en"
  // atteint jamais ce segment, mais on ne fait jamais confiance à une URL
  // brute (accès direct, lien externe mal formé...).
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  // Uniquement les namespaces transverses : le dictionnaire complet (~48 Ko)
  // partait auparavant dans chaque page, panneaux admin compris. Chaque page
  // ajoute les siens via son propre <IntlProvider> imbriqué.
  const messages = await getPageMessages(locale, SHARED_NAMESPACES);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${outfit.variable} ${cinzel.variable}`}
    >
      <body className="font-body bg-bg text-text min-h-screen overflow-x-hidden antialiased">
        <IntlProvider locale={locale} messages={messages}>
          <Navbar />
          <Toaster />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <ConditionalFooter />
        </IntlProvider>
      </body>
    </html>
  );
}
