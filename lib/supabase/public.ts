import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Client Supabase pour les lectures publiques en Server Component
 * (page d'accueil, etc.) — volontairement SANS `cookies()` de next/headers.
 *
 * `cookies()` (utilisé par lib/supabase/server.ts) est une API "dynamique" :
 * dès qu'une route l'appelle, Next.js désactive tout cache pour cette page
 * et la re-rend entièrement à chaque requête (`Cache-Control: no-store`).
 * Ces pages ne font que lire des données publiques (aucune session, aucune
 * personnalisation par utilisateur), donc pas besoin de cookies — ce client
 * permet à Next.js de les mettre en cache/ISR (voir `revalidate` dans les
 * pages qui l'utilisent) au lieu de tout recalculer à chaque visite.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
