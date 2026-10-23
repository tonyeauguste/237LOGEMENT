"use client";

import Link from "@/components/ui/LocalizedLink";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/i18n/IntlProvider";

// Affiché (avec un vrai statut HTTP 404) quand la page appelle notFound() :
// annonce supprimée, louée ou numéro inexistant. Le namespace
// "AnnonceNotFound" est transverse (voir SHARED_NAMESPACES), un composant
// de ce type ne recevant ni paramètres ni messages de la page.
export default function AnnonceNotFound() {
  const t = useTranslations("AnnonceNotFound");
  return (
    <div className="pt-[110px] px-[5%] pb-[80px] flex justify-center">
      <ComingSoon
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
          <Link href="/recherche">
            <Button variant="gold">{t("backButton")}</Button>
          </Link>
        }
      />
    </div>
  );
}
