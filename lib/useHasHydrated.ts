"use client";

import { useEffect, useState } from "react";
import { hydrateFromStorage } from "./store";

// Un seul rechargement depuis localStorage par session de navigation,
// même si useAuthGuard() est monté sur plusieurs pages successivement.
let hydratedOnce = false;

/**
 * True une fois que le store a relu la session persistée (localStorage).
 * Indispensable avant de décider quoi que ce soit à partir de
 * `currentUser` : juste après le montage, currentUser vaut encore
 * `null` (valeur par défaut, identique côté serveur) même si une
 * session est bel et bien persistée — sans ce garde-fou, useAuthGuard
 * renvoyait à tort vers /connexion un utilisateur pourtant déjà
 * connecté.
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(hydratedOnce);

  useEffect(() => {
    if (!hydratedOnce) {
      hydrateFromStorage();
      hydratedOnce = true;
    }
    setHydrated(true);
  }, []);

  return hydrated;
}
