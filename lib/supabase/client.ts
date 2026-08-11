import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Client Supabase pour les Client Components ("use client").
 * Aucune authentification n'est utilisée dans cette app : la clé
 * publishable donne un accès public en lecture/écriture, encadré
 * par les policies RLS définies côté base de données.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
