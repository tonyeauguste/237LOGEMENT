"use client";

import CountUp from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

export default function StatsBar() {
  return (
    <div id="stats-bar" className="bg-bg2 border-y border-border">
      <div className="max-w-[1240px] mx-auto px-[5%] py-8 grid grid-cols-2 lg:grid-cols-4">
        <Reveal className="text-center px-5 py-4 lg:border-r lg:border-border">
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">
            <CountUp value="45+" />
          </div>
          <div className="text-[13px] text-muted mt-1">Villes couvertes</div>
        </Reveal>

        <Reveal
          delay={0.08}
          className="col-span-2 order-first lg:order-none flex items-start gap-3 text-left px-6 py-5 bg-gradient-to-br from-[rgba(200,155,60,.08)] to-[rgba(200,155,60,.03)] border-y-2 lg:border-y-0 lg:border-x-2 border-gold justify-center lg:justify-start"
        >
          <div className="text-[28px] leading-none shrink-0 mt-0.5">🔥</div>
          <div>
            <div className="text-sm font-bold text-gold mb-1 leading-tight">
              Promo Exceptionnelle : Publication Gratuite !
            </div>
            <div className="text-xs text-muted leading-relaxed">
              Profitez de notre offre de lancement : déposez toutes vos annonces immobilières à{" "}
              <strong className="text-gold">0 FCFA</strong> au lieu des frais d&apos;agence
              habituels.
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="text-center px-5 py-4 border-t lg:border-t-0 border-border">
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">
            <CountUp value="100%" />
          </div>
          <div className="text-[13px] text-muted mt-1">Propriétaires vérifiés</div>
        </Reveal>

        <Reveal
          delay={0.24}
          className="text-center px-5 py-4 border-t lg:border-t-0 lg:border-l border-border"
        >
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold">
            7j/7
          </div>
          <div className="text-[13px] text-muted mt-1">Support disponible</div>
        </Reveal>
      </div>
    </div>
  );
}
