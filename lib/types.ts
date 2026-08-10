// ═══════════════════════════════════════════════
// Types partagés — Immo237
// ═══════════════════════════════════════════════

export type ListingKind = "longue" | "courte";

export interface Owner {
  name: string;
  avatar: string;
  rating: number;
  listings: number;
  phone: string;
}

export interface Property {
  id: number;
  title: string;
  city: string;
  quartier: string;
  address?: string;
  type: ListingKind;
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
  createdAt?: string;
}

export type UserRole = "visitor" | "owner";

export interface User {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
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
  quartier: string;
  rooms: string;
  minPrice: string;
  maxPrice: string;
  sort: "recent" | "prix-asc" | "prix-desc" | "rating";
}

export type ListingView = "grid" | "list";

export interface UploadedPhoto {
  name: string;
  url: string;
}

export interface UploadedVideo {
  name: string;
  size: number;
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
