"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore, getVisitorId } from "@/lib/store";
import { ACQ_STORAGE_KEY } from "@/lib/marketing";

/**
 * Enregistre l'arrivée d'un visiteur venu d'un lien de campagne
 * (?utm_source=whatsapp&utm_medium=social&utm_campaign=rentree-2026).
 *
 * - Première touche : la toute première provenance est gardée dans le
 *   navigateur et jamais écrasée, c'est elle qui sera rattachée au compte si
 *   la personne s'inscrit plus tard (voir ConnexionPageClient).
 * - Une visite n'est comptée qu'une fois par onglet et par campagne ; la base
 *   déduplique en plus par visiteur, campagne et jour (log_campaign_visit).
 * - Aucune donnée personnelle : seulement l'identifiant technique anonyme
 *   déjà utilisé pour les vues et les favoris.
 *
 * Ne rend rien : composant purement fonctionnel, monté une fois dans le layout.
 */
export default function CampaignTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source");
      if (!source) return;
      const medium = params.get("utm_medium") ?? "";
      const campaign = params.get("utm_campaign") ?? "";

      if (!localStorage.getItem(ACQ_STORAGE_KEY)) {
        localStorage.setItem(
          ACQ_STORAGE_KEY,
          JSON.stringify({ source: source.toLowerCase(), medium: medium.toLowerCase(), campaign: campaign.toLowerCase() })
        );
      }

      const sentKey = `${ACQ_STORAGE_KEY}-sent:${source}:${medium}:${campaign}`;
      if (sessionStorage.getItem(sentKey)) return;
      const visitor = getVisitorId(useAppStore.getState().currentUser);
      if (!visitor) return;
      sessionStorage.setItem(sentKey, "1");

      createClient()
        .rpc("log_campaign_visit", {
          visitor,
          src: source,
          med: medium,
          camp: campaign,
          path: window.location.pathname,
        })
        .then(({ error }) => {
          if (error) console.error("Échec de l'enregistrement de la campagne :", error);
        });
    } catch {
      // Stockage indisponible (navigation privée…) : on renonce au suivi sans gêner la page.
    }
  }, []);

  return null;
}
