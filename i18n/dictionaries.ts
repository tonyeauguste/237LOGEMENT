import "server-only";
import { type Locale } from "./config";

// Un fichier par langue, chargé à la demande — voir la doc Next.js sur
// l'internationalisation (node_modules/next/dist/docs/01-app/02-guides/
// internationalization.md) pour ce pattern.
//
// "server-only" garantit que ce module n'est pas *importé* par du code
// client — mais pas que son contenu reste sur le serveur. Ce que l'on
// passe à <IntlProvider messages={...}> est une propriété d'un composant
// client : Next.js la sérialise donc dans la page, et elle arrive bel et
// bien dans le navigateur. Un commentaire affirmait ici l'inverse ; c'est
// faux, et ça a coûté ~48 Ko sur chaque page (le dictionnaire entier,
// panneaux admin compris, servi à un visiteur anonyme lisant une annonce).
//
// D'où getPageMessages() plus bas : on n'envoie que les namespaces dont
// la page a réellement besoin.
const dictionaries = {
  fr: () => import("../messages/fr.json").then((m) => m.default),
  en: () => import("../messages/en.json").then((m) => m.default),
};

export async function getMessages(locale: Locale) {
  return dictionaries[locale]();
}

// ── Sélection par page ──────────────────────────────────────────
// Namespaces nécessaires partout : ils viennent de la mise en page
// (navigation, pied de page) ou de composants réutilisés par plusieurs
// routes (cartes d'annonce, pagination, dates relatives). Tous légers —
// ~3 Ko au total — donc les garder globaux évite un oubli silencieux sur
// une route pour un gain négligeable.
//
// Absents volontairement : Meta, About, HowItWorks et AnnonceNotFound,
// lus directement côté serveur via getMessages() et jamais via le
// contexte React — les inclure n'aurait fait que les envoyer au
// navigateur pour rien.
export const SHARED_NAMESPACES = [
  "Nav",
  "Footer",
  "NotFound",
  "Pagination",
  "Property",
  "PropertyKinds",
  "RelativeDate",
  "Transaction",
  "Amenities",
] as const;

/**
 * Sous-ensemble du dictionnaire limité aux namespaces demandés, à passer
 * à <IntlProvider> depuis une page. Les namespaces partagés sont déjà
 * fournis par app/[lang]/layout.tsx : une page ne déclare que les siens.
 */
export async function getPageMessages(locale: Locale, namespaces: readonly string[]) {
  const all = (await getMessages(locale)) as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const ns of namespaces) {
    if (ns in all) picked[ns] = all[ns];
  }
  return picked;
}
