// ═══════════════════════════════════════════════
// Refus des mots de passe connus des fuites de données.
//
// Reproduit côté application ce que fait l'option « Leaked password
// protection » de Supabase Auth, réservée au forfait Pro : interroger la
// base Pwned Passwords de HaveIBeenPwned, qui recense plusieurs centaines
// de millions de mots de passe apparus dans des fuites publiques. Ce sont
// exactement ceux que les attaquants essaient en premier (« credential
// stuffing ») — un mot de passe par ailleurs long et varié n'offre aucune
// protection s'il figure déjà dans ces listes.
//
// Le mot de passe ne quitte JAMAIS le navigateur. L'API utilise le
// k-anonymat : on calcule le SHA-1 localement, on n'envoie que ses
// 5 premiers caractères hexadécimaux, et le serveur renvoie en retour
// tous les suffixes connus commençant par ce préfixe (plusieurs centaines).
// La comparaison finale se fait ici. Le serveur ne peut donc pas savoir
// lequel de ces candidats nous intéressait, ni a fortiori le mot de passe.
//
// API publique, gratuite, sans clé ni compte.
// Voir https://haveibeenpwned.com/API/v3#PwnedPasswords
// ═══════════════════════════════════════════════

const API = "https://api.pwnedpasswords.com/range/";

/** Au-delà de ce délai on laisse passer plutôt que de bloquer l'inscription. */
const TIMEOUT_MS = 4000;

export interface PwnedResult {
  /** true si le mot de passe figure dans une fuite connue. */
  pwned: boolean;
  /** Nombre d'occurrences recensées — sert à nuancer le message. */
  count: number;
  /**
   * true si la vérification n'a pas pu aboutir (hors ligne, API
   * injoignable, navigateur sans Web Crypto). L'appelant doit alors
   * laisser passer : voir la note sur le choix « fail-open » plus bas.
   */
  skipped: boolean;
}

async function sha1Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Indique si `password` apparaît dans une fuite connue.
 *
 * Choix délibéré : en cas d'échec (réseau coupé, API indisponible,
 * `crypto.subtle` absent — il n'existe que sur HTTPS et localhost), on
 * renvoie `skipped: true` et l'appelant laisse passer. Bloquer une
 * inscription parce qu'un service tiers est en panne ferait plus de dégâts
 * que le risque couvert : l'utilisateur ne comprendrait pas le refus et
 * partirait. C'est aussi le comportement de Supabase sur le forfait Pro.
 */
export async function isPasswordPwned(password: string): Promise<PwnedResult> {
  if (!password) return { pwned: false, count: 0, skipped: true };

  try {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      return { pwned: false, count: 0, skipped: true };
    }

    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`${API}${prefix}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Pas de cookie ni d'en-tête d'identification vers ce tiers.
      credentials: "omit",
      headers: {
        // Demande au service de noyer la réponse parmi des entrées
        // factices : même la taille de la réponse ne renseigne plus.
        "Add-Padding": "true",
      },
    });
    if (!response.ok) return { pwned: false, count: 0, skipped: true };

    const body = await response.text();
    for (const line of body.split("\n")) {
      const [candidate, rawCount] = line.trim().split(":");
      if (candidate === suffix) {
        const count = Number(rawCount) || 0;
        // Le rembourrage ci-dessus introduit de fausses entrées, toujours
        // à 0 occurrence : il faut les ignorer.
        if (count > 0) return { pwned: true, count, skipped: false };
      }
    }
    return { pwned: false, count: 0, skipped: false };
  } catch {
    return { pwned: false, count: 0, skipped: true };
  }
}
