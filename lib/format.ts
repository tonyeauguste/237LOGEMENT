export function fmtPrice(p: number): string {
  if (p >= 1000000) return (p / 1000000).toFixed(1) + " M FCFA";
  if (p >= 1000) return p.toLocaleString("fr-FR") + " FCFA";
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
