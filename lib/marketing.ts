// ═══════════════════════════════════════════════
// Espace marketing (DG Marketing) — types des fonctions SQL marketing_* et
// outils de liens de campagne (UTM). Toutes les données viennent de
// fonctions SECURITY DEFINER qui vérifient can_view_marketing() côté base :
// ce fichier ne donne aucun droit, il ne fait que typer les réponses.
// ═══════════════════════════════════════════════

import { SITE_URL } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

export interface MarketingOverview {
  accounts_total: number;
  accounts_7d: number;
  accounts_30d: number;
  accounts_prev_30d: number;
  owners_total: number;
  listings_total: number;
  listings_active: number;
  listings_7d: number;
  listings_30d: number;
  listings_prev_30d: number;
  views_total: number;
  favs_total: number;
  unique_views_7d: number;
  unique_views_30d: number;
  unique_views_prev_30d: number;
  visitors_30d: number;
  ratings_count: number;
  avg_rating: number | null;
  campaign_visits_30d: number;
  listings_few_photos: number;
  listings_short_desc: number;
  listings_unverified: number;
}

export interface DayPoint {
  day: string;
  new_accounts: number;
  new_listings: number;
  unique_views: number;
  campaign_visits: number;
}

export interface CityRow {
  city: string;
  listings: number;
  active_listings: number;
  views: number;
  favs: number;
  avg_price: number | null;
  owners: number;
}

export interface KindRow {
  kind: string;
  transaction_type: string;
  listing_type: string | null;
  listings: number;
  views: number;
  favs: number;
  avg_price: number | null;
}

export interface TopListing {
  id: number;
  title: string;
  city: string;
  kind: string;
  listing_type: string | null;
  transaction_type: string;
  price: number;
  views: number;
  favs: number;
  period_views: number;
  owner_name: string;
  created_at: string;
}

export interface OwnerRow {
  owner_id: string;
  owner_name: string;
  listings: number;
  views: number;
  favs: number;
  rating: number | null;
  rating_count: number | null;
  joined_at: string | null;
}

export interface CampaignRow {
  source: string;
  medium: string;
  campaign: string;
  visits: number;
  unique_visitors: number;
  signups: number;
}

/** PostgREST renvoie parfois les bigint/numeric en chaîne : on normalise. */
export function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Évolution en % entre deux périodes ; null quand la période précédente est vide (pas de base de comparaison). */
export function evolution(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// ── Liens de campagne ─────────────────────────────────────────

export interface Channel {
  id: string;
  label: string;
  /** utm_medium par défaut pour ce canal. */
  medium: string;
}

/** Canaux courants au Cameroun ; "autre" laisse tout saisir librement. */
export const CHANNELS: Channel[] = [
  { id: "whatsapp", label: "WhatsApp", medium: "social" },
  { id: "facebook", label: "Facebook", medium: "social" },
  { id: "tiktok", label: "TikTok", medium: "social" },
  { id: "instagram", label: "Instagram", medium: "social" },
  { id: "youtube", label: "YouTube", medium: "social" },
  { id: "sms", label: "SMS", medium: "sms" },
  { id: "affiche", label: "Affiche / QR code", medium: "offline" },
  { id: "radio", label: "Radio / TV", medium: "offline" },
  { id: "partenaire", label: "Partenaire", medium: "referral" },
  { id: "campus", label: "Campus / étudiants", medium: "referral" },
];

/** « Rentrée 2026 — Yaoundé » -> « rentree-2026-yaounde » : sans accents ni espaces, lisible dans les rapports. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface CampaignLinkInput {
  lang: Locale;
  /** Chemin sans langue, ex. "", "/recherche", "/annonce/10". */
  path: string;
  source: string;
  medium: string;
  campaign: string;
}

/** Construit https://237logement.org/fr/recherche?utm_source=…&utm_medium=…&utm_campaign=… */
export function buildCampaignUrl({ lang, path, source, medium, campaign }: CampaignLinkInput): string {
  const url = new URL(`${SITE_URL}/${lang}${path}`);
  const s = slugify(source);
  if (s) url.searchParams.set("utm_source", s);
  const m = slugify(medium);
  if (m) url.searchParams.set("utm_medium", m);
  const c = slugify(campaign);
  if (c) url.searchParams.set("utm_campaign", c);
  return url.toString();
}

/** Texte prêt à coller dans WhatsApp/Facebook pour présenter le site. */
export function siteShareText(lang: Locale, url: string): string {
  return lang === "en"
    ? `🏠 Find your home in Cameroon — verified listings, direct contact with owners, no commission.\n👉 ${url}`
    : `🏠 Trouvez votre logement au Cameroun — annonces vérifiées, contact direct avec les propriétaires, sans commission.\n👉 ${url}`;
}

/**
 * Texte prêt à coller pour promouvoir une annonce précise. Volontairement
 * le même dans les deux langues : titre, ville et prix sont déjà dans la
 * langue du propriétaire, seules les pastilles changent de sens, pas de mot.
 */
export function listingShareText(l: { title: string; city: string; priceLabel: string }, url: string): string {
  return `🏠 ${l.title.trim()}\n📍 ${l.city}\n💰 ${l.priceLabel}\n👉 ${url}`;
}

// ── Attribution à l'arrivée (utilisée par CampaignTracker et l'inscription) ──

export const ACQ_STORAGE_KEY = "immo237-acq";

export interface Acquisition {
  source: string;
  medium: string;
  campaign: string;
}

/** Lit la première provenance mémorisée (première touche : elle n'est jamais écrasée). */
export function readAcquisition(): Acquisition | null {
  try {
    const raw = localStorage.getItem(ACQ_STORAGE_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Partial<Acquisition>;
    return a.source ? { source: a.source, medium: a.medium ?? "", campaign: a.campaign ?? "" } : null;
  } catch {
    return null;
  }
}
