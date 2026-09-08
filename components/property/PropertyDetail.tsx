"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Bed,
  Bath,
  Ruler,
  MapPin,
  MessageSquare,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Link2,
  ShieldCheck,
  ArrowUp,
  ArrowLeft,
} from "lucide-react";
import type { Property } from "@/lib/types";
import { fmtPrice, fmtRelativeDate } from "@/lib/format";
import { useAppStore, getVisitorId } from "@/lib/store";
import { FIELD_VISIBILITY_RULES, amenityIcon, amenityLabel, kindLabel, propertyGroup, transactionMeta } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";
import Stars from "@/components/ui/Stars";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/i18n/IntlProvider";

type DetailTab = "desc" | "amenities" | "map";

export default function PropertyDetail({ p, similar = [] }: { p: Property; similar?: Property[] }) {
  const tKind = useTranslations("PropertyKinds");
  const tTx = useTranslations("Transaction");
  const tAmenities = useTranslations("Amenities");
  const t = useTranslations("PropertyDetail");
  const group = propertyGroup(p.kind);
  const typeMeta = transactionMeta(p.transactionType, p.type, group, tTx);
  const rules = FIELD_VISIBILITY_RULES[p.transactionType][group];
  // B.2/B.4 — voir le commentaire équivalent dans PropertyCard.tsx : ne
  // concerne que le court séjour, le longue durée supprime l'annonce.
  const isOccupied = p.type === "courte" && p.occupancyStatus === "occupe";
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [tab, setTab] = useState<DetailTab>("desc");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const isFav = useAppStore((s) => s.isFav(p.id));
  const toggleFav = useAppStore((s) => s.toggleFav);
  const showToast = useAppStore((s) => s.showToast);
  const currentUser = useAppStore((s) => s.currentUser);

  // Notation honnête du propriétaire — remplace l'ancienne owner_rating
  // figée à 4.5 par défaut sur toute annonce (voir owner_ratings +
  // submit_owner_rating côté base). Un propriétaire ne peut pas se noter
  // lui-même : le widget de notation reste masqué sur ses propres annonces.
  const isOwnListing = !!currentUser && !!p.ownerId && currentUser.id === p.ownerId;
  const [myRating, setMyRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Pré-remplit l'étoile déjà donnée par ce visiteur (compte ou cookie
  // anonyme), s'il en a déjà laissé une — sinon le widget repart de 0 et un
  // nouveau clic crée la note (submit_owner_rating fait un upsert).
  useEffect(() => {
    if (isOwnListing || !p.ownerId) return;
    const visitor = getVisitorId(currentUser);
    if (!visitor) return;
    let cancelled = false;
    createClient()
      .from("owner_ratings")
      .select("rating")
      .eq("owner_id", p.ownerId)
      .eq("rater_id", visitor)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setMyRating(data.rating);
      });
    return () => {
      cancelled = true;
    };
  }, [p.ownerId, currentUser, isOwnListing]);

  async function submitRating(stars: number) {
    if (!p.ownerId || ratingSubmitting) return;
    const visitor = getVisitorId(currentUser);
    if (!visitor) return;
    setRatingSubmitting(true);
    const { error } = await createClient().rpc("submit_owner_rating", {
      target_owner: p.ownerId,
      prop_id: p.id,
      rater: visitor,
      stars,
    });
    setRatingSubmitting(false);
    if (error) {
      showToast(t("toastRatingError"), "error");
      return;
    }
    setMyRating(stars);
    showToast(t("toastRatingSent"), "success");
  }

  // Bouton "remonter en haut" : la fiche est longue (galerie + onglets +
  // annonces similaires), on l'affiche dès qu'on a défilé une hauteur d'écran.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prevImg = () => setGalleryIdx((i) => (i - 1 + p.imgs.length) % p.imgs.length);
  const nextImg = () => setGalleryIdx((i) => (i + 1) % p.imgs.length);

  // L'URL de la page n'est lue qu'au moment du clic, jamais pendant le
  // rendu : window.location.href n'existe pas côté serveur, et l'injecter
  // dans un href provoquait une erreur d'hydratation React (attribut
  // différent entre le rendu serveur et le rendu client).
  const shareText = `${p.title} — ${fmtPrice(p.price)} · ${p.quartier}, ${p.city}`;

  async function handleShare() {
    // API de partage native (mobile) si disponible, sinon on retombe sur
    // la copie du lien — plus utile qu'un bouton qui ne ferait rien.
    if (navigator.share) {
      try {
        await navigator.share({ title: p.title, text: shareText, url: window.location.href });
        return;
      } catch {
        // Partage annulé par l'utilisateur — rien à signaler.
        return;
      }
    }
    copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t("toastLinkCopied"), "success");
    } catch {
      showToast(t("toastLinkCopyError"), "error");
    }
  }

  function shareOnWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${window.location.href}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function sendMessage() {
    if (!msg.trim()) {
      showToast(t("toastEmptyMessage"), "error");
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("property_messages")
      .insert({ property_id: p.id, message: msg.trim() });
    setSending(false);
    if (error) {
      showToast(t("toastSendError"), "error");
      return;
    }
    setSent(true);
    showToast(t("toastMessageSent"), "success");
  }

  return (
    <div className="pt-[90px] px-[5%] pb-[60px] max-w-[1240px] mx-auto">
      {/* Fil d'ariane + retour aux résultats */}
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 items-center text-[13px] text-muted">
          <Link href="/" className="text-gold hover:underline">{t("home")}</Link>
          <span className="text-dim">/</span>
          <Link href="/recherche" className="text-gold hover:underline">
            {typeMeta.shortLabel}
          </Link>
          <span className="text-dim">/</span>
          <span className="text-muted truncate max-w-[200px] sm:max-w-none">{p.title}</span>
        </div>
        <Link href="/recherche">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} /> {t("backButton")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* ─── Colonne principale ─── */}
        <div>
          {/* Galerie : grande image + flèches + compteur */}
          <div className="relative rounded-2xl overflow-hidden bg-card2 aspect-[16/10] mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={galleryIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={p.imgs[galleryIdx]}
                  alt={`${p.title} — photo ${galleryIdx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className={`object-cover ${isOccupied ? "blur-lg pointer-events-none scale-105" : ""}`}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* B.2/B.4 — bien occupé : photo floutée et non zoomable/non
                navigable (flèches et miniatures désactivées ci-dessous),
                avec un repère clair au centre pour expliquer le flou. */}
            {isOccupied && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Tag color="red" className="!text-[13px] !px-4 !py-1.5">
                  {t("occupiedPhotosHidden")}
                </Tag>
              </div>
            )}

            {p.imgs.length > 1 && !isOccupied && (
              <>
                <button
                  onClick={prevImg}
                  aria-label={t("prevPhoto")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImg}
                  aria-label={t("nextPhoto")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-[12px] font-medium">
                  {galleryIdx + 1} / {p.imgs.length}
                </span>
              </>
            )}
          </div>

          {p.imgs.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
              {p.imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  disabled={isOccupied}
                  className={`relative w-[92px] h-[68px] rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    isOccupied ? "cursor-not-allowed" : ""
                  } ${i === galleryIdx ? "border-gold" : "border-transparent hover:border-border2"}`}
                >
                  <Image
                    src={src}
                    alt={t("thumbnail", { n: i + 1 })}
                    fill
                    sizes="92px"
                    className={`object-cover ${isOccupied ? "blur-md pointer-events-none scale-105" : ""}`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Titre + badges */}
          <div className="mb-6">
            <div className="flex gap-2 items-center mb-3 flex-wrap">
              <Tag color={typeMeta.tagColor}>{typeMeta.badgeLabel}</Tag>
              {isOccupied && <Tag color="red">🔴 {t("occupied")}</Tag>}
              {p.verified && <Tag color="blue">{t("verifiedOwner")}</Tag>}
              {p.available ? <Tag color="green">{t("available")}</Tag> : <Tag color="red">{t("notAvailable")}</Tag>}
            </div>
            <h1 className="font-display text-[clamp(22px,3vw,36px)] font-bold text-text mb-2">{p.title}</h1>
            <div className="flex items-center gap-1.5 text-muted text-[15px]">
              <MapPin size={15} />
              <span>{p.quartier}, {p.city}</span>
            </div>
          </div>

          {/* Caractéristiques — chambres/salles de bain masquées pour un
              bureau, une boutique ou un terrain ; surface masquée en
              location sauf pour un terrain (voir FIELD_VISIBILITY_RULES,
              Tâche 4.1 du prompt "publier-et-auth"). */}
          {(rules.rooms || rules.baths || rules.surface) && (
            <div
              className={`grid mb-7 bg-card border border-border rounded-2xl overflow-hidden ${
                [rules.rooms, rules.baths, rules.surface].filter(Boolean).length > 1
                  ? "grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {rules.rooms && (
                <div className="p-[18px] text-center border-r border-border">
                  <div className="flex justify-center mb-1.5 text-gold"><Bed size={16} /></div>
                  <div className="font-semibold text-[15px] text-text">{p.rooms}</div>
                  <div className="text-xs text-muted">{p.rooms > 1 ? t("rooms") : t("room")}</div>
                </div>
              )}
              {rules.baths && (
                <div className="p-[18px] text-center border-r border-border">
                  <div className="flex justify-center mb-1.5 text-gold"><Bath size={16} /></div>
                  <div className="font-semibold text-[15px] text-text">{p.baths}</div>
                  <div className="text-xs text-muted">{p.baths > 1 ? t("bathrooms") : t("bathroom")}</div>
                </div>
              )}
              {rules.surface && (
                <div className="p-[18px] text-center">
                  <div className="flex justify-center mb-1.5 text-gold"><Ruler size={16} /></div>
                  <div className="font-semibold text-[15px] text-text">{p.surface || "—"}</div>
                  <div className="text-xs text-muted">{t("surfaceM2")}</div>
                </div>
              )}
            </div>
          )}

          {/* Onglets */}
          <div className="flex border-b border-border mb-6">
            {([
              ["desc", t("tabDesc")],
              ["amenities", t("tabAmenities")],
              ["map", t("tabMap")],
            ] as [DetailTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === key ? "text-gold border-gold" : "text-muted border-transparent hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "desc" && (
              <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-muted text-[15px] leading-[1.8] whitespace-pre-line">
                  {p.desc || t("noDescription")}
                </p>
                <div className="bg-card2 border border-border rounded-xl px-[18px] py-4 mt-[18px] flex gap-5 flex-wrap text-[13px] text-muted">
                  <span>❤️ {p.favs} {t("favs")}</span>
                  <span>📅 {fmtRelativeDate(p.createdAt)}</span>
                </div>
              </motion.div>
            )}
            {tab === "amenities" && (
              <motion.div
                key="amenities"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {p.amenities.length === 0 ? (
                  <p className="text-muted text-sm">{t("noAmenities")}</p>
                ) : (
                  p.amenities.map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-2.5 px-3.5 py-3 bg-card border border-border rounded-[10px] text-sm text-text"
                    >
                      <Check size={14} className="text-gold shrink-0" />
                      {amenityIcon(a)} {amenityLabel(a, tAmenities)}
                    </div>
                  ))
                )}
              </motion.div>
            )}
            {tab === "map" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-card2 border border-border rounded-xl px-[18px] py-3.5 mb-4 flex items-center gap-2 text-sm text-text">
                  <MapPin size={15} className="text-gold shrink-0" />
                  {p.quartier}, {p.city}
                </div>
                {/* Tâche 2 — adresse précise et repères saisis à l'étape 1
                    du formulaire /publier : auparavant capturés mais
                    jamais affichés (voir rowToProperty dans
                    lib/supabase/mappers.ts). Un champ non renseigné est
                    omis proprement, jamais affiché vide. */}
                {p.address || p.precisionDesc ? (
                  <div className="flex flex-col gap-3">
                    {p.address && (
                      <div>
                        <div className="text-[11px] tracking-[1px] uppercase text-muted font-semibold mb-1">
                          {t("address")}
                        </div>
                        <p className="text-sm text-text">{p.address}</p>
                      </div>
                    )}
                    {p.precisionDesc && (
                      <div>
                        <div className="text-[11px] tracking-[1px] uppercase text-muted font-semibold mb-1">
                          {t("locationDetails")}
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{p.precisionDesc}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-sm">{t("noLocationDetails")}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Colonne latérale (collante) ─── */}
        <div className="lg:sticky lg:top-[90px]">
          {/* Bloc prix + partage + sauvegarde */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-1">
              {typeMeta.shortLabel} · {kindLabel(p.kind, tKind)}
            </div>
            <div className="text-[13px] text-muted mb-3">{p.quartier}, {p.city}</div>

            <div className="font-display text-[32px] font-bold text-gold leading-none">
              {fmtPrice(p.price)}
            </div>
            {typeMeta.priceSuffix && (
              <div className="text-[13px] text-muted mt-1 mb-1">{typeMeta.priceSuffix}</div>
            )}
            <div className="text-[12px] text-dim mb-4">{fmtRelativeDate(p.createdAt)}</div>

            {/* Tâche 2 — Conditions financières : selon le type de
                transaction, jamais les deux jeux de champs à la fois (voir
                le payload envoyé par le formulaire /publier). Chaque ligne
                n'apparaît que si le champ correspondant est renseigné. */}
            {p.transactionType === "location" ? (
              (p.deposit || p.advancePayment || p.charges || p.minDuration) && (
                <div className="border-t border-border pt-3 mb-4 flex flex-col gap-1.5 text-[13px]">
                  {p.deposit != null && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("deposit")}</span>
                      <span className="text-text font-medium">{fmtPrice(p.deposit)}</span>
                    </div>
                  )}
                  {p.advancePayment != null && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("advance")}</span>
                      <span className="text-text font-medium">{fmtPrice(p.advancePayment)}</span>
                    </div>
                  )}
                  {p.charges && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("charges")}</span>
                      <span className="text-text font-medium">
                        {p.charges === "oui"
                          ? t("chargesIncluded")
                          : p.charges === "partiel"
                            ? t("chargesPartial")
                            : t("chargesExcluded")}
                      </span>
                    </div>
                  )}
                  {p.minDuration && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("minDuration")}</span>
                      <span className="text-text font-medium">{p.minDuration}</span>
                    </div>
                  )}
                </div>
              )
            ) : (
              (p.landTitleStatus || p.priceNegotiable != null) && (
                <div className="border-t border-border pt-3 mb-4 flex flex-col gap-1.5 text-[13px]">
                  {p.landTitleStatus && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("landTitle")}</span>
                      <span className="text-text font-medium">
                        {p.landTitleStatus === "oui"
                          ? t("landTitleAvailable")
                          : p.landTitleStatus === "non"
                            ? t("landTitleNotAvailable")
                            : t("landTitleInProgress")}
                      </span>
                    </div>
                  )}
                  {p.priceNegotiable != null && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("priceNegotiable")}</span>
                      <span className="text-text font-medium">{p.priceNegotiable ? t("yes") : t("no")}</span>
                    </div>
                  )}
                </div>
              )
            )}

            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-gold underline underline-offset-2 transition-colors"
              >
                <Share2 size={13} /> {t("share")}
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-gold underline underline-offset-2 transition-colors"
              >
                <Link2 size={13} /> {t("copyLink")}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-green2 underline underline-offset-2 transition-colors"
              >
                💬 WhatsApp
              </button>
            </div>

            <Button variant="gold" full size="lg" onClick={() => toggleFav(p.id)}>
              <Heart size={16} className={isFav ? "fill-current" : ""} />
              {isFav ? t("saved") : t("save")}
            </Button>
          </div>

          {/* Proposé par */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-3">
              {t("proposedBy")}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full border-2 border-gold overflow-hidden relative shrink-0">
                <Image src={p.owner.avatar} alt={p.owner.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] text-text truncate">{p.owner.name}</div>
                {p.verified && (
                  <div className="text-[12px] text-green2 flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> {t("verifiedOwnerShort")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center text-[13px] text-muted flex-wrap">
              {/* ratingCount à 0 -> aucune vraie note reçue, on l'affiche
                  honnêtement comme "Nouveau" plutôt que d'inventer un 4.5
                  (voir owner_ratings/submit_owner_rating). */}
              {p.owner.ratingCount > 0 ? (
                <>
                  <Stars rating={p.owner.rating} />
                  <span>
                    {p.owner.rating} · {p.owner.ratingCount}{" "}
                    {p.owner.ratingCount > 1 ? t("reviewsPlural") : t("reviewSingular")}
                  </span>
                </>
              ) : (
                <span className="text-dim">{t("newOwnerLabel")}</span>
              )}
              <span className="text-dim">·</span>
              <span>
                {p.owner.listings} {p.owner.listings > 1 ? t("listings") : t("listing")}
              </span>
            </div>

            {!isOwnListing && p.ownerId && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[12px] text-muted mb-1.5">
                  {myRating ? t("rateOwnerUpdateLabel") : t("rateOwnerLabel")}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={ratingSubmitting}
                      onClick={() => submitRating(n)}
                      aria-label={t("rateOwnerStarAria", { n })}
                      className="text-xl leading-none disabled:opacity-50"
                    >
                      <span className={n <= (myRating ?? 0) ? "text-gold" : "text-dim"}>★</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h4 className="font-semibold text-base text-text mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" /> {t("contactOwner")}
            </h4>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-[40px] mb-3">✅</div>
                <h5 className="font-semibold text-[16px] text-text mb-1.5">{t("messageSentTitle")}</h5>
                <p className="text-muted text-sm">{t("messageSentText")}</p>
              </div>
            ) : (
              <>
                <textarea
                  className="form-control mb-3"
                  style={{ minHeight: 100 }}
                  placeholder={t("messagePlaceholder")}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
                <Button variant="gold" full loading={sending} onClick={sendMessage} className="mb-2.5">
                  {t("sendMessage")}
                </Button>
                {p.owner.phone ? (
                  <a
                    href={`tel:${p.owner.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] transition-colors duration-300 cursor-pointer w-full px-[22px] py-[11px] text-sm rounded-[10px] bg-transparent border border-border2 text-muted hover:border-gold hover:text-gold"
                  >
                    <Phone size={15} /> {p.owner.phone}
                  </a>
                ) : (
                  <p className="text-center text-xs text-dim italic">{t("noPhoneProvided")}</p>
                )}
              </>
            )}
          </div>

          {/* Conseils de sécurité — repris du modèle Rent237 : rassure le
              locataire et limite les arnaques au faux versement d'avance. */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-3 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gold" /> {t("securityTipsTitle")}
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              <Tag color="gold">{t("verifiedOwnerTag")}</Tag>
              <Tag color="green">{t("verifiedListingTag")}</Tag>
            </div>
            <ul className="text-[13px] text-muted leading-relaxed flex flex-col gap-1.5">
              <li>• {t("tip1")}</li>
              <li>• {t("tip2")}</li>
              <li>• {t("tip3")}</li>
              <li>
                •{" "}
                <Link href="/contact" className="text-gold hover:underline">
                  {t("tip4Link")}
                </Link>{" "}
                {t("tip4Rest")}
              </li>
            </ul>
          </div>

          {/* Annonces similaires */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-sm text-text mb-3.5">{t("similarListings")}</h4>
            {similar.length === 0 ? (
              <p className="text-muted text-[13px]">{t("noSimilar")}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/annonce/${s.id}`}
                    className="flex gap-3 p-2.5 rounded-[10px] hover:bg-card2 border border-transparent hover:border-border transition-colors"
                  >
                    <div className="w-[66px] h-[54px] rounded-lg overflow-hidden shrink-0 relative">
                      <Image src={s.imgs[0]} alt={s.title} fill sizes="66px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text truncate">{s.title}</div>
                      <div className="text-[11px] text-muted">{s.quartier}</div>
                      <div className="text-[13px] font-bold text-gold mt-0.5">{fmtPrice(s.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retour en haut */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={t("backToTop")}
            // Voir le commentaire équivalent dans Toaster.tsx (safe-area-inset).
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-50 w-12 h-12 rounded-full bg-gold text-[#07111e] shadow-[0_8px_28px_rgba(200,155,60,.4)] flex items-center justify-center hover:brightness-110 transition-[filter]"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
