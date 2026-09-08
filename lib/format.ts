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

/** "Publié il y a …" à partir d'un `created_at` Supabase (ISO). */
export function fmtRelativeDate(iso: string | undefined): string {
  if (!iso) return "Publié récemment";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (Number.isNaN(days) || days < 0) return "Publié récemment";
  if (days === 0) return "Publié aujourd'hui";
  if (days === 1) return "Publié il y a 1 jour";
  if (days < 30) return `Publié il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Publié il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `Publié il y a ${years} an${years > 1 ? "s" : ""}`;
}
