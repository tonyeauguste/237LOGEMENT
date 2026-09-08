import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rowToProperty } from "@/lib/supabase/mappers";
import PropertyDetail from "@/components/property/PropertyDetail";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type PageParams = { lang: string; id: string };

// cache() : generateMetadata et le composant de page s'exécutent tous les
// deux pour la même requête — sans ce cache, la fiche serait interrogée
// deux fois en base à chaque chargement. React dédoublonne automatiquement
// les appels partageant les mêmes arguments dans une même requête.
const getPropertyRow = cache(async (numericId: number) => {
  if (!Number.isFinite(numericId)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("*").eq("id", numericId).maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const row = await getPropertyRow(Number(id));

  if (!row) {
    const messages = await getMessages(locale);
    const t = (messages as { AnnonceNotFound: { title: string } }).AnnonceNotFound;
    // noindex : une fiche introuvable ne doit jamais apparaître dans les
    // résultats de recherche.
    return { title: `${t.title} – 237Logement`, robots: { index: false, follow: false } };
  }

  // Description tirée du texte réel de l'annonce (tronqué à une longueur
  // raisonnable pour un extrait de résultat de recherche) plutôt qu'une
  // phrase générique : plus pertinent pour le référencement d'une fiche
  // individuelle, et déjà rédigé par le propriétaire.
  const desc = (row.description || "").trim();
  const description =
    desc.length > 155
      ? desc.slice(0, 155).trimEnd() + "…"
      : desc || `${row.title} à ${row.quartier}, ${row.city} — à découvrir sur 237Logement.`;

  return {
    title: `${row.title} à ${row.city} – 237Logement`,
    description,
  };
}

export default async function AnnonceDetailPage({ params }: { params: Promise<PageParams> }) {
  const { lang, id } = await params;
  const numericId = Number(id);

  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  const t = (messages as {
    AnnonceNotFound: { title: string; line1: string; line2: string; badge: string; backButton: string };
  }).AnnonceNotFound;

  const supabase = await createClient();

  const notFoundBlock = (
    <div className="pt-[110px] px-[5%] pb-[80px] flex justify-center">
      <ComingSoon
        title={t.title}
        text={
          <>
            {t.line1}
            <br />
            {t.line2}
          </>
        }
        badge={t.badge}
        action={
          <Link href="/recherche">
            <Button variant="gold">{t.backButton}</Button>
          </Link>
        }
      />
    </div>
  );

  const row = await getPropertyRow(numericId);
  if (!row) return notFoundBlock;

  // Compteur de vues, dédupliqué par visiteur (voir le prompt
  // "corriger-compteur-vues" — l'ancien increment_property_views
  // incrémentait sans condition à chaque chargement, y compris pour un
  // même visiteur revenant plusieurs fois). register_property_view fait
  // un upsert atomique dans property_views ; c'est le trigger
  // trg_property_views_sync (base) qui fait progresser properties.views,
  // une seule fois par (annonce, visiteur) distinct — jamais pour le
  // propriétaire consultant sa propre fiche (exclusion faite côté RPC).
  //
  // Identité du visiteur : son compte s'il est connecté, sinon le cookie
  // technique posé par proxy.ts (seul endroit qui peut écrire un cookie —
  // un Server Component ne le peut pas). getSession() plutôt que getUser()
  // ici : décodage local du JWT, pas d'aller-retour réseau vers le serveur
  // d'auth — l'enjeu (à qui attribuer une vue) ne justifie pas ce coût sur
  // une page à fort trafic, voir la contrainte de performance du prompt.
  const [{ data: { session } }, cookieStore] = await Promise.all([
    supabase.auth.getSession(),
    cookies(),
  ]);
  const visitorId = session
    ? `user:${session.user.id}`
    : cookieStore.get("v_id")?.value
      ? `anon:${cookieStore.get("v_id")!.value}`
      : null;

  const property = rowToProperty(row);

  // Best-effort : une erreur ici ne doit pas empêcher l'affichage de la
  // fiche. Pas d'incrément optimiste côté application — désormais
  // conditionnel (déduplication + exclusion propriétaire), donc `row.views`
  // tel que lu reste la seule valeur fiable à afficher pour ce chargement.
  //
  // En parallèle avec les annonces similaires plutôt qu'avant : ces deux
  // requêtes ne dépendent pas l'une de l'autre, les enchaîner ajoutait un
  // aller-retour réseau complet au temps de réponse (mesuré : ~1,2s de
  // TTFB sur cette page contre ~50-250ms ailleurs — trouvé lors du dernier
  // passage de vérification avant déploiement).
  const [viewResult, similarResult] = await Promise.all([
    visitorId
      ? supabase.rpc("register_property_view", { prop_id: row.id, visitor: visitorId })
      : Promise.resolve({ error: null }),
    supabase.from("properties").select("*").eq("city", property.city).neq("id", property.id).limit(3),
  ]);
  if (viewResult.error) console.error("Échec de l'enregistrement de la vue :", viewResult.error);

  const similar = (similarResult.data ?? []).map(rowToProperty);

  return <PropertyDetail p={property} similar={similar} />;
}
