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
import { PHOTO_MIN, type PropertyGroup } from "./data";


/**
 * Traducteur du namespace "Publish" (voir i18n/IntlProvider.tsx). Les
 * messages étaient auparavant écrits en français directement ici : ils
 * s'affichent via showToast et sous les champs, donc un utilisateur en
 * anglais voyait un formulaire anglais rejeter sa saisie en français.
 */
export type PublishTranslator = (
  key: string,
  vars?: Record<string, string | number>
) => string;

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
function amountError(raw: string, label: string, t: PublishTranslator): string | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return t("errNotInteger", { label });
  }
  if (n > MAX_REASONABLE_AMOUNT) {
    return t("errTooHigh", { label });
  }
  return undefined;
}

/**
 * Valide l'ensemble du formulaire /publier pour la combinaison
 * transactionType × groupe donnée. Ne renvoie que les erreurs des champs
 * réellement affichés pour cette combinaison (voir FIELD_VISIBILITY_RULES) —
 * un champ masqué n'est jamais requis, cohérent avec la Tâche 4.4.
 */
export function validatePublishForm(
  input: PublishFormInput,
  t: PublishTranslator
): PublishFormErrors {
  const errors: PublishFormErrors = {};

  if (!input.city.trim()) errors.city = t("errCity");
  if (!input.quartier.trim()) errors.quartier = t("errQuartier");
  if (!input.title.trim()) errors.title = t("errTitle");
  // PHOTO_MIN plutôt qu'un 3 en dur : le seuil était écrit à trois
  // endroits différents (ici, le badge de l'uploader, la vérification
  // d'étape), avec le risque qu'ils divergent.
  if (input.photosCount < PHOTO_MIN) errors.photos = t("errPhotos", { min: PHOTO_MIN });

  // Prix — obligatoire dans les deux cas (loyer mensuel en location, prix
  // de vente total en vente), même champ, même contrainte.
  const priceLabel = t(input.transactionType === "vente" ? "labelSalePrice" : "labelRent");
  if (!input.price.trim()) {
    errors.price = t("errRequired", { label: priceLabel });
  } else {
    const err = amountError(input.price, priceLabel, t);
    if (err) errors.price = err;
  }

  // Surface — requise uniquement pour un terrain (Tâche 6 : "typeBien ===
  // 'terrain' doit rendre... surface requis"), optionnelle ailleurs même
  // quand affichée (ex : vente résidentielle).
  if (input.surfaceVisible) {
    if (input.surfaceRequired && !input.surface.trim()) {
      errors.surface = t("errSurfaceRequired");
    } else if (input.surface.trim()) {
      const n = Number(input.surface);
      if (!Number.isFinite(n) || n <= 0) errors.surface = t("errSurfacePositive");
    }
  }

  // Caution / Avance — uniquement pertinents (et donc validés) en location.
  if (input.transactionType === "location") {
    const depositErr = amountError(input.deposit, t("labelDeposit"), t);
    if (depositErr) errors.deposit = depositErr;
    const advanceErr = amountError(input.advance, t("labelAdvance"), t);
    if (advanceErr) errors.advance = advanceErr;
  }

  return errors;
}
