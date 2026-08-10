"use client";

import { use } from "react";
import Link from "next/link";
import { PROPERTIES } from "@/lib/data";
import PropertyDetail from "@/components/property/PropertyDetail";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";

export default function AnnonceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const property = PROPERTIES.find((p) => String(p.id) === id);

  if (!property) {
    return (
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
  }

  return <PropertyDetail p={property} />;
}
