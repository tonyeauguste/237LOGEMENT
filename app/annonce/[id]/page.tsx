import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rowToProperty } from "@/lib/supabase/mappers";
import PropertyDetail from "@/components/property/PropertyDetail";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";

export default async function AnnonceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  const supabase = await createClient();

  const notFoundBlock = (
    <div className="pt-[110px] px-[5%] pb-[80px] flex justify-center">
      <ComingSoon
        title="Cette annonce n'est pas encore disponible"
        text={
          <>
            La plateforme est en cours de déploiement et cette fiche n&apos;existe pas encore.
            <br />
            Explorez nos autres pages en attendant le lancement officiel.
          </>
        }
        badge="🚀 Bientôt opérationnel"
        action={
          <Link href="/recherche">
            <Button variant="gold">Retour aux annonces</Button>
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

  // Compteur de vues : la colonne existe en base mais n'était jamais
  // incrémentée nulle part, donc le tableau de bord propriétaire affichait
  // toujours "0 vue" quel que soit le trafic réel sur l'annonce. On passe
  // par une fonction RPC dédiée (plutôt qu'un UPDATE direct) car un
  // visiteur non connecté doit pouvoir déclencher ce compteur sans avoir
  // pour autant le droit de modifier le reste de l'annonce — voir la
  // migration add_real_auth_profiles_and_ownership. Best-effort : une
  // erreur ici ne doit pas empêcher l'affichage de la fiche.
  const { error: viewError } = await supabase.rpc("increment_property_views", {
    prop_id: row.id,
  });
  if (viewError) console.error("Échec de l'incrément des vues :", viewError);

  const property = rowToProperty(viewError ? row : { ...row, views: row.views + 1 });

  const { data: similarRows } = await supabase
    .from("properties")
    .select("*")
    .eq("city", property.city)
    .neq("id", property.id)
    .limit(3);

  const similar = (similarRows ?? []).map(rowToProperty);

  return <PropertyDetail p={property} similar={similar} />;
}
