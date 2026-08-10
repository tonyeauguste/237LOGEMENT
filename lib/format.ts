export function fmtPrice(p: number): string {
  if (p >= 1000000) return (p / 1000000).toFixed(1) + " M FCFA";
  if (p >= 1000) return p.toLocaleString("fr-FR") + " FCFA";
  return p + " FCFA";
}
