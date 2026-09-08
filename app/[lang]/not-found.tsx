"use client";

// Page 404 — jusqu'ici absente du projet : toute URL non reconnue (lien
// externe cassé, faute de frappe) retombait sur la page d'erreur Next.js
// par défaut, non stylée et en anglais uniquement, sans navbar ni moyen de
// revenir sur le site. Trouvé lors de l'audit pré-déploiement.
//
// Composant client (pas de params ici — un not-found.tsx n'en reçoit pas
// de façon fiable, voir la doc Next.js) : la locale vient du contexte
// IntlProvider déjà posé par app/[lang]/layout.tsx, exactement comme
// n'importe quelle autre page cliente du site (Tarifs, FAQ…).

import Link from "next/link";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/i18n/IntlProvider";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="pt-[110px] px-[5%] pb-[80px] flex justify-center min-h-[60vh]">
      <ComingSoon
        icon="🧭"
        title={t("title")}
        text={
          <>
            {t("line1")}
            <br />
            {t("line2")}
          </>
        }
        badge={t("badge")}
        action={
          <Link href="/">
            <Button variant="gold">{t("backButton")}</Button>
          </Link>
        }
      />
    </div>
  );
}
