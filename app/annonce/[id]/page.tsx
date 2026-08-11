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
