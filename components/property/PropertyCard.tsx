"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bed, Bath, Ruler, MapPin } from "lucide-react";
import type { Property } from "@/lib/types";
import { fmtPrice } from "@/lib/format";
import { FIELD_VISIBILITY_RULES, listingTypeMeta, propertyGroup } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import Tag from "@/components/ui/Tag";
import Stars from "@/components/ui/Stars";
import TiltCard from "@/components/ui/TiltCard";
import { motion } from "framer-motion";

export default function PropertyCard({ p }: { p: Property }) {
  const isFav = useAppStore((s) => s.isFav(p.id));
  const toggleFav = useAppStore((s) => s.toggleFav);
  const typeMeta = listingTypeMeta(p.type);
  // Un bureau ou un terrain n'ont pas de "chambres" — même règle que le
  // formulaire /publier (FIELD_VISIBILITY_RULES), pour ne pas afficher
  // "0 ch. · 0 sdb" sur ce type d'annonce.
  const rules = FIELD_VISIBILITY_RULES[propertyGroup(p.kind)];

  return (
    <TiltCard
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group [transform-style:preserve-3d]"
      strength={4}
    >
      <Link href={`/annonce/${p.id}`} className="block">
        <div className="h-[210px] overflow-hidden relative bg-bg3">
          <Image
            src={p.imgs[0]}
            alt={p.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              toggleFav(p.id);
            }}
            className={`absolute top-3 right-3 w-[34px] h-[34px] rounded-full backdrop-blur-md border flex items-center justify-center z-10 transition-colors ${
              isFav
                ? "bg-gold3 border-gold"
                : "bg-[rgba(7,17,30,.7)] border-white/10"
            }`}
          >
            <Heart size={15} className={isFav ? "fill-gold stroke-gold" : "stroke-muted"} />
          </motion.button>
          {!p.available && (
            <div className="absolute inset-0 bg-[rgba(7,17,30,.6)] flex items-center justify-center">
              <Tag color="red" className="!text-[13px] !px-4 !py-1.5">
                Non disponible
              </Tag>
            </div>
          )}
        </div>
        <div className="px-[18px] pt-4 pb-5">
          <div className="flex gap-1.5 mb-2">
            <Tag color={typeMeta.tagColor}>{typeMeta.badgeLabel}</Tag>
            {p.verified && <Tag color="blue">🛡 Vérifié</Tag>}
          </div>
          <h3 className="font-display text-[17px] font-semibold text-text mb-1.5 leading-tight">
            {p.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted text-[13px] mb-3">
            <MapPin size={13} className="shrink-0" />
            {p.quartier}, {p.city}
          </div>
          <div className="flex gap-4 mb-3.5 pb-3.5 border-b border-border">
            {rules.rooms && (
              <div className="flex items-center gap-1 text-xs text-muted">
                <Bed size={13} className="text-dim" /> {p.rooms} ch.
              </div>
            )}
            {rules.baths && (
              <div className="flex items-center gap-1 text-xs text-muted">
                <Bath size={13} className="text-dim" /> {p.baths} sdb
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted">
              <Ruler size={13} className="text-dim" /> {p.surface} m²
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="font-display text-[21px] font-bold text-gold leading-none">
              {fmtPrice(p.price)}
              {typeMeta.priceSuffix && (
                <span className="text-xs text-muted font-body font-normal">{typeMeta.priceSuffix}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Stars rating={p.owner.rating} /> {p.owner.rating}
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
