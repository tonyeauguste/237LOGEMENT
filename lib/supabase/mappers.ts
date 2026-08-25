import type { Tables } from "./database.types";
import type { ListingKind, ListingStatus, OccupancyStatus, Property, TransactionType } from "@/lib/types";
import { DEFAULT_AVATAR } from "@/lib/data";

export type PropertyRow = Tables<"properties">;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80";

/** Convertit une ligne `properties` de Supabase vers le type `Property` utilisé par les composants. */
export function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    quartier: row.quartier,
    address: row.address ?? undefined,
    transactionType: (row.transaction_type as TransactionType) ?? "location",
    type: (row.type as ListingKind | null) ?? null,
    kind: row.kind ?? "appartement",
    occupancyStatus: (row.occupancy_status as OccupancyStatus | null) ?? null,
    price: Number(row.price) || 0,
    rooms: row.rooms,
    baths: row.baths,
    surface: row.surface ? Number(row.surface) : 0,
    desc: row.description ?? "",
    imgs: row.images && row.images.length > 0 ? row.images : [FALLBACK_IMG],
    videos: row.videos ?? [],
    amenities: row.amenities ?? [],
    verified: row.verified,
    available: row.available,
    views: row.views,
    favs: row.favs,
    owner: {
      name: row.owner_name || "Propriétaire",
      avatar: row.owner_avatar || DEFAULT_AVATAR,
      rating: Number(row.owner_rating) || 4.5,
      listings: row.owner_listings ?? 1,
      phone: row.owner_phone || "",
    },
    ownerId: row.owner_id,
    status: (row.status as ListingStatus) ?? "active",
    createdAt: row.created_at,
  };
}
