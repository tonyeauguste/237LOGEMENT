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

/**
 * Fournit des traductions. Imbricable : un provider placé dans une page
 * fusionne ses namespaces avec ceux du provider parent (la mise en page),
 * et `locale` devient facultative puisqu'elle est héritée.
 *
 * Pourquoi : le layout passait le dictionnaire entier, et comme `messages`
 * est une propriété d'un composant client, Next.js le sérialise dans la
 * page. Chaque visiteur téléchargeait donc les ~48 Ko des deux panneaux
 * admin, du formulaire de publication et de la FAQ, y compris sur une
 * simple fiche d'annonce. La mise en page ne fournit plus que les
 * namespaces transverses ; chaque page ajoute les siens.
 */
export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale?: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const parent = useContext(IntlContext);
  const value = useMemo(() => {
    const resolved = locale ?? parent?.locale;
    if (!resolved) {
      throw new Error(
        "IntlProvider : `locale` est requise sur le provider racine (aucun parent à hériter)."
      );
    }
    // Fusion à plat sur les namespaces : une page ne redéfinit jamais une
    // clé isolée du parent, elle apporte des sections entières.
    return {
      locale: resolved,
      messages: parent ? { ...parent.messages, ...messages } : messages,
    };
  }, [locale, messages, parent]);

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

  // Garde-fou de développement : depuis que chaque page déclare ses
  // namespaces (voir IntlProvider), en oublier un n'afficherait que des
  // clés brutes à l'écran — un défaut discret, facile à ne pas voir en
  // relisant. On le signale bruyamment en dev ; en production on garde le
  // repli silencieux, qui reste préférable à une page plantée.
  if (process.env.NODE_ENV !== "production" && base === undefined) {
    console.error(
      `[i18n] Namespace « ${namespace} » absent du contexte. ` +
        `Ajoutez-le aux namespaces de la page (voir PAGE_NAMESPACES / i18n/dictionaries.ts).`
    );
  }

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
