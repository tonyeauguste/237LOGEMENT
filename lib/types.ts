// ═══════════════════════════════════════════════
// Types partagés — 237Logement
// ═══════════════════════════════════════════════

/**
 * Nature de la transaction : vente définitive ou mise en location. Axe
 * indépendant du type de bien — voir TYPES_ELIGIBLES_VENTE (lib/data.ts)
 * pour les types de bien qui excluent la vente (Chambre, Studio).
 */
export type TransactionType = "vente" | "location";

/**
 * Durée de location — pertinente uniquement quand `transactionType` vaut
 * "location" ET que le type de bien est résidentiel ou commercial (voir
 * FIELD_VISIBILITY_RULES dans lib/data.ts). `null` en vente, ou pour un
 * terrain en location (proposé en bail, sans durée fixe). Reflète la
 * contrainte CHECK `properties_type_check` côté base.
 */
export type ListingKind = "longue" | "courte";

/**
 * Statut d'occupation d'un bien en location — pertinent uniquement pour une
 * location résidentielle/commerciale (là où `type` s'applique). `null`
 * sinon (vente, foncier). Voir PARTIE B du formulaire /publier : en courte
 * durée c'est un simple statut réversible ; en longue durée, passer à
 * "occupe" supprime définitivement l'annonce (voir handleMarkAsRented dans
 * app/compte/page.tsx) — ce statut n'est donc jamais persisté pour une
 * annonce longue durée.
 */
export type OccupancyStatus = "disponible" | "occupe";

/**
 * Nature du bien (chambre, studio, villa…) — distincte de `ListingKind`
 * qui porte la durée. Volontairement `string` plutôt qu'une union figée :
 * les valeurs autorisées vivent dans PROPERTY_KINDS (lib/data.ts) et dans
 * la contrainte CHECK `properties_kind_check` côté base.
 */
export type PropertyKind = string;

/** Disponibilité du titre foncier — pertinent uniquement en vente. */
export type LandTitleStatus = "oui" | "non" | "en_cours";

export interface Owner {
  name: string;
  avatar: string;
  /** Moyenne réelle des notes reçues (owner_ratings) — 0 tant que ratingCount est 0, jamais une valeur inventée. */
  rating: number;
  /** Nombre de notes réellement reçues — sert à distinguer "pas encore noté" (0) d'une vraie note. */
  ratingCount: number;
  listings: number;
  phone: string;
}

/** 'active' = visible publiquement. 'blocked' = masquée par un admin (reste en base). 'pending' = réservé à un futur workflow de modération. */
export type ListingStatus = "active" | "blocked" | "pending";

export interface Property {
  id: number;
  title: string;
  city: string;
  quartier: string;
  address?: string;
  /** Précision sur l'emplacement (repères, accès…) — saisie libre à l'étape 1 du formulaire. */
  precisionDesc?: string;
  /** Vente ou location. */
  transactionType: TransactionType;
  /** Durée de location (longue/courte) — `null` en vente ou pour un terrain en location. */
  type: ListingKind | null;
  /** Nature du bien : chambre, studio, villa… */
  kind: PropertyKind;
  /** `null` si non applicable (vente, foncier) — voir OccupancyStatus. */
  occupancyStatus: OccupancyStatus | null;
  price: number;
  /** Caution — pertinente uniquement en location (`null` en vente). */
  deposit: number | null;
  /** Avance de loyer — distincte de la caution, pertinente uniquement en location. */
  advancePayment: number | null;
  /** Charges incluses dans le loyer — pertinent uniquement en location. */
  charges: "non" | "oui" | "partiel" | null;
  /** Durée minimale de location (ex: "1 mois") — pertinent uniquement en location. */
  minDuration: string | null;
  /** Disponibilité du titre foncier — pertinent uniquement en vente. */
  landTitleStatus: LandTitleStatus | null;
  /** Prix négociable — pertinent uniquement en vente. */
  priceNegotiable: boolean | null;
  rooms: number;
  baths: number;
  /** 0 si le champ Surface ne s'applique pas à cette combinaison (voir FIELD_VISIBILITY_RULES.surface) — même convention que `rooms`/`baths`, déjà affichés via `p.surface || "—"`. */
  surface: number;
  desc: string;
  imgs: string[];
  amenities: string[];
  verified: boolean;
  available: boolean;
  views: number;
  favs: number;
  owner: Owner;
  ownerId?: string | null;
  status: ListingStatus;
  createdAt?: string;
}

export type UserRole = "visitor" | "owner" | "admin";

/** 'active' = peut se connecter. 'blocked' = accès refusé (compte suspendu par un admin). */
export type AccountStatus = "active" | "blocked";

export interface User {
  /** auth.uid() Supabase — sert de clé d'appartenance pour les annonces/messages. */
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** Ville renseignée dans les paramètres du compte (saisie libre, facultative). */
  city?: string;
  role: UserRole;
  status: AccountStatus;
  avatar: string;
}

/** Ligne renvoyée par le RPC `admin_list_users` — un compte vu depuis le panneau admin. */
export interface AdminUserRow {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: AccountStatus;
  listingsCount: number;
}

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export interface SearchFilters {
  query: string;
  city: string;
  type: "" | ListingKind;
  /** Nature du bien ("" = tous les types). */
  kind: string;
  quartier: string;
  rooms: string;
  minPrice: string;
  maxPrice: string;
  /**
   * Budget cible saisi librement sur la page d'accueil. Contrairement à
   * `maxPrice` (plafond strict), la recherche élargit autour de ce montant
   * pour proposer des approximations — voir BUDGET_TOLERANCE.
   */
  budget: string;
  sort: "recent" | "prix-asc" | "prix-desc" | "rating" | "budget";
}

export type ListingView = "grid" | "list";

export interface UploadedPhoto {
  name: string;
  url: string;
  /** Fichier brut, conservé pour l'upload vers Supabase Storage à la publication. */
  file?: File;
}

export interface ListingDraft {
  city: string;
  quartier: string;
  address: string;
  precision: string;
  title: string;
  rooms: string;
  baths: string;
  surface: string;
  type: ListingKind;
  desc: string;
  photos: UploadedPhoto[];
  amenities: string[];
  price: string;
  deposit: string;
  charges: "non" | "oui" | "partiel";
  minDuration: string;
}
