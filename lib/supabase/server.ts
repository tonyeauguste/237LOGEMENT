import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Client Supabase pour les Server Components / Server Actions.
 * Pas d'authentification pour le moment — ce client sert uniquement
 * à lire/écrire les données publiques (annonces, messages) côté serveur.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component — sans effet ici
            // puisqu'il n'y a pas de session à rafraîchir.
          }
        },
      },
    }
  );
}
