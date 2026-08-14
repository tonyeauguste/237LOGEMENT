"use client";

import { create } from "zustand";
import type { ToastItem, ToastType, User } from "./types";

const STORAGE_KEY = "immo237-session";

interface PersistedShape {
  currentUser: User | null;
  favorites: number[];
}

function loadPersisted(): PersistedShape {
  if (typeof window === "undefined") return { currentUser: null, favorites: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentUser: null, favorites: [] };
    const parsed = JSON.parse(raw);
    // Migration silencieuse : une version antérieure utilisait le
    // middleware `persist` de zustand, qui enveloppe les données dans
    // { state: {...}, version }. On lit l'un ou l'autre format pour ne
    // pas déconnecter les quelques sessions déjà enregistrées ainsi.
    const source = parsed?.currentUser !== undefined || parsed?.favorites !== undefined
      ? parsed
      : parsed?.state;
    return {
      currentUser: source?.currentUser ?? null,
      favorites: Array.isArray(source?.favorites) ? source.favorites : [],
    };
  } catch {
    return { currentUser: null, favorites: [] };
  }
}

function savePersisted(state: PersistedShape) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota dépassé, navigation privée, etc. — on continue sans persister.
  }
}

const ACCOUNTS_KEY = "immo237-accounts";

/**
 * Annuaire local { email → dernier profil connu (rôle inclus) }.
 *
 * Il n'y a pas de backend d'authentification pour le moment (voir
 * lib/supabase/client.ts) : /connexion ne vérifie aucun mot de passe et
 * déduisait jusqu'ici le rôle ("visiteur" vs "propriétaire") d'un simple
 * indice dans l'adresse email à *chaque* connexion. Un propriétaire
 * inscrit avec une adresse "normale" (sans "proprio"/"owner" dedans) se
 * retrouvait donc reclassé visiteur — et privé de son tableau de bord —
 * dès sa deuxième connexion. On mémorise maintenant le profil choisi à
 * l'inscription pour que le rôle reste stable d'une connexion à l'autre
 * sur le même appareil.
 */
function loadAccounts(): Record<string, User> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function rememberAccount(user: User) {
  if (typeof window === "undefined" || !user.email) return;
  try {
    const accounts = loadAccounts();
    accounts[user.email.trim().toLowerCase()] = user;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Quota dépassé, navigation privée, etc. — on continue sans mémoriser.
  }
}

/** Retrouve le profil (et donc le rôle) précédemment enregistré pour cet email, s'il existe. */
export function findAccountByEmail(email: string): User | null {
  if (!email) return null;
  return loadAccounts()[email.trim().toLowerCase()] ?? null;
}

let toastSeq = 1;

interface AppState {
  // ── Utilisateur (mock) ──────────────────────────
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;

  // ── Favoris ──────────────────────────────────────
  favorites: number[];
  isFav: (id: number) => boolean;
  toggleFav: (id: number) => void;

  // ── Toasts ───────────────────────────────────────
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

/**
 * currentUser/favorites sont sauvegardés dans localStorage à la main
 * (voir savePersisted, appelé depuis login/logout/toggleFav) plutôt que
 * via le middleware `persist` de zustand : ce dernier réhydratait bien
 * les bonnes données (vérifié via onRehydrateStorage), mais celles-ci
 * n'étaient pas fiablement visibles depuis les composants React au bon
 * moment (souci de timing entre le hook useSyncExternalStore et la fin
 * de la réhydratation) — d'où le bug de "reconnexion" : l'utilisateur
 * se connectait, rechargeait la page, et se retrouvait renvoyé vers
 * /connexion malgré une session pourtant bien enregistrée. Ce chargement
 * manuel réutilise le même `set()` simple qui fonctionne déjà pour
 * login/logout, donc pas de nouvelle source de timing foireux.
 * Voir hydrateFromStorage() + useHasHydrated().
 */
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  login: (user) => {
    set({ currentUser: user });
    savePersisted({ currentUser: user, favorites: get().favorites });
    rememberAccount(user);
  },
  logout: () => {
    set({ currentUser: null });
    savePersisted({ currentUser: null, favorites: get().favorites });
  },

  favorites: [],
  isFav: (id) => get().favorites.includes(id),
  toggleFav: (id) => {
    const has = get().favorites.includes(id);
    const favorites = has
      ? get().favorites.filter((f) => f !== id)
      : [...get().favorites, id];
    set({ favorites });
    savePersisted({ currentUser: get().currentUser, favorites });
    get().showToast(
      has ? "💔 Retiré des favoris" : "❤️ Ajouté aux favoris !",
      has ? "info" : "success"
    );
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

/**
 * Relit localStorage et applique la session trouvée au store. À appeler
 * une seule fois côté client, avant de faire confiance à currentUser —
 * voir useHasHydrated().
 */
export function hydrateFromStorage() {
  const persisted = loadPersisted();
  useAppStore.setState({
    currentUser: persisted.currentUser,
    favorites: persisted.favorites,
  });
}
