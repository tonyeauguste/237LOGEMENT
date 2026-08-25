"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Check } from "lucide-react";
import CameroonFlag from "@/components/ui/CameroonFlag";
import Button from "@/components/ui/Button";
import CityInput from "@/components/ui/CityInput";
import { PROPERTY_KINDS } from "@/lib/data";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=90",
    alt: "Belle villa",
  },
  {
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=85",
    alt: "Maison moderne",
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=85",
    alt: "Villa luxe",
  },
];

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const router = useRouter();
  const cityRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const kindRef = useRef<HTMLSelectElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  function launchSearch() {
    const params = new URLSearchParams();
    // .trim() sur la ville : saisie libre désormais, un espace en trop ne
    // doit pas produire une recherche qui ne remonte rien.
    const city = cityRef.current?.value.trim();
    if (city) params.set("city", city);
    if (typeRef.current?.value) params.set("type", typeRef.current.value);
    if (kindRef.current?.value) params.set("kind", kindRef.current.value);
    // `budget` (montant cible, élargi par la recherche) et non `maxp`
    // (plafond strict, qui reste utilisable depuis les filtres avancés).
    if (budgetRef.current?.value) params.set("budget", budgetRef.current.value);
    router.push(`/recherche${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden w-full">
      {/* Background slider */}
      <div className="absolute inset-0 w-full h-full z-0">
        {SLIDES.map((s, i) => (
          <motion.div
            key={s.src}
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ opacity: i === slide ? 1 : 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={i === slide ? { scale: 1.12 } : { scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[rgba(4,10,20,.55)] via-[rgba(4,10,20,.82)] to-[rgba(4,10,20,.95)] md:bg-gradient-to-r md:from-[rgba(4,10,20,.88)] md:via-[rgba(4,10,20,.70)] md:to-[rgba(4,10,20,.35)]" />

      {/* Left content */}
      <div className="relative z-[2] px-[5%] md:px-[8%] pt-[clamp(100px,14vh,140px)] pb-[60px] max-w-[700px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="inline-flex items-center gap-2 bg-[rgba(200,155,60,.15)] border border-[rgba(200,155,60,.4)] rounded-full px-4 py-[7px] text-xs font-semibold text-gold tracking-[.5px] mb-6 backdrop-blur-md"
        >
          <CameroonFlag width={18} height={13} />
          N°1 de l&apos;immobilier au Cameroun
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="font-display text-[clamp(28px,8vw,66px)] font-bold leading-[1.1] text-white mb-[22px]"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,.5)" }}
        >
          Votre <span className="text-gold">maison idéale</span>
          <br className="hidden md:block" /> au Cameroun,
          <br className="hidden md:block" /> trouvée en minutes
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-[rgba(237,233,225,.8)] text-sm md:text-[17px] leading-[1.8] max-w-[500px] mb-10"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          Des annonces vérifiées à Yaoundé, Douala, Bafoussam et dans tout le pays. Location
          courte ou longue durée, sans intermédiaire.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28 }}
          className="bg-[rgba(7,17,30,.75)] border border-[rgba(200,155,60,.25)] rounded-[18px] p-[22px] shadow-[0_32px_80px_rgba(0,0,0,.5)] mb-[26px] backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <CityInput ref={cityRef} placeholder="📍 Ville (toutes villes acceptées)" />
            <select ref={typeRef} className="form-control">
              <option value="">🏠 Type</option>
              <option value="longue">Long terme</option>
              <option value="courte">Court séjour</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Type de bien (nature du logement) — remplace l'ancien filtre
                "Chambres", plus parlant pour choisir ce qu'on cherche. Le
                nombre de chambres reste filtrable sur la page /recherche. */}
            <select ref={kindRef} className="form-control">
              <option value="">🏘 Type de bien</option>
              {PROPERTY_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.icon} {k.label}
                </option>
              ))}
            </select>
            {/* Budget en saisie libre : les paliers figés d'avant obligeaient
                à arrondir son budget réel. La recherche élargit ensuite
                autour du montant saisi (voir BUDGET_TOLERANCE). */}
            <input
              ref={budgetRef}
              type="number"
              min={0}
              step={5000}
              inputMode="numeric"
              className="form-control"
              placeholder="💰 Budget approximatif (FCFA)"
            />
          </div>
          <Button variant="gold" full onClick={launchSearch} className="mt-1">
            <Search size={16} />
            Rechercher maintenant
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.36 }}
          className="flex gap-5 flex-wrap"
        >
          {["Propriétaires vérifiés", "Contact direct", "Support 7j/7"].map((t) => (
            <div
              key={t}
              className="flex items-center gap-1.5 text-xs text-[rgba(237,233,225,.7)]"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,.5)" }}
            >
              <Check size={14} className="text-green2" /> {t}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[3]">
        {SLIDES.map((_, i) => (
          // Le point visuel fait 8px, bien en dessous des ~40px recommandés
          // au tactile — le padding + marge négative agrandit la zone
          // cliquable réelle sans changer l'apparence ni l'espacement de la
          // rangée (la marge négative annule juste le surcroît de mise en
          // page qu'ajouterait le padding).
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Image ${i + 1}`}
            className="p-2.5 -m-2.5 flex items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                i === slide ? "w-7 bg-gold" : "w-2 bg-white/35"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div
        onClick={() =>
          document.querySelector("#stats-bar")?.scrollIntoView({ behavior: "smooth" })
        }
        className="hidden md:flex absolute bottom-8 right-[5%] z-[3] flex-col items-center gap-1.5 text-white/45 text-[11px] tracking-[1px] uppercase cursor-pointer"
      >
        <span className="w-px h-9 bg-gradient-to-b from-[rgba(200,155,60,.6)] to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
        <span>Défiler</span>
      </div>
    </section>
  );
}
