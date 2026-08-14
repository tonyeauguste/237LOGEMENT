"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bed, Bath, Ruler, MapPin, MessageSquare, Phone, Check } from "lucide-react";
import type { Property } from "@/lib/types";
import { fmtPrice, fmtRelativeDate } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";
import Stars from "@/components/ui/Stars";
import Button from "@/components/ui/Button";

type DetailTab = "desc" | "amenities" | "map";

export default function PropertyDetail({ p, similar = [] }: { p: Property; similar?: Property[] }) {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [tab, setTab] = useState<DetailTab>("desc");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isFav = useAppStore((s) => s.isFav(p.id));
  const toggleFav = useAppStore((s) => s.toggleFav);
  const showToast = useAppStore((s) => s.showToast);

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

  function callOwner() {
    showToast(`📞 Appel : ${p.owner.phone}`, "info");
  }

  return (
    <div className="pt-[90px] px-[5%] pb-[60px] max-w-[1240px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex gap-2 items-center mb-6 text-[13px] text-muted">
        <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
        <span className="text-dim">›</span>
        <Link href="/recherche" className="hover:text-gold transition-colors">Annonces</Link>
        <span className="text-dim">›</span>
        <span className="text-dim">{p.title}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start gap-5 mb-6 flex-wrap">
        <div>
          <div className="flex gap-2 items-center mb-2.5 flex-wrap">
            <Tag color={p.type === "courte" ? "gold" : "green"}>
              {p.type === "courte" ? "🌴 Court séjour" : "🏡 Long terme"}
            </Tag>
            {p.verified && <Tag color="blue">🛡 Propriétaire vérifié</Tag>}
            {p.available ? <Tag color="green">✅ Disponible</Tag> : <Tag color="red">❌ Non disponible</Tag>}
          </div>
          <h1 className="font-display text-[clamp(22px,3vw,40px)] font-bold text-text mb-2">{p.title}</h1>
          <div className="flex items-center gap-1.5 text-muted text-[15px]">
            <MapPin size={15} />
            <span>{p.quartier}, {p.city}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-[clamp(26px,3vw,42px)] font-bold text-gold leading-none">
            {fmtPrice(p.price)}
          </div>
          <div className="text-[13px] text-muted mt-1">/ {p.type === "courte" ? "nuit" : "mois"}</div>
          <button
            onClick={() => toggleFav(p.id)}
            className={`flex items-center gap-1.5 text-[13px] cursor-pointer mt-2.5 justify-end ml-auto transition-colors ${
              isFav ? "text-gold" : "text-muted hover:text-gold"
            }`}
          >
            <Heart size={15} className={isFav ? "fill-gold stroke-gold" : "stroke-current fill-none"} />
            {isFav ? "Sauvegardé ✓" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-1 md:h-[400px] rounded-2xl overflow-hidden mb-9">
        <div
          className="relative overflow-hidden cursor-pointer h-[220px] md:h-full"
          onClick={() => setGalleryIdx((galleryIdx + 1) % p.imgs.length)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={galleryIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image src={p.imgs[galleryIdx]} alt={p.title} fill sizes="70vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex md:flex-col gap-1 h-[72px] md:h-full">
          {p.imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setGalleryIdx(i)}
              className={`relative flex-1 overflow-hidden border-2 transition-colors ${
                i === galleryIdx ? "border-gold" : "border-transparent"
              }`}
            >
              <Image src={src} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 mb-7 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-[18px] text-center border-r border-border">
              <div className="flex justify-center mb-1.5 text-gold"><Bed size={16} /></div>
              <div className="font-semibold text-[15px] text-text">{p.rooms} chambre{p.rooms > 1 ? "s" : ""}</div>
              <div className="text-xs text-muted">Chambres</div>
            </div>
            <div className="p-[18px] text-center border-r border-border">
              <div className="flex justify-center mb-1.5 text-gold"><Bath size={16} /></div>
              <div className="font-semibold text-[15px] text-text">{p.baths} salle{p.baths > 1 ? "s" : ""} de bain</div>
              <div className="text-xs text-muted">Salles de bain</div>
            </div>
            <div className="p-[18px] text-center">
              <div className="flex justify-center mb-1.5 text-gold"><Ruler size={16} /></div>
              <div className="font-semibold text-[15px] text-text">{p.surface} m²</div>
              <div className="text-xs text-muted">Surface</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            {([
              ["desc", "Description"],
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
                <p className="text-muted text-[15px] leading-[1.8]">{p.desc}</p>
                <div className="bg-card2 border border-border rounded-xl px-[18px] py-4 mt-[18px] flex gap-5 flex-wrap text-[13px] text-muted">
                  <span>👁 {p.views} vues</span>
                  <span>❤️ {p.favs} favoris</span>
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
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 px-3.5 py-3 bg-card border border-border rounded-[10px] text-sm text-text">
                    <Check size={14} className="text-gold shrink-0" />
                    {a}
                  </div>
                ))}
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

        {/* Sidebar */}
        <div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
            <div className="h-[100px] relative overflow-hidden">
              <Image src={p.owner.avatar} alt={p.owner.name} fill className="object-cover blur-sm brightness-[.4]" />
            </div>
            <div className="px-5 pb-5 -mt-[42px] relative">
              <div className="w-[70px] h-[70px] rounded-full border-[3px] border-gold overflow-hidden mb-2.5 relative">
                <Image src={p.owner.avatar} alt={p.owner.name} fill className="object-cover" />
              </div>
              <div className="font-semibold text-base text-text mb-1">{p.owner.name}</div>
              <div className="flex gap-2 items-center text-[13px] text-muted flex-wrap">
                <Stars rating={p.owner.rating} />
                <span>{p.owner.rating} · {p.owner.listings} annonce{p.owner.listings > 1 ? "s" : ""}</span>
                {p.verified && <Tag color="blue" className="!text-[11px]">🛡 Vérifié</Tag>}
              </div>
            </div>
          </div>

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
                  <br />
                  Vérifiez vos notifications régulièrement.
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
                <Button variant="ghost" full onClick={callOwner}>
                  <Phone size={15} /> {p.owner.phone}
                </Button>
              </>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-sm text-text mb-3.5">Annonces similaires</h4>
            {similar.length === 0 ? (
              <p className="text-muted text-[13px]">Aucune annonce similaire</p>
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
    </div>
  );
}
