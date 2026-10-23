"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { LOCALES, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/IntlProvider";

/**
 * Ajoute le préfixe de langue à un lien interne : "/tarifs" -> "/fr/tarifs".
 *
 * Pourquoi : les liens du site étaient écrits sans préfixe et c'est
 * proxy.ts qui les redirigeait vers /fr/... ou /en/.... Chaque lien visible
 * déclenchait donc un préchargement qui passait par une redirection 307, et
 * la requête de navigation interne redirigée échouait en 404 côté serveur
 * (relevé dans les logs Netlify : /fr/tarifs?_rsc=... en 404). Un lien qui
 * pointe directement sur la bonne URL évite la redirection, le 404 et un
 * aller-retour réseau à chaque navigation.
 *
 * Les liens externes, ancres, mailto:/tel: et URLs déjà préfixées sont
 * laissés tels quels.
 */
export function localizeHref<H extends ComponentProps<typeof NextLink>["href"]>(
  href: H,
  locale: Locale
): H | string {
  if (typeof href !== "string") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const first = href.split(/[/?#]/)[1];
  if ((LOCALES as readonly string[]).includes(first)) return href;
  // "/" seul, "/?x" ou "/#x" : la racine localisée est "/fr", pas "/fr/".
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/?") || href.startsWith("/#")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** Remplaçant direct de `next/link` : même API, URL préfixée par la langue active. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return <NextLink href={localizeHref(href, locale)} {...props} />;
}
