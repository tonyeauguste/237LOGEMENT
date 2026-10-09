/**
 * Formate une valeur numérique (ou une chaîne de chiffres bruts) avec des
 * séparateurs de milliers (espace normal) pour l'affichage dans un champ de
 * saisie — ex. "300000" -> "300 000". Groupe les chiffres manuellement
 * plutôt que de passer par toLocaleString("fr-FR") : ce dernier insère une
 * espace insécable (parfois l'espace fine insécable, selon le moteur JS),
 * peu fiable à l'affichage dans un input selon les polices/navigateurs.
 * Voir Tâche 3 du prompt "publier-et-auth" (champs monétaires du
 * formulaire /publier). Ne stocke jamais ce texte formaté — uniquement
 * pour l'affichage, voir parseMoneyInput pour revenir à l'entier stocké en
 * base.
 */
export function fmtMoneyInput(value: number | string): string {
  const digits = String(value).replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Inverse de fmtMoneyInput : retire tout ce qui n'est pas un chiffre pour
 * retrouver l'entier saisi (ex. "300 000" -> 300000), afin de ne jamais
 * stocker de chaîne formatée en base — voir Tâche 3.
 */
export function parseMoneyInput(value: string): number | null {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

export function fmtPrice(p: number): string {
  if (p >= 1000000) return (p / 1000000).toFixed(1) + " M FCFA";
  if (p >= 1000) return fmtMoneyInput(p) + " FCFA";
  return p + " FCFA";
}

/** Traducteur du namespace "RelativeDate" (voir i18n/IntlProvider.tsx). */
type RelativeDateTranslator = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Ancienneté d'une date ISO Supabase, sous forme neutre : « il y a 3 jours »,
 * « 3 days ago »… sans préfixe.
 *
 * Volontairement sans le mot « Publié » (que la version précédente collait
 * en dur) : cette fonction sert aussi à afficher une date d'inscription et
 * une dernière connexion dans le panneau admin, où « Publié il y a 3 jours »
 * sous le libellé « Inscrit » n'avait aucun sens. Les appelants qui parlent
 * bien d'une publication ajoutent le préfixe via la clé `postedAgo`.
 */
export function fmtRelativeDate(
  iso: string | undefined,
  t: RelativeDateTranslator
): string {
  if (!iso) return t("recently");
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (Number.isNaN(days) || days < 0) return t("recently");
  if (days === 0) return t("today");
  if (days === 1) return t("dayOne");
  if (days < 30) return t("days", { count: days });
  const months = Math.floor(days / 30);
  if (months === 1) return t("monthOne");
  if (months < 12) return t("months", { count: months });
  const years = Math.floor(months / 12);
  return years === 1 ? t("yearOne") : t("years", { count: years });
}
