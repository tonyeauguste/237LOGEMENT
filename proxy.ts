import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/i18n/config";

// ═══════════════════════════════════════════════
// Redirige toute URL sans préfixe de langue (ex: /recherche) vers sa
// version localisée (ex: /fr/recherche ou /en/recherche), en se basant
// sur, dans l'ordre : le cookie NEXT_LOCALE (posé par LanguageSwitcher
// quand l'utilisateur choisit explicitement une langue), puis l'en-tête
// Accept-Language du navigateur, puis le français par défaut.
//
// Nommé "proxy.ts" et non "middleware.ts" : Next.js 16 a renommé ce
// fichier (voir node_modules/next/dist/docs/.../proxy.md, section
// "Migration to Proxy" — l'ancien nom est déprécié).
//
// Redirect plutôt que rewrite : le but explicite est d'avoir de vraies
// URLs distinctes par langue (/fr/... et /en/...) visibles dans la barre
// d'adresse et indexables séparément par Google — un rewrite les
// masquerait. C'est exactement le pattern documenté par Next.js pour le
// routage i18n (voir la même doc, section "Routing Overview").
// ═══════════════════════════════════════════════

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language") || "";
  for (const part of acceptLanguage.split(",")) {
    const lang = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (isLocale(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocalePrefix) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclut les assets Next.js internes, les fichiers avec extension
  // (images, favicon...) et l'API Supabase/Netlify éventuelle — seules les
  // pages doivent être localisées.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
