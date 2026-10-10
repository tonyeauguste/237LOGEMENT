// ═══════════════════════════════════════════════
// Traduction des refus de mot de passe renvoyés par Supabase Auth.
//
// Quand les exigences sont durcies dans le tableau de bord Supabase
// (Authentication → Providers → Email : longueur minimale, classes de
// caractères requises), GoTrue refuse l'inscription ou le changement de
// mot de passe avec le code `weak_password` et un tableau `reasons`.
//
// Sans ce module, ces refus tombaient dans le message générique
// « Une erreur est survenue » : l'utilisateur ne savait pas que le
// problème venait de son mot de passe, réessayait, échouait encore, et
// abandonnait. Un abandon qui n'apparaît dans aucune statistique.
//
// Le message de GoTrue est en anglais et technique (« Password should
// contain at least one character of each: abcdefghijklmnopqrstuvwxyz… »),
// on ne l'affiche donc pas tel quel : on traduit les `reasons`.
// ═══════════════════════════════════════════════

/** Traducteur du namespace "Password" (voir i18n/IntlProvider.tsx). */
type PasswordTranslator = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Renvoie les raisons du refus si l'erreur est un mot de passe jugé trop
 * faible, sinon `null`.
 *
 * On teste `code` et `name` plutôt que d'importer `isAuthWeakPasswordError`
 * depuis @supabase/auth-js : ce sous-paquet n'est pas réexporté par
 * @supabase/supabase-js, et on évite ainsi d'en dépendre directement.
 */
export function weakPasswordReasons(error: unknown): string[] | null {
  if (!error || typeof error !== "object") return null;
  const e = error as { code?: unknown; name?: unknown; reasons?: unknown };
  const isWeak = e.code === "weak_password" || e.name === "AuthWeakPasswordError";
  if (!isWeak) return null;
  return Array.isArray(e.reasons)
    ? e.reasons.filter((r): r is string => typeof r === "string")
    : [];
}

/**
 * Message localisé pour un refus de mot de passe.
 *
 * Volontairement sans chiffre : la longueur minimale est un réglage du
 * tableau de bord Supabase, pas une constante du code. L'écrire ici ferait
 * mentir le message dès que ce réglage changerait.
 */
export function weakPasswordMessage(reasons: string[], t: PasswordTranslator): string {
  const tooShort = reasons.some((r) => r === "length" || r === "min_length");
  const tooSimple = reasons.includes("characters");
  const leaked = reasons.includes("pwned");

  if (leaked) return t("weakLeaked");
  if (tooShort && tooSimple) return t("weakShortAndSimple");
  if (tooShort) return t("weakShort");
  if (tooSimple) return t("weakSimple");
  return t("weakGeneric");
}
