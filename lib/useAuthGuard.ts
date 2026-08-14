"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "./store";
import { useAuthSession } from "./useAuthSession";
import type { UserRole } from "./types";

const DASH_BY_ROLE: Record<UserRole, string> = {
  owner: "/compte/proprietaire",
  visitor: "/compte/visiteur",
};

/**
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié, et —
 * si `requiredRole` est fourni — vers SON tableau de bord si son rôle ne
 * correspond pas à celui de la page (ex. un visiteur qui arrive sur
 * /compte/proprietaire par un lien direct). Avant ce garde, n'importe
 * quel compte connecté pouvait consulter le tableau de bord de l'autre
 * rôle sans être bloqué.
 *
 * Attend que la session Supabase ait fini d'être relue (useAuthSession)
 * avant de statuer : sinon, sur un rechargement de page, currentUser
 * vaut encore `null` pendant la vérification asynchrone du cookie de
 * session et un utilisateur bel et bien connecté se retrouvait renvoyé
 * vers la page de connexion à tort.
 */
export function useAuthGuard(requiredRole?: UserRole) {
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const ready = useAuthSession();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      showToast("🔒 Veuillez vous connecter pour accéder à cette page.", "info");
      router.replace("/connexion?tab=login");
      return;
    }
    if (requiredRole && currentUser.role !== requiredRole) {
      showToast("⛔ Cette page n'est pas accessible depuis ce type de compte.", "info");
      router.replace(DASH_BY_ROLE[currentUser.role]);
    }
    // Volontairement dépendant de `ready`/`requiredRole` seuls (pas de
    // currentUser) : ce garde ne doit jouer qu'à l'arrivée sur la page,
    // pas à chaque changement d'utilisateur (le bouton "Déconnexion" de
    // chaque page gère déjà lui-même son toast et sa redirection).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, requiredRole]);

  // `undefined` couvre à la fois "session pas encore confirmée" et "rôle
  // incorrect, redirection en cours" : dans les deux cas, la page ne doit
  // rien afficher (`if (!user) return null`) pour éviter un flash du
  // mauvais tableau de bord avant que la redirection ne s'exécute.
  if (!ready) return undefined;
  if (requiredRole && currentUser && currentUser.role !== requiredRole) return undefined;
  return currentUser;
}
