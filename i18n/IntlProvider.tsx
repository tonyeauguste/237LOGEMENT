"use client";

// ═══════════════════════════════════════════════
// Fournit les traductions aux composants client via le contexte React,
// sans dépendance externe (voir la note dans AGENTS.md : Next.js 16 a des
// changements cassants, on évite de parier sur la compatibilité d'une
// librairie tierce comme next-intl avec cette version très récente —
// celle-ci ne s'appuie que sur des primitives documentées de l'App Router).
//
// Usage dans un composant client :
//   const t = useTranslations("Nav");
//   t("home") // -> "Accueil" ou "Home" selon la locale active
// ═══════════════════════════════════════════════

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";

type Messages = Record<string, unknown>;

const IntlContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>;
}

function readPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur && typeof cur === "object" && key in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** Locale active (ex: "fr" ou "en") — utile pour un lien qui doit pointer vers l'autre langue. */
export function useLocale(): Locale {
  const ctx = useContext(IntlContext);
  if (!ctx) throw new Error("useLocale doit être utilisé sous <IntlProvider>");
  return ctx.locale;
}

/**
 * Renvoie une fonction `t(key, vars?)` limitée au namespace donné.
 * `key` peut contenir des points pour descendre dans les sous-objets du JSON
 * (ex: "hero.title"). Les `{variable}` du texte source sont remplacées par
 * `vars`. Si une clé est introuvable, on renvoie la clé elle-même plutôt que
 * de planter — plus sûr qu'un texte manquant en production.
 */
export function useTranslations(namespace: string) {
  const ctx = useContext(IntlContext);
  if (!ctx) throw new Error("useTranslations doit être utilisé sous <IntlProvider>");
  const { messages } = ctx;
  const base = readPath(messages, namespace.split("."));

  return (key: string, vars?: Record<string, string | number>) => {
    const raw = readPath(base, key.split("."));
    if (typeof raw !== "string") return key;
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
      raw
    );
  };
}
