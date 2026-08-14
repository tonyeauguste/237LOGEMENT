"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "./store";
import { useHasHydrated } from "./useHasHydrated";

/**
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié —
 * équivalent du "protectedPages" guard de l'original navigate().
 *
 * Attend que le store ait fini de relire la session persistée
 * (localStorage) avant de statuer : sinon, sur un rechargement de page,
 * currentUser vaut encore `null` pendant quelques millisecondes et un
 * utilisateur bel et bien connecté se retrouvait renvoyé vers la page
 * de connexion à tort.
 */
export function useAuthGuard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      showToast("🔒 Veuillez vous connecter pour accéder à cette page.", "info");
      router.replace("/connexion?tab=login");
    }
    // Volontairement dépendant de `hydrated` seul : ce garde ne doit jouer
    // qu'à l'arrivée sur la page (une fois qu'on sait vraiment si une
    // session persistée existe). Le re-déclencher à chaque changement de
    // currentUser ferait doublon avec le bouton "Déconnexion" de chaque
    // page, qui gère déjà lui-même son toast et sa redirection — d'où
    // un flash de deux toasts contradictoires et une redirection vers
    // /connexion au lieu de la page attendue après une déconnexion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Tant que l'hydratation n'est pas terminée, on ne sait pas encore si
  // l'utilisateur est connecté : renvoyer `undefined` (plutôt que `null`)
  // permet aux pages de distinguer "en cours de vérification" de
  // "vraiment déconnecté" si besoin, tout en gardant `if (!user) return null`
  // valide dans les deux cas pour éviter un flash de contenu protégé.
  return hydrated ? currentUser : undefined;
}
