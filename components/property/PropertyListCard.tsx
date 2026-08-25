"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "@/lib/types";
import { fmtPrice } from "@/lib/format";
import { FIELD_VISIBILITY_RULES, propertyGroup, transactionMeta } from "@/lib/data";
import Tag from "@/components/ui/Tag";

export default function PropertyListCard({ p }: { p: Property }) {
  const group = propertyGroup(p.kind);
  const typeMeta = transactionMeta(p.transactionType, p.type, group);
  const rules = FIELD_VISIBILITY_RULES[p.transactionType][group];
  // Voir le commentaire équivalent dans PropertyCard.tsx.
  const isOccupied = p.type === "courte" && p.occupancyStatus === "occupe";
  return (
    <motion.div whileHover={{ borderColor: "rgba(200,155,60,.3)" }}>
      <Link
        href={`/annonce/${p.id}`}
        className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer flex"
      >
        <div className="w-[200px] h-[150px] shrink-0 relative overflow-hidden">
          <Image
            src={p.imgs[0]}
            alt={p.title}
            fill
            sizes="200px"
            className={`object-cover ${isOccupied ? "blur-md pointer-events-none scale-105" : ""}`}
          />
        </div>
        <div className="px-5 py-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex gap-1.5 mb-1.5">
              <Tag color={typeMeta.tagColor}>{typeMeta.badgeLabel}</Tag>
              {isOccupied && <Tag color="red">🔴 Occupé</Tag>}
              {p.verified && <Tag color="blue">🛡 Vérifié</Tag>}
            </div>
            <div className="font-semibold text-[15px] text-text mb-1">{p.title}</div>
            <div className="text-[13px] text-muted flex items-center gap-1.5">
              <MapPin size={12} />
              {p.quartier}, {p.city}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex gap-3.5 text-xs text-muted">
              {rules.rooms && <span>🛏 {p.rooms} ch.</span>}
              {rules.baths && <span>🚿 {p.baths} sdb</span>}
              <span>📐 {p.surface}m²</span>
            </div>
            <div className="font-display text-lg font-bold text-gold">{fmtPrice(p.price)}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
