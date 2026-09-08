"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { fmtMoneyInput } from "@/lib/format";
import type { FormuleTarif } from "@/lib/tarifs";
import { useTranslations } from "@/i18n/IntlProvider";

/**
 * Carte tarifaire — sait afficher les deux états lus depuis
 * PROMO_LANCEMENT_ACTIVE (voir lib/tarifs.ts), même si aujourd'hui seul
 * l'état promo est utilisé en production :
 * - promo active : prix normal barré (avec libellé <s> explicite pour les
 *   lecteurs d'écran) + "0 FCFA" en gros + pastille "Offert" ; bouton vers
 *   /publier (ou l'inscription si non connecté).
 * - promo inactive : prix normal seul, en gros, pas de barré ni de
 *   pastille ; le bouton est censé mener au futur parcours de paiement —
 *   ce parcours n'existe pas encore (hors périmètre de cette tâche, voir
 *   le prompt "page-tarifs", section "Pour plus tard"), donc en attendant
 *   il pointe vers la même destination que ci-dessus plutôt que vers un
 *   lien mort.
 *
 * Habillage repris d'une maquette de référence fournie par l'utilisateur
 * (fond translucide + liseré fin plutôt que des cartes pleines, badges en
 * ligne plutôt qu'en angle flottant, échelle typographique plus resserrée)
 * — voir le prompt "présentable et professionnel" pour /tarifs.
 */
export default function PricingCard({
  formule,
  promoActive,
  publishHref,
}: {
  formule: FormuleTarif;
  promoActive: boolean;
  publishHref: string;
}) {
  const t = useTranslations("Tarifs");
  const prixFmt = `${fmtMoneyInput(formule.prixNormal)} FCFA`;
  const suffixe = formule.periodicite === "mois" ? t("perMonth") : "";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={clsx(
        "flex flex-col rounded-2xl p-5 backdrop-blur-sm",
        formule.populaire
          ? "border-[1.5px] border-gold bg-gradient-to-b from-[rgba(200,155,60,.14)] to-white/[0.04]"
          : "border border-white/10 bg-white/[0.04]"
      )}
    >
      {formule.populaire && (
        <span className="self-start mb-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gold text-[#412402]">
          {t("mostChosenBadge")}
        </span>
      )}

      <h3 className="text-[15px] font-semibold text-text">{formule.nom}</h3>
      <p className="text-[12px] text-muted mt-0.5 mb-4">{formule.volume}</p>

      {promoActive ? (
        <div className="mb-4">
          <p className="text-[12px] text-dim">
            <s aria-label={t("normalPriceScreenReader", { price: prixFmt, suffix: suffixe })}>
              {prixFmt}
            </s>
            {suffixe}
          </p>
          <div className="font-display text-[30px] leading-tight font-bold text-gold mt-1">
            {t("freeAmount")}
          </div>
          <div className="text-[11px] text-muted mt-0.5 mb-2.5">{t("duringLaunch")}</div>
          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[rgba(200,155,60,.18)] text-gold">
            {t("offeredBadge")}
          </span>
        </div>
      ) : (
        <div className="mb-4">
          <div className="font-display text-[26px] leading-tight font-bold text-text">
            {prixFmt}
            {suffixe && <span className="text-[13px] font-normal text-muted">{suffixe}</span>}
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2 mb-6">
        {formule.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] text-text/85 leading-snug">
            <Check size={14} className="text-gold shrink-0 mt-[2px]" />
            {f}
          </li>
        ))}
      </ul>

      <Link href={publishHref} className="mt-auto">
        <Button variant="gold" size="sm" full>
          {t("publishNow")}
        </Button>
      </Link>
    </motion.div>
  );
}
