"use client";

import CountUp from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { useTranslations } from "@/i18n/IntlProvider";

export default function StatsBar() {
  const t = useTranslations("Home.stats");
  return (
    <div id="stats-bar" className="bg-bg2 border-y border-border">
      <div className="max-w-[1240px] mx-auto px-[5%] py-8 grid grid-cols-2 lg:grid-cols-4">
        <Reveal className="text-center px-5 py-4 lg:border-r lg:border-border">
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">
            <CountUp value="45+" />
          </div>
          <div className="text-[13px] text-muted mt-1">{t("cities")}</div>
        </Reveal>

        <Reveal
          delay={0.08}
          className="col-span-2 order-first lg:order-none flex items-start gap-3 text-left px-6 py-5 bg-gradient-to-br from-[rgba(200,155,60,.08)] to-[rgba(200,155,60,.03)] border-y-2 lg:border-y-0 lg:border-x-2 border-gold justify-center lg:justify-start"
        >
          <div className="text-[28px] leading-none shrink-0 mt-0.5">🔥</div>
          <div>
            <div className="text-sm font-bold text-gold mb-1 leading-tight">
              {t("promoTitle")}
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {/* Le prix est découpé pour rester en gras — {price} dans le
                  texte source marque où l'insérer (voir messages/*.json). */}
              {t("promoText").split("{price}")[0]}
              <strong className="text-gold">{t("promoPrice")}</strong>
              {t("promoText").split("{price}")[1]}
            </div>
          </div>
        </Reveal>

        {/* Pas de CountUp ici : "100%" affirmait un taux de vérification
            réel alors qu'aucune annonce n'est encore marquée vérifiée en
            base (le badge "🛡 Vérifié" existe mais n'est attribué par
            personne pour l'instant). On décrit la démarche plutôt qu'un
            chiffre qui serait faux dès la première annonce publiée. */}
        <Reveal delay={0.16} className="text-center px-5 py-4 border-t lg:border-t-0 border-border">
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">🛡</div>
          <div className="text-[13px] text-muted mt-1">{t("verification")}</div>
        </Reveal>

        <Reveal
          delay={0.24}
          className="text-center px-5 py-4 border-t lg:border-t-0 lg:border-l border-border"
        >
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">
            7j/7
          </div>
          <div className="text-[13px] text-muted mt-1">{t("support")}</div>
        </Reveal>
      </div>
    </div>
  );
}
