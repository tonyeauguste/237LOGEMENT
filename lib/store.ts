"use client";

import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import type { ToastItem, ToastType, User, UserRole } from "./types";

const FAVORITES_KEY = "immo237-favorites";

function loadFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Quota dépassé, navigation privée, etc. — on continue sans persister.
  }
}

/**
 * Cookie technique posé par proxy.ts (voir son commentaire) — identifie un
 * visiteur anonyme pour dédupliquer les favoris côté serveur, même
 * identité que pour les vues (register_property_view).
 */
function getVisitorCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("v_id="))
    ?.split("=")[1];
}

/**
 * Identité visiteur partagée par toutes les RPC dédupliquées côté client
 * (favoris, notes propriétaire…) : compte connecté si disponible, sinon le
 * cookie technique posé par proxy.ts. `null` si ni l'un ni l'autre n'est
 * disponible (cookie pas encore posé) — l'appelant doit alors renoncer à
 * l'appel plutôt que d'envoyer un identifiant vide.
 */
export function getVisitorId(currentUser: User | null): string | null {
  const cookieId = getVisitorCookie();
  return currentUser ? `user:${currentUser.id}` : cookieId ? `anon:${cookieId}` : null;
}

/**
 * Compose le `User` applicatif à partir de la session Supabase Auth +
 * de la ligne `profiles` associée (rôle, statut, nom, téléphone, avatar).
 * Le rôle stocké en profil sert uniquement à l'affichage (quel tableau
 * de bord montrer) — jamais à l'autorisation côté base, qui repose sur
 * `owner_id = auth.uid()` (et `is_admin()` pour l'admin) dans les
 * policies RLS.
 *
 * Retourne `null` si le compte est bloqué (`profiles.status = 'blocked'`)
 * — la session est alors immédiatement fermée : un compte bloqué ne doit
 * jamais rester connecté, que ce soit à la connexion ou au rafraîchissement
 * d'un onglet déjà ouvert au moment où un admin le bloque.
 */
async function buildUserFromSession(session: Session): Promise<User | null> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.status === "blocked") {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: profile?.name || session.user.email?.split("@")[0] || "Utilisateur",
    phone: profile?.phone ?? undefined,
    city: profile?.city ?? undefined,
    role: (profile?.role as UserRole) ?? "visitor",
    status: (profile?.status as User["status"]) ?? "active",
    avatar: profile?.avatar || "",
  };
}

let toastSeq = 1;

interface AppState {
  // ── Session (Supabase Auth) ─────────────────────
  currentUser: User | null;
  /** true tant que la session initiale n'a pas encore été relue — voir lib/useAuthSession.ts. */
  authLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // ── Favoris (locaux à l'appareil, indépendants du compte) ──
  favorites: number[];
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => void;

  // ── Toasts ───────────────────────────────────────
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  authLoading: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  favorites: loadFavorites(),
  isFav: (id) => get().favorites.includes(id),
  toggleFav: (id) => {
    const has = get().favorites.includes(id);
    const favorites = has
      ? get().favorites.filter((f) => f !== id)
      : [...get().favorites, id];
    set({ favorites });
    saveFavorites(favorites);
    get().showToast(
      has ? "💔 Retiré des favoris" : "❤️ Ajouté aux favoris !",
      has ? "info" : "success"
    );
    // Tâche "corriger-compteur-vues" (suite favoris) — l'ancienne RPC
    // adjust_property_favs faisait confiance au delta ±1 envoyé par le
    // client sans identité visiteur ni déduplication côté serveur : le
    // même visiteur favorisant depuis deux appareils (ou après un vidage
    // de stockage local) gonflait le compteur pour une seule vraie
    // personne. set_property_favorite déduplique par (annonce, visiteur),
    // même identité que pour les vues — compte utilisateur si connecté,
    // sinon le cookie technique posé par proxy.ts. Les favoris restent
    // utilisables sans compte, donc pas de visitorId -> pas d'appel
    // (le favori reste local uniquement, best-effort comme avant).
    const visitor = getVisitorId(get().currentUser);
    if (!visitor) return;
    createClient()
      .rpc("set_property_favorite", { prop_id: id, visitor, is_fav: !has })
      .then(({ error }) => {
        if (error) console.error("Échec de la mise à jour du compteur de favoris :", error);
      });
  },

  toasts: [],
  showToast: (message, type = "info") => {
    const id = toastSeq++;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 3500);
  },
  removeToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export { buildUserFromSession };
