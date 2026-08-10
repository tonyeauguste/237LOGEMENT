"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/lib/data";
import type { FaqCategory } from "@/lib/data";
import { useAppStore } from "@/lib/store";

export default function FaqPage() {
  const [cat, setCat] = useState<FaqCategory | "all">("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  const filtered = FAQ_ITEMS.map((item, i) => ({ ...item, i })).filter(
    (item) => cat === "all" || item.cat === cat
  );

  return (
    <div className="max-w-[760px] mx-auto px-[5%] pt-[90px] pb-20">
      <div className="text-center mb-[52px]">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          Centre d&apos;aide
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="font-display text-[clamp(26px,3.5vw,46px)] font-bold text-text mt-2">
            Questions <span className="text-gold">fréquentes</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="gold-bar mt-3.5 mx-auto" />
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-[15px] mt-3.5 max-w-[480px] mx-auto">
            Trouvez rapidement les réponses à vos questions. Si vous ne trouvez pas ce que vous
            cherchez, notre équipe est disponible 7j/7.
          </p>
        </Reveal>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mb-10">
        {FAQ_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCat(c.value)}
            className={clsx(
              "px-[18px] py-2 rounded-full border-[1.5px] text-[13px] cursor-pointer transition-colors",
              cat === c.value ? "border-gold bg-gold3 text-gold" : "border-border text-muted hover:border-gold"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const isOpen = openIdx === item.i;
          return (
            <div
              key={item.i}
              className={clsx(
                "bg-card border rounded-2xl overflow-hidden transition-colors",
                isOpen ? "border-[rgba(200,155,60,.3)]" : "border-border"
              )}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : item.i)}
                className="w-full flex justify-between items-center gap-3.5 px-[22px] py-[18px] bg-none border-none cursor-pointer text-left"
              >
                <span className="text-[15px] font-medium text-text leading-tight flex-1">{item.q}</span>
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
                    <p className="text-sm text-muted leading-[1.75] px-[22px] pb-5">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="bg-card2 border border-border rounded-2xl p-8 text-center mt-12">
        <h3 className="font-display text-[22px] font-bold text-text mb-2.5">
          Vous n&apos;avez pas trouvé votre réponse ?
        </h3>
        <p className="text-muted text-sm mb-[22px]">
          Notre équipe de support est disponible du lundi au samedi, de 8h à 18h (heure de
          Yaoundé). Réponse garantie sous 24h.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/contact">
            <Button variant="gold">Nous écrire</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => showToast("📞 +237 679 312 363 — Disponible Lun–Sam 8h–18h", "info")}
          >
            📞 Nous appeler
          </Button>
        </div>
      </div>
    </div>
  );
}
