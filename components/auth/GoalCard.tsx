"use client";

// Carte "objectif" de l'étape 2 de l'inscription : sélection multiple
// (on peut vouloir à la fois chercher un logement ET publier ses biens),
// d'où une case à cocher plutôt qu'un bouton radio.

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

export default function GoalCard({
  icon,
  title,
  desc,
  checked,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={clsx(
        "w-full text-left flex gap-3.5 p-4 rounded-xl border-[1.5px] transition-colors duration-200 cursor-pointer",
        checked ? "border-gold bg-gold3" : "border-border bg-card hover:border-border2"
      )}
    >
      <span
        className={clsx(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-gold/20 text-gold" : "bg-bg3 text-muted"
        )}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={clsx("block font-semibold text-sm mb-1", checked ? "text-gold" : "text-text")}>
          {title}
        </span>
        <span className="block text-[12px] text-muted leading-snug">{desc}</span>
      </span>
      <span
        className={clsx(
          "w-[22px] h-[22px] rounded-md border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors",
          checked ? "bg-gold border-gold text-[#07111e]" : "border-border2 text-transparent"
        )}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </button>
  );
}
