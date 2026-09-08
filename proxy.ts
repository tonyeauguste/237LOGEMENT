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

// Tâche "corriger-compteur-vues" — identifiant technique pour dédupliquer
// les vues et les favoris d'un visiteur anonyme (register_property_view /
// set_property_favorite en base). Posé ici plutôt que dans une page : un
// Server Component ne peut pas écrire de cookie (limitation Next.js —
// seuls le proxy, une Server Action ou un Route Handler le peuvent), alors
// que ce proxy tourne déjà avant chaque page.
//
// PAS httpOnly (contrairement à un premier choix pour les seules vues,
// lues côté serveur) : les favoris se togglent depuis des composants
// client (cœur sur PropertyCard, etc.) qui appellent la RPC Supabase
// directement depuis le navigateur — ce code doit donc pouvoir lire ce
// cookie via document.cookie (voir lib/store.ts, getVisitorCookie). Aucune
// donnée sensible dedans : un simple id de corrélation aléatoire.
const VISITOR_COOKIE = "v_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

function ensureVisitorCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(VISITOR_COOKIE)?.value) return;
  response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
    maxAge: VISITOR_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocalePrefix) {
    const response = NextResponse.next();
    ensureVisitorCookie(request, response);
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  ensureVisitorCookie(request, response);
  return response;
}

export const config = {
  // Exclut les assets Next.js internes, les fichiers avec extension
  // (images, favicon...) et l'API Supabase/Netlify éventuelle — seules les
  // pages doivent être localisées.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
