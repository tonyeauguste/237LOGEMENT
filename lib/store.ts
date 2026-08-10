"use client";

import { create } from "zustand";
import type { ToastItem, ToastType, User } from "./types";

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

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  favorites: [],
  isFav: (id) => get().favorites.includes(id),
  toggleFav: (id) => {
    const has = get().favorites.includes(id);
    set({
      favorites: has
        ? get().favorites.filter((f) => f !== id)
        : [...get().favorites, id],
    });
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
