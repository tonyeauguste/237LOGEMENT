import "server-only";
import { type Locale } from "./config";

// Un fichier par langue, chargé à la demande — voir la doc Next.js sur
// l'internationalisation (node_modules/next/dist/docs/01-app/02-guides/
// internationalization.md) pour ce pattern. Comme ce module est marqué
// "server-only", ce JSON ne part jamais dans le bundle JS envoyé au
// navigateur : seul le HTML déjà traduit est envoyé, et le contenu utile
// aux composants client passe par <IntlProvider messages={...}>.
const dictionaries = {
  fr: () => import("../messages/fr.json").then((m) => m.default),
  en: () => import("../messages/en.json").then((m) => m.default),
};

export async function getMessages(locale: Locale) {
  return dictionaries[locale]();
}
