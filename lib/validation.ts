// ═══════════════════════════════════════════════
// Validation du formulaire /publier — Tâche 6 du prompt "publier-et-auth".
//
// TypeScript pur plutôt que Zod : le reste du projet n'utilise ni Zod ni
// react-hook-form nulle part (chaque champ est un useState individuel,
// validé par des fonctions simples) — cohérent avec l'existant plutôt
// qu'une nouvelle dépendance npm pour ce seul formulaire.
//
// "Discriminé sur typeTransaction" : les règles ci-dessous divergent
// explicitement selon `transactionType` (montant requis mais nom de champ
// différent, champs vente absents en location et inversement) — même
// intention qu'un z.discriminatedUnion, exprimée en if/else typés.
// ═══════════════════════════════════════════════

import type { LandTitleStatus, TransactionType } from "./types";
import type { PropertyGroup } from "./data";

/** Plafond généreux (FCFA) pour intercepter une faute de frappe évidente (un zéro de trop), pas un vrai plafond de marché. */
const MAX_REASONABLE_AMOUNT = 1_000_000_000;

export interface PublishFormInput {
  city: string;
  quartier: string;
  title: string;
  transactionType: TransactionType;
  group: PropertyGroup;
  photosCount: number;
  price: string;
  surface: string;
  surfaceVisible: boolean;
  surfaceRequired: boolean;
  deposit: string;
  advance: string;
  landTitleStatus: LandTitleStatus;
}

export type PublishFormErrors = Partial<
  Record<"city" | "quartier" | "title" | "photos" | "price" | "surface" | "deposit" | "advance", string>
>;

/** Entier positif dans une chaîne, dans une plage raisonnable — vide accepté (champ optionnel géré par l'appelant). */
function amountError(raw: string, label: string): string | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return `${label} doit être un nombre entier positif.`;
  }
  if (n > MAX_REASONABLE_AMOUNT) {
    return `${label} semble anormalement élevé — vérifiez le nombre de zéros.`;
  }
  return undefined;
}

/**
 * Valide l'ensemble du formulaire /publier pour la combinaison
 * transactionType × groupe donnée. Ne renvoie que les erreurs des champs
 * réellement affichés pour cette combinaison (voir FIELD_VISIBILITY_RULES) —
 * un champ masqué n'est jamais requis, cohérent avec la Tâche 4.4.
 */
export function validatePublishForm(input: PublishFormInput): PublishFormErrors {
  const errors: PublishFormErrors = {};

  if (!input.city.trim()) errors.city = "La ville est obligatoire.";
  if (!input.quartier.trim()) errors.quartier = "Le quartier est obligatoire.";
  if (!input.title.trim()) errors.title = "Le titre est obligatoire.";
  if (input.photosCount < 3) errors.photos = "Ajoutez au minimum 3 photos.";

  // Prix — obligatoire dans les deux cas (loyer mensuel en location, prix
  // de vente total en vente), même champ, même contrainte.
  const priceLabel = input.transactionType === "vente" ? "Le prix de vente" : "Le loyer mensuel";
  if (!input.price.trim()) {
    errors.price = `${priceLabel} est obligatoire.`;
  } else {
    const err = amountError(input.price, priceLabel);
    if (err) errors.price = err;
  }

  // Surface — requise uniquement pour un terrain (Tâche 6 : "typeBien ===
  // 'terrain' doit rendre... surface requis"), optionnelle ailleurs même
  // quand affichée (ex : vente résidentielle).
  if (input.surfaceVisible) {
    if (input.surfaceRequired && !input.surface.trim()) {
      errors.surface = "La surface est obligatoire pour un terrain.";
    } else if (input.surface.trim()) {
      const n = Number(input.surface);
      if (!Number.isFinite(n) || n <= 0) errors.surface = "La surface doit être un nombre positif.";
    }
  }

  // Caution / Avance — uniquement pertinents (et donc validés) en location.
  if (input.transactionType === "location") {
    const depositErr = amountError(input.deposit, "La caution");
    if (depositErr) errors.deposit = depositErr;
    const advanceErr = amountError(input.advance, "L'avance");
    if (advanceErr) errors.advance = advanceErr;
  }

  return errors;
}
