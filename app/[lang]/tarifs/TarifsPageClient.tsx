"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";
import PricingCard from "@/components/tarifs/PricingCard";
import { PROMO_LANCEMENT_ACTIVE, GRILLE_TARIFAIRE } from "@/lib/tarifs";
import { useAppStore } from "@/lib/store";
import { useTranslations } from "@/i18n/IntlProvider";

// Tâche "page-tarifs" — page /tarifs, mode "offre de lancement". Portée :
// affichage uniquement, piloté par lib/tarifs.ts (PROMO_LANCEMENT_ACTIVE +
// GRILLE_TARIFAIRE) — aucune logique de paiement, aucun appel réseau vers
// un prestataire, aucune date ni compte à rebours nulle part sur la page
// (y compris dans le HTML rendu : pas de date cachée en commentaire ou en
// attribut data-*).

const FAQ_KEYS = ["end", "listings", "changePlan", "payLater"] as const;

export default function TarifsPage() {
  const t = useTranslations("Tarifs");
  const currentUser = useAppStore((s) => s.currentUser);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Même logique que le CTA "Publier mon bien" de la page d'accueil (voir
  // components/sections/CtaSection.tsx, Tâche 1 du prompt "publier-et-auth") :
  // connecté -> /publier directement ; sinon -> inscription puis retour à
  // /publier via returnTo.
  const publishHref = currentUser ? "/publier" : "/connexion?tab=register&returnTo=/publier";

  return (
    <div className="pb-20">
      {/* Tâche 1 — bandeau de lancement : fond orange doré, texte bleu
          nuit, pas de date/compte à rebours.
          pt-[90px] (70px de navbar fixed + marge) : la navbar est fixed et
          transparente tant qu'on n'a pas scrollé (voir Navbar.tsx) — sans
          cette marge, elle se superpose au bandeau doré au lieu de flotter
          au-dessus du fond sombre de la page, comme sur
          contact/faq/confidentialite (même valeur pt-[90px]). */}
      <div className="bg-gold text-[#07111E] px-[5%] pt-[90px] pb-7 text-center">
        <h1 className="font-display text-[clamp(20px,2.8vw,30px)] font-bold">{t("bannerTitle")}</h1>
        <p className="text-sm font-medium mt-1.5 opacity-90">{t("bannerSubtitle")}</p>
      </div>

      <div className="max-w-[1240px] mx-auto px-[5%] pt-16">
        <div className="text-center mb-9">
          <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{t("plansKicker")}</span>
          <p className="text-muted text-sm mt-2 max-w-[440px] mx-auto">{t("plansIntro")}</p>
        </div>

        {/* Tâche 2 — cartes tarifaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GRILLE_TARIFAIRE.map((formule, i) => (
            <Reveal key={formule.id} delay={i * 0.06}>
              <PricingCard formule={formule} promoActive={PROMO_LANCEMENT_ACTIVE} publishHref={publishHref} />
            </Reveal>
          ))}
        </div>

        {/* Tâche 4 — mention des moyens de paiement à venir, purement
            indicative : logos MTN Mobile Money / Orange Money fournis par
            l'utilisateur (voir public/mtn-momo.png, public/orange-money.png). */}
        <div className="flex flex-col items-center gap-4 mt-10">
          <p className="text-[13px] text-muted">{t("paymentMethodsNote")}</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="h-11 rounded-xl overflow-hidden border border-white/10">
              <Image
                src="/orange-money.png"
                alt="Orange Money"
                width={558}
                height={203}
                className="h-full w-auto"
              />
            </div>
            <div className="h-11 rounded-xl overflow-hidden border border-white/10">
              <Image
                src="/mtn-momo.png"
                alt="MTN Mobile Money (MoMo)"
                width={470}
                height={208}
                className="h-full w-auto"
              />
            </div>
          </div>
        </div>

        {/* Tâche 5 — FAQ */}
        <div className="max-w-[760px] mx-auto mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-[clamp(22px,3vw,32px)] font-bold text-text">{t("faqTitle")}</h2>
            <div className="gold-bar mt-3 mx-auto" />
          </div>
          <div className="flex flex-col gap-3">
            {FAQ_KEYS.map((key, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={key}
                  className={clsx(
                    "bg-card border rounded-2xl overflow-hidden transition-colors",
                    isOpen ? "border-[rgba(200,155,60,.3)]" : "border-border"
                  )}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex justify-between items-center gap-3.5 px-[22px] py-[18px] bg-none border-none cursor-pointer text-left"
                  >
                    <span className="text-[15px] font-medium text-text leading-tight flex-1">
                      {t(`faq.${key}Q`)}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0, backgroundColor: isOpen ? "rgba(200,155,60,.12)" : "#1C2E40" }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    >
                      <ChevronDown size={12} className={isOpen ? "text-gold" : "text-muted"} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted leading-[1.75] px-[22px] pb-5">
                          {t(`faq.${key}A`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
