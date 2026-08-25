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
import { useAppStore } from "@/lib/store";
import { FIELD_VISIBILITY_RULES, kindLabel, propertyGroup, transactionMeta } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";
import Stars from "@/components/ui/Stars";
import Button from "@/components/ui/Button";

type DetailTab = "desc" | "video" | "amenities" | "map";

export default function PropertyDetail({ p, similar = [] }: { p: Property; similar?: Property[] }) {
  const group = propertyGroup(p.kind);
  const typeMeta = transactionMeta(p.transactionType, p.type, group);
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
      showToast("🔗 Lien copié dans le presse-papiers !", "success");
    } catch {
      showToast("❌ Impossible de copier le lien.", "error");
    }
  }

  function shareOnWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${window.location.href}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function sendMessage() {
    if (!msg.trim()) {
      showToast("⚠️ Veuillez écrire un message avant d'envoyer.", "error");
      return;
    }
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("property_messages")
      .insert({ property_id: p.id, message: msg.trim() });
    setSending(false);
    if (error) {
      showToast("❌ Une erreur est survenue. Veuillez réessayer.", "error");
      return;
    }
    setSent(true);
    showToast("✅ Message envoyé avec succès !", "success");
  }

  return (
    <div className="pt-[90px] px-[5%] pb-[60px] max-w-[1240px] mx-auto">
      {/* Fil d'ariane + retour aux résultats */}
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 items-center text-[13px] text-muted">
          <Link href="/" className="text-gold hover:underline">Accueil</Link>
          <span className="text-dim">/</span>
          <Link href="/recherche" className="text-gold hover:underline">
            {typeMeta.shortLabel}
          </Link>
          <span className="text-dim">/</span>
          <span className="text-muted truncate max-w-[200px] sm:max-w-none">{p.title}</span>
        </div>
        <Link href="/recherche">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} /> Retour aux résultats
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
                  🔴 Bien occupé — photos temporairement masquées
                </Tag>
              </div>
            )}

            {p.imgs.length > 1 && !isOccupied && (
              <>
                <button
                  onClick={prevImg}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Photo suivante"
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
                    alt={`Miniature ${i + 1}`}
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
              {isOccupied && <Tag color="red">🔴 Occupé</Tag>}
              {p.verified && <Tag color="blue">🛡 Propriétaire vérifié</Tag>}
              {p.available ? <Tag color="green">✅ Disponible</Tag> : <Tag color="red">❌ Non disponible</Tag>}
            </div>
            <h1 className="font-display text-[clamp(22px,3vw,36px)] font-bold text-text mb-2">{p.title}</h1>
            <div className="flex items-center gap-1.5 text-muted text-[15px]">
              <MapPin size={15} />
              <span>{p.quartier}, {p.city}</span>
            </div>
          </div>

          {/* Caractéristiques — chambres/salles de bain masquées pour un
              bureau, une boutique ou un terrain (voir FIELD_VISIBILITY_RULES). */}
          <div
            className={`grid mb-7 bg-card border border-border rounded-2xl overflow-hidden ${
              rules.rooms || rules.baths ? "grid-cols-3" : "grid-cols-1"
            }`}
          >
            {rules.rooms && (
              <div className="p-[18px] text-center border-r border-border">
                <div className="flex justify-center mb-1.5 text-gold"><Bed size={16} /></div>
                <div className="font-semibold text-[15px] text-text">{p.rooms}</div>
                <div className="text-xs text-muted">Chambre{p.rooms > 1 ? "s" : ""}</div>
              </div>
            )}
            {rules.baths && (
              <div className="p-[18px] text-center border-r border-border">
                <div className="flex justify-center mb-1.5 text-gold"><Bath size={16} /></div>
                <div className="font-semibold text-[15px] text-text">{p.baths}</div>
                <div className="text-xs text-muted">Salle{p.baths > 1 ? "s" : ""} de bain</div>
              </div>
            )}
            <div className="p-[18px] text-center">
              <div className="flex justify-center mb-1.5 text-gold"><Ruler size={16} /></div>
              <div className="font-semibold text-[15px] text-text">{p.surface || "—"}</div>
              <div className="text-xs text-muted">m² de surface</div>
            </div>
          </div>

          {/* Onglets — "Vidéo" seulement s'il y en a une (voir Property.videos,
              longtemps absent de ce type : les vidéos uploadées via /publier
              n'apparaissaient donc jamais nulle part). */}
          <div className="flex border-b border-border mb-6">
            {([
              ["desc", "Description"],
              ...(p.videos.length > 0 && !isOccupied ? [["video", "Vidéo"]] : []),
              ["amenities", "Équipements"],
              ["map", "Localisation"],
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
                  {p.desc || "Aucune description fournie pour ce bien."}
                </p>
                <div className="bg-card2 border border-border rounded-xl px-[18px] py-4 mt-[18px] flex gap-5 flex-wrap text-[13px] text-muted">
                  <span>👁 {p.views} vues</span>
                  <span>❤️ {p.favs} favoris</span>
                  <span>📅 {fmtRelativeDate(p.createdAt)}</span>
                </div>
              </motion.div>
            )}
            {tab === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {p.videos.map((src, i) => (
                  <video
                    key={src}
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`Vidéo de visite ${i + 1}`}
                    className="w-full rounded-2xl bg-black aspect-video"
                  />
                ))}
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
                  <p className="text-muted text-sm">Aucun équipement renseigné.</p>
                ) : (
                  p.amenities.map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-2.5 px-3.5 py-3 bg-card border border-border rounded-[10px] text-sm text-text"
                    >
                      <Check size={14} className="text-gold shrink-0" />
                      {a}
                    </div>
                  ))
                )}
              </motion.div>
            )}
            {tab === "map" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="h-[260px] bg-[#091626] rounded-2xl border border-border overflow-hidden relative">
                  <div
                    className="w-full h-full relative"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(28,46,64,.3) 40px,rgba(28,46,64,.3) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(28,46,64,.3) 40px,rgba(28,46,64,.3) 41px)",
                    }}
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-1/2 top-[45%] -translate-x-1/2 flex flex-col items-center"
                    >
                      <strong className="text-gold text-sm mb-1 whitespace-nowrap">{p.title}</strong>
                      <span className="w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow-[0_0_0_6px_rgba(200,155,60,.25)]" />
                    </motion.div>
                    <div className="absolute bottom-3 right-3.5 bg-card border border-border2 rounded-lg px-3 py-1.5 text-xs text-muted">
                      {p.quartier}, {p.city}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Colonne latérale (collante) ─── */}
        <div className="lg:sticky lg:top-[90px]">
          {/* Bloc prix + partage + sauvegarde */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-1">
              {typeMeta.shortLabel} · {kindLabel(p.kind)}
            </div>
            <div className="text-[13px] text-muted mb-3">{p.quartier}, {p.city}</div>

            <div className="font-display text-[32px] font-bold text-gold leading-none">
              {fmtPrice(p.price)}
            </div>
            {typeMeta.priceSuffix && (
              <div className="text-[13px] text-muted mt-1 mb-1">{typeMeta.priceSuffix}</div>
            )}
            <div className="text-[12px] text-dim mb-4">{fmtRelativeDate(p.createdAt)}</div>

            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-gold underline underline-offset-2 transition-colors"
              >
                <Share2 size={13} /> Partager
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-gold underline underline-offset-2 transition-colors"
              >
                <Link2 size={13} /> Copier le lien
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
              {isFav ? "Annonce sauvegardée ✓" : "Sauvegarder l'annonce"}
            </Button>
          </div>

          {/* Proposé par */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-3">
              Proposé par
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full border-2 border-gold overflow-hidden relative shrink-0">
                <Image src={p.owner.avatar} alt={p.owner.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[15px] text-text truncate">{p.owner.name}</div>
                {p.verified && (
                  <div className="text-[12px] text-green2 flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Propriétaire vérifié
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center text-[13px] text-muted flex-wrap">
              <Stars rating={p.owner.rating} />
              <span>
                {p.owner.rating} · {p.owner.listings} annonce{p.owner.listings > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h4 className="font-semibold text-base text-text mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" /> Contacter le propriétaire
            </h4>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-[40px] mb-3">✅</div>
                <h5 className="font-semibold text-[16px] text-text mb-1.5">Message envoyé !</h5>
                <p className="text-muted text-sm">
                  Le propriétaire vous répondra sous 24h.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  className="form-control mb-3"
                  style={{ minHeight: 100 }}
                  placeholder="Bonjour, je suis intéressé(e) par votre logement. Pourriez-vous me donner plus d'informations ?"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
                <Button variant="gold" full loading={sending} onClick={sendMessage} className="mb-2.5">
                  Envoyer le message
                </Button>
                {p.owner.phone ? (
                  <a
                    href={`tel:${p.owner.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] transition-colors duration-300 cursor-pointer w-full px-[22px] py-[11px] text-sm rounded-[10px] bg-transparent border border-border2 text-muted hover:border-gold hover:text-gold"
                  >
                    <Phone size={15} /> {p.owner.phone}
                  </a>
                ) : (
                  <p className="text-center text-xs text-dim italic">Numéro non communiqué</p>
                )}
              </>
            )}
          </div>

          {/* Conseils de sécurité — repris du modèle Rent237 : rassure le
              locataire et limite les arnaques au faux versement d'avance. */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted font-semibold mb-3 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gold" /> Conseils de sécurité
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              <Tag color="gold">Propriétaire vérifié</Tag>
              <Tag color="green">Annonce vérifiée</Tag>
            </div>
            <ul className="text-[13px] text-muted leading-relaxed flex flex-col gap-1.5">
              <li>• Visitez toujours le bien avant de payer.</li>
              <li>• Privilégiez les contacts vérifiés.</li>
              <li>• Ne versez jamais d&apos;argent à l&apos;avance sans visite.</li>
              <li>
                •{" "}
                <Link href="/contact" className="text-gold hover:underline">
                  Signalez
                </Link>{" "}
                toute annonce suspecte.
              </li>
            </ul>
          </div>

          {/* Annonces similaires */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-sm text-text mb-3.5">Annonces similaires</h4>
            {similar.length === 0 ? (
              <p className="text-muted text-[13px]">Aucune annonce similaire pour le moment.</p>
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
            aria-label="Remonter en haut"
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
