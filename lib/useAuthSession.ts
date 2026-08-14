"use client";

import { useEffect } from "react";
import { createClient } from "./supabase/client";
import { buildUserFromSession, useAppStore } from "./store";

// Un seul abonnement onAuthStateChange par session de navigation, même si
// ce hook est monté sur plusieurs pages successivement (il est appelé
// depuis la Navbar, montée sur toutes les pages).
let started = false;

/**
 * Démarre l'écoute de la session Supabase Auth (connexion/déconnexion/
 * rafraîchissement de jeton, y compris depuis un autre onglet) et tient
 * `useAppStore.currentUser` à jour. True une fois la session initiale
 * relue — indispensable avant de faire confiance à `currentUser` : juste
 * après le montage, on ne sait pas encore si une session existe (cookie
 * à relire de façon asynchrone), donc `useAuthGuard` doit attendre cette
 * valeur avant de décider de rediriger vers /connexion.
 */
export function useAuthSession() {
  const authLoading = useAppStore((s) => s.authLoading);

  useEffect(() => {
    if (started) return;
    started = true;

    const supabase = createClient();
    const { setCurrentUser, setAuthLoading } = useAppStore.getState();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setCurrentUser(session ? await buildUserFromSession(session) : null);
      setAuthLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null);
        return;
      }
      buildUserFromSession(session).then(setCurrentUser);
    });
  }, []);

  return !authLoading;
}
