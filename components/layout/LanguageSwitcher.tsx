"use client";

// ═══════════════════════════════════════════════
// Bascule FR/EN — change la locale en préservant la page courante
// (ex: /fr/recherche <-> /en/recherche), et pose un cookie NEXT_LOCALE
// pour que proxy.ts se souvienne du choix : sans ça, un clic sur un lien
// interne "classique" (href="/faq", sans préfixe — la grande majorité du
// site) redirigerait systématiquement vers le français par défaut, et
// l'utilisateur perdrait son choix d'anglais dès la première navigation.
// ═══════════════════════════════════════════════

import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/IntlProvider";

const LOCALE_LABEL: Record<Locale, string> = { fr: "FR", en: "EN" };

function pathWithoutLocale(pathname: string): string {
  const match = pathname.match(/^\/(fr|en)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || "/";
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const rest = pathWithoutLocale(pathname);

  return (
    <div className="flex items-center rounded-full border border-border bg-card2 p-0.5 text-[12px] font-semibold">
      {LOCALES.map((l) => (
        <a
          key={l}
          href={`/${l}${rest}`}
          onClick={() => {
            // 1 an, disponible sur tout le site — même durée de vie qu'un
            // choix de préférence classique (pas de donnée sensible).
            document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`;
          }}
          aria-current={l === locale ? "true" : undefined}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            l === locale ? "bg-gold text-bg" : "text-muted hover:text-text"
          }`}
        >
          {LOCALE_LABEL[l]}
        </a>
      ))}
    </div>
  );
}
