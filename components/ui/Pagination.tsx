"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "@/i18n/IntlProvider";

/** Pagination simple (précédent / numéros / suivant) — utilisée par les listes admin (20 éléments/page). */
export default function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const t = useTranslations("Pagination");

  if (pageCount <= 1) return null;

  // Fenêtre glissante de pages autour de la page courante, pour éviter
  // d'afficher des dizaines de numéros quand il y a beaucoup de pages.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label={t("label")} className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:pointer-events-none"
        aria-label={t("previous")}
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-muted text-xs px-1">…</span>}
          <button
            onClick={() => onChange(p)}
            aria-label={t("goToPage", { page: p })}
            // Signale la page courante aux lecteurs d'écran : la seule
            // indication était la couleur, invisible pour eux.
            aria-current={p === page ? "page" : undefined}
            className={clsx(
              "w-9 h-9 rounded-lg text-[13px] font-semibold transition-colors",
              p === page ? "bg-gold text-[#07111e]" : "border border-border text-muted hover:border-gold hover:text-gold"
            )}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:pointer-events-none"
        aria-label={t("next")}
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
