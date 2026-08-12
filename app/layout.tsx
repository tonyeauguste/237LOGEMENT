import type { Metadata, Viewport } from "next";
import { Playfair_Display, Outfit, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Toaster from "@/components/layout/Toaster";
import PageTransition from "@/components/layout/PageTransition";

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

export const metadata: Metadata = {
  title: "237Logement – Trouvez votre logement idéal au Cameroun",
  description:
    "237Logement – La première plateforme immobilière du Cameroun. Trouvez votre logement à Yaoundé, Douala, Bafoussam et partout au Cameroun.",
};

export const viewport: Viewport = {
  themeColor: "#07111E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${outfit.variable} ${cinzel.variable}`}
    >
      <body className="font-body bg-bg text-text min-h-screen overflow-x-hidden antialiased">
        <Navbar />
        <Toaster />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
