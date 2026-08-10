"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "./store";

/**
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié —
 * équivalent du "protectedPages" guard de l'original navigate().
 */
export function useAuthGuard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      showToast("🔒 Veuillez vous connecter pour accéder à cette page.", "info");
      router.replace("/connexion?tab=login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return currentUser;
}
