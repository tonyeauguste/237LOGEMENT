import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rowToProperty } from "@/lib/supabase/mappers";
import PropertyDetail from "@/components/property/PropertyDetail";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export default async function AnnonceDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
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

  if (!Number.isFinite(numericId)) return notFoundBlock;

  const { data: row } = await supabase
    .from("properties")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

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

  // Best-effort : une erreur ici ne doit pas empêcher l'affichage de la
  // fiche. Pas d'incrément optimiste côté application — désormais
  // conditionnel (déduplication + exclusion propriétaire), donc `row.views`
  // tel que lu reste la seule valeur fiable à afficher pour ce chargement.
  if (visitorId) {
    const { error: viewError } = await supabase.rpc("register_property_view", {
      prop_id: row.id,
      visitor: visitorId,
    });
    if (viewError) console.error("Échec de l'enregistrement de la vue :", viewError);
  }

  const property = rowToProperty(row);

  const { data: similarRows } = await supabase
    .from("properties")
    .select("*")
    .eq("city", property.city)
    .neq("id", property.id)
    .limit(3);

  const similar = (similarRows ?? []).map(rowToProperty);

  return <PropertyDetail p={property} similar={similar} />;
}
