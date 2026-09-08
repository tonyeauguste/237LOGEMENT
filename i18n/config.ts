// ═══════════════════════════════════════════════
// Configuration i18n — source unique des langues supportées. Le français
// reste la langue par défaut (site pensé pour le Cameroun) ; l'anglais est
// une option supplémentaire, sélectionnée via l'URL (/fr/... ou /en/...).
//
// Portée : seule l'interface du site (menus, boutons, pages statiques) est
// traduite. Les annonces publiées par les propriétaires (titre,
// description...) restent affichées telles qu'ils les ont écrites — un
// texte libre ne peut pas être traduit automatiquement de façon fiable.
// ═══════════════════════════════════════════════

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
