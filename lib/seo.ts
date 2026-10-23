// Aperçu de partage (WhatsApp, Facebook, Messenger, X…) : valeurs communes
// aux métadonnées Open Graph du layout et des fiches annonce.

import type { Locale } from "@/i18n/config";

/** Domaine principal du site — sert de base aux URLs absolues exigées par les aperçus. */
export const SITE_URL = "https://237logement.org";
export const SITE_NAME = "237Logement";

/** Locale Open Graph correspondant à la langue de la page. */
export function ogLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "fr_FR";
}

/** Image d'aperçu générique (logo + slogan), pour les pages sans photo propre. */
export function defaultOgImage(locale: Locale) {
  return {
    url: `/og-default-${locale}.jpg`,
    width: 1200,
    height: 630,
    alt: SITE_NAME,
  };
}

/**
 * Image d'aperçu d'une annonce : JPEG 1200×630 léger généré par la route
 * app/og/[id]/route.ts (voir son commentaire pour le « pourquoi »).
 *
 * `?v=` dérive de l'URL de la première photo : WhatsApp et Facebook gardent
 * l'aperçu en cache par URL, donc quand le propriétaire change sa photo
 * principale l'adresse change aussi et l'aperçu se met à jour.
 */
export function listingOgImageUrl(id: number, firstPhotoUrl: string) {
  let h = 5381;
  for (let i = 0; i < firstPhotoUrl.length; i++) h = ((h << 5) + h + firstPhotoUrl.charCodeAt(i)) >>> 0;
  return { url: `/og/${id}.jpg?v=${h.toString(36)}`, width: 1200, height: 630 };
}
