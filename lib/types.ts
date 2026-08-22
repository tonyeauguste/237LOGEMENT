// ═══════════════════════════════════════════════
// Types partagés — 237Logement
// ═══════════════════════════════════════════════

/** Durée de location. */
export type ListingKind = "longue" | "courte";

/**
 * Nature du bien (chambre, studio, villa…) — distincte de `ListingKind`
 * qui porte la durée. Volontairement `string` plutôt qu'une union figée :
 * les valeurs autorisées vivent dans PROPERTY_KINDS (lib/data.ts) et dans
 * la contrainte CHECK `properties_kind_check` côté base.
 */
export type PropertyKind = string;

export interface Owner {
  name: string;
  avatar: string;
  rating: number;
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
  /** Durée de location : longue ou courte. */
  type: ListingKind;
  /** Nature du bien : chambre, studio, villa… */
  kind: PropertyKind;
  price: number;
  rooms: number;
  baths: number;
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

export interface UploadedVideo {
  name: string;
  size: number;
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
  videos: UploadedVideo[];
  amenities: string[];
  price: string;
  deposit: string;
  charges: "non" | "oui" | "partiel";
  minDuration: string;
}
