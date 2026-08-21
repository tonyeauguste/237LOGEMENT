"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "./store";
import { useAuthSession } from "./useAuthSession";

/**
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié.
 *
 * Il n'y a plus de garde par rôle : depuis la fusion des espaces visiteur
 * et propriétaire, tout compte connecté accède au même tableau de bord
 * (/compte) et peut aussi bien sauvegarder des favoris que publier une
 * annonce. Le rôle ne sert plus qu'à débloquer la section Administration,
 * vérifiée séparément côté base par les policies RLS (`is_admin()`).
 *
 * Attend que la session Supabase ait fini d'être relue (useAuthSession)
 * avant de statuer : sinon, sur un rechargement de page, currentUser
 * vaut encore `null` pendant la vérification asynchrone du cookie de
 * session et un utilisateur bel et bien connecté se retrouvait renvoyé
 * vers la page de connexion à tort.
 */
export function useAuthGuard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const ready = useAuthSession();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      showToast("🔒 Veuillez vous connecter pour accéder à cette page.", "info");
      router.replace("/connexion?tab=login");
    }
    // Volontairement dépendant de `ready` seul (pas de currentUser) : ce
    // garde ne doit jouer qu'à l'arrivée sur la page, pas à chaque
    // changement d'utilisateur (le bouton "Déconnexion" de chaque page
    // gère déjà lui-même son toast et sa redirection).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // `undefined` tant que la session n'est pas confirmée : la page ne doit
  // rien afficher de sensible avant de savoir si quelqu'un est connecté.
  if (!ready) return undefined;
  return currentUser;
}
