"use client";

// ═══════════════════════════════════════════════
// Tableau de bord UNIFIÉ — remplace les deux espaces séparés
// (/compte/visiteur et /compte/proprietaire) qui obligeaient à choisir son
// camp à l'inscription. Désormais tout compte a le même espace : favoris,
// annonces, statistiques, messages, paramètres — et, pour l'admin
// uniquement, la section Administration.
// ═══════════════════════════════════════════════

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  List,
  Heart,
  PlusCircle,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Eye,
  Trash2,
  Pencil,
  Shield,
  LayoutDashboard,
  Building2,
  Users2,
} from "lucide-react";
import DashSidebar from "@/components/dashboard/DashSidebar";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ToggleRow from "@/components/ui/ToggleRow";
import CitySelect from "@/components/ui/CitySelect";
import ComingSoon from "@/components/ui/ComingSoon";
import PropertyCard from "@/components/property/PropertyCard";
import AdminOverview from "@/components/dashboard/AdminOverview";
import AdminAnnonces from "@/components/dashboard/AdminAnnonces";
import AdminUsers from "@/components/dashboard/AdminUsers";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { rowToProperty } from "@/lib/supabase/mappers";
import { fmtPrice } from "@/lib/format";
import type { Property } from "@/lib/types";

type UserSection = "favoris" | "listings" | "stats" | "messages" | "settings";
type AdminSection = "admin-overview" | "admin-annonces" | "admin-users";
type Section = UserSection | AdminSection;

function isAdminSection(s: Section): s is AdminSection {
  return s.startsWith("admin");
}

export default function AccountDashboard() {
  // Plus de rôle requis : tout compte connecté accède au même espace.
  const user = useAuthGuard();
  const showToast = useAppStore((s) => s.showToast);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const favorites = useAppStore((s) => s.favorites);
  const router = useRouter();
  const [section, setSection] = useState<Section>("favoris");
  const isAdmin = user?.role === "admin";

  // Passerelle "Voir ses annonces" depuis la fiche d'un compte (onglet
  // Comptes) vers l'onglet Annonces, avec la recherche déjà pré-remplie.
  const [adminAnnoncesSearch, setAdminAnnoncesSearch] = useState("");
  const [adminAnnoncesKey, setAdminAnnoncesKey] = useState(0);

  const [listings, setListings] = useState<Property[]>([]);
  const [favProperties, setFavProperties] = useState<Property[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    { id: number; message: string; created_at: string; property_title: string; property_id: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Annonces publiées par cet utilisateur + messages reçus sur celles-ci.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();
    Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("property_messages")
        .select("id, message, created_at, property_id, properties(title)")
        .order("created_at", { ascending: false }),
    ]).then(([propsRes, msgRes]) => {
      if (cancelled) return;
      setListings((propsRes.data ?? []).map(rowToProperty));
      setMessages(
        (msgRes.data ?? []).map((m) => ({
          id: m.id,
          message: m.message,
          created_at: m.created_at,
          property_id: m.property_id ?? 0,
          property_title: (m.properties as { title?: string } | null)?.title ?? "Annonce supprimée",
        }))
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Favoris : stockés localement comme une liste d'IDs, il faut aller
  // chercher les annonces correspondantes pour pouvoir les afficher.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const request =
      favorites.length === 0
        ? Promise.resolve<Property[]>([])
        : supabase
            .from("properties")
            .select("*")
            .in("id", favorites)
            .then(({ data }) => (data ?? []).map(rowToProperty));
    request.then((props) => {
      if (cancelled) return;
      setFavProperties(props);
    });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const totalViews = listings.reduce((sum, p) => sum + p.views, 0);
  const totalFavs = listings.reduce((sum, p) => sum + p.favs, 0);
  const stats = [
    { icon: "📊", val: String(listings.length), label: "Annonces publiées", color: "text-gold" },
    { icon: "👁", val: String(totalViews), label: "Vues cumulées", color: "text-blue" },
    { icon: "💬", val: String(messages.length), label: "Messages reçus", color: "text-green2" },
    { icon: "❤️", val: String(totalFavs), label: "Favoris reçus", color: "text-red" },
  ];

  // Message plutôt qu'un écran blanc pendant la vérification de session
  // (sinon la navbar se retrouve collée au footer et la page paraît cassée).
  if (!user) {
    return (
      <div className="pt-[160px] pb-[100px] text-center text-muted text-sm">
        Chargement de votre espace…
      </div>
    );
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    setCurrentUser(null);
    showToast("👋 Déconnexion réussie. À bientôt !", "info");
    router.push("/");
  }

  async function handleDelete(p: Property) {
    if (!window.confirm(`Supprimer définitivement l'annonce « ${p.title} » ? Cette action est irréversible.`)) {
      return;
    }
    setDeletingId(p.id);
    const supabase = createClient();
    // .select() après le delete() : sans policy RLS "DELETE", Postgres
    // refuse silencieusement (0 ligne supprimée, aucune erreur PostgREST).
    const { data, error } = await supabase.from("properties").delete().eq("id", p.id).select();
    setDeletingId(null);
    if (error || !data || data.length === 0) {
      showToast("❌ Impossible de supprimer l'annonce. Réessayez.", "error");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== p.id));
    showToast("🗑️ Annonce supprimée.", "success");
  }

  function goToOwnerListings(ownerName: string) {
    setAdminAnnoncesSearch(ownerName);
    setAdminAnnoncesKey((k) => k + 1);
    setSection("admin-annonces");
  }

  return (
    <div className="pt-[70px] grid grid-cols-1 lg:grid-cols-[250px_1fr] min-h-screen">
      <DashSidebar
        user={user}
        roleBadge={
          isAdmin ? (
            <div className="flex flex-col items-center gap-1.5">
              <Tag color="gold">🔑 Mon compte</Tag>
              <span className="text-[10px] font-bold tracking-[1px] bg-gold text-[#07111e] px-2.5 py-[3px] rounded-full">
                ADMIN
              </span>
            </div>
          ) : (
            <Tag color="gold">🔑 Mon compte</Tag>
          )
        }
        active={isAdminSection(section) ? "admin" : section}
        onSelect={(k) => setSection(k === "admin" ? "admin-overview" : (k as Section))}
        items={[
          { key: "favoris", label: "Mes favoris", icon: <Heart size={15} />, badge: favorites.length },
          { key: "listings", label: "Mes annonces", icon: <List size={15} /> },
          { key: "stats", label: "Statistiques", icon: <BarChart3 size={15} /> },
          { key: "messages", label: "Messages", icon: <MessageSquare size={15} /> },
          { key: "settings", label: "Paramètres", icon: <Settings size={15} /> },
          // Visible UNIQUEMENT pour l'admin.
          ...(isAdmin ? [{ key: "admin", label: "Administration", icon: <Shield size={15} /> }] : []),
        ]}
        footer={
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-[11px] rounded-[10px] text-sm text-red hover:bg-bg3 transition-colors w-full text-left"
          >
            <LogOut size={15} /> Déconnexion
          </button>
        }
      />

      <div className="px-4 lg:px-[42px] py-6 lg:py-9 bg-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {section === "favoris" && (
              <>
                <Header
                  label="Mon espace"
                  title="Mes favoris"
                  sub="Les logements que vous avez sauvegardés."
                />
                {favProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favProperties.map((p) => (
                      <PropertyCard key={p.id} p={p} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-[60px] px-5">
                    <div className="text-[48px] mb-3.5">💛</div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      Aucun favori pour l&apos;instant
                    </h3>
                    <p className="text-sm text-muted mb-[22px]">
                      Explorez les annonces et cliquez sur le cœur pour sauvegarder vos préférées.
                    </p>
                    <Link href="/recherche">
                      <Button variant="gold">Explorer les annonces</Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {section === "listings" && (
              <>
                <div className="flex justify-between items-end mb-[30px] flex-wrap gap-3">
                  <div>
                    <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">
                      Mon espace
                    </div>
                    <h2 className="font-display text-[26px] font-bold text-text mt-1">Mes annonces</h2>
                    <p className="text-sm text-muted mt-1.5">Gérez vos biens mis en location.</p>
                  </div>
                  <Link href="/publier">
                    <Button variant="gold">
                      <PlusCircle size={14} /> Nouvelle annonce
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl px-5 py-[18px]">
                      <div className="text-[22px] mb-2">{s.icon}</div>
                      <div className={`font-display text-[28px] font-bold mb-1 ${s.color}`}>{s.val}</div>
                      <div className="text-[13px] text-muted">{s.label}</div>
                    </div>
                  ))}
                </div>
                {loading ? null : listings.length === 0 ? (
                  <ComingSoon
                    title="Aucune annonce publiée pour le moment"
                    text="Publiez votre premier bien et suivez ici ses vues, ses favoris et les messages reçus."
                    action={
                      <Link href="/publier">
                        <Button variant="gold">+ Publier une annonce</Button>
                      </Link>
                    }
                    className="mx-0"
                  />
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {listings.map((p) => (
                      <Link
                        key={p.id}
                        href={`/annonce/${p.id}`}
                        className="flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden hover:border-border2 transition-colors"
                      >
                        <div className="relative w-full sm:w-[140px] h-[160px] sm:h-auto shrink-0">
                          <Image src={p.imgs[0]} alt={p.title} fill sizes="140px" className="object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                          <div className="flex-1">
                            <div className="flex gap-1.5 mb-1.5 flex-wrap">
                              <Tag color={p.type === "courte" ? "gold" : "green"}>
                                {p.type === "courte" ? "🌴 Court séjour" : "🏡 Long terme"}
                              </Tag>
                              {!p.available && <Tag color="red">Non disponible</Tag>}
                              {p.status === "blocked" && <Tag color="orange">🚫 Bloqué</Tag>}
                            </div>
                            <div className="font-semibold text-base text-text mb-1">{p.title}</div>
                            <div className="text-[13px] text-muted">{p.quartier}, {p.city}</div>
                          </div>
                          <div className="flex gap-6 shrink-0">
                            <div className="text-center">
                              <div className="font-semibold text-base text-text flex items-center gap-1 justify-center">
                                <Eye size={13} /> {p.views}
                              </div>
                              <div className="text-[11px] text-muted">Vues</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-base text-text flex items-center gap-1 justify-center">
                                <Heart size={13} /> {p.favs}
                              </div>
                              <div className="text-[11px] text-muted">Favoris</div>
                            </div>
                          </div>
                          <div className="font-display font-bold text-lg text-gold shrink-0">
                            {fmtPrice(p.price)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/publier?edit=${p.id}`);
                            }}
                            title="Modifier l'annonce"
                            className="shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:bg-gold3 hover:border-gold hover:text-gold transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(p);
                            }}
                            disabled={deletingId === p.id}
                            title="Supprimer l'annonce"
                            className="shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center text-red hover:bg-red/10 hover:border-red transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {section === "stats" && (
              <>
                <Header
                  label="Analytique"
                  title="Statistiques"
                  sub={listings.length > 0 ? "Vues et favoris par annonce, mis à jour en temps réel." : undefined}
                />
                {loading ? null : listings.length === 0 ? (
                  <div className="text-center py-[60px] px-5">
                    <div className="text-[48px] mb-3.5">📊</div>
                    <h3 className="text-lg font-semibold text-text mb-2">Aucune statistique disponible</h3>
                    <p className="text-sm text-muted mb-[22px]">
                      Vos statistiques de vues, contacts et favoris apparaîtront ici une fois vos
                      premières annonces publiées.
                    </p>
                    <Link href="/publier">
                      <Button variant="gold">Publier une annonce</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {[...listings]
                      .sort((a, b) => b.views - a.views)
                      .map((p) => {
                        const maxViews = Math.max(...listings.map((l) => l.views), 1);
                        return (
                          <Link
                            key={p.id}
                            href={`/annonce/${p.id}`}
                            className="block bg-card border border-border rounded-xl px-5 py-4 hover:border-gold transition-colors"
                          >
                            <div className="flex justify-between items-center gap-3 mb-2.5">
                              <span className="font-semibold text-sm text-text truncate">{p.title}</span>
                              <div className="flex gap-4 shrink-0 text-xs text-muted">
                                <span className="flex items-center gap-1">
                                  <Eye size={12} /> {p.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart size={12} /> {p.favs}
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-bg3 overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full"
                                style={{ width: `${Math.max(4, (p.views / maxViews) * 100)}%` }}
                              />
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </>
            )}

            {section === "messages" && (
              <>
                <Header label="Communication" title="Messages reçus" />
                {loading ? null : messages.length === 0 ? (
                  <div className="text-center py-[60px] px-5">
                    <div className="text-[48px] mb-3.5">💬</div>
                    <h3 className="text-lg font-semibold text-text mb-2">Aucun message pour le moment</h3>
                    <p className="text-sm text-muted">
                      Les messages envoyés par les locataires intéressés par vos biens apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {messages.map((m) => (
                      <Link
                        key={m.id}
                        href={`/annonce/${m.property_id}`}
                        className="block bg-card border border-border rounded-xl px-5 py-4 hover:border-gold transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1.5 gap-3">
                          <span className="font-semibold text-sm text-text">{m.property_title}</span>
                          <span className="text-xs text-muted shrink-0">
                            {new Date(m.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-[13px] text-muted leading-relaxed">{m.message}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {section === "settings" && (
              <>
                <Header label="Mon compte" title="Paramètres" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[780px]">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">Mon profil</h4>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom complet</label>
                      <input className="form-control" defaultValue={user.name} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Email</label>
                      <input className="form-control" type="email" defaultValue={user.email} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
                      <input className="form-control" placeholder="+237 6XX XXX XXX" defaultValue={user.phone} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Ville</label>
                      <CitySelect placeholder="Sélectionner une ville" />
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => showToast("✅ Profil mis à jour", "success")}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">Notifications</h4>
                    <ToggleRow label="Nouveau message reçu" defaultOn />
                    <ToggleRow label="Nouvelles annonces correspondant à mes critères" defaultOn />
                    <ToggleRow label="Alerte ajouté aux favoris" />
                    <ToggleRow label="Newsletter mensuelle" last />
                  </div>
                </div>
              </>
            )}

            {isAdmin && isAdminSection(section) && (
              <>
                {/* Sous-onglets du panneau admin */}
                <div className="flex gap-2 mb-7 flex-wrap">
                  {(
                    [
                      { key: "admin-overview", label: "Vue d'ensemble", icon: <LayoutDashboard size={14} /> },
                      { key: "admin-annonces", label: "Annonces", icon: <Building2 size={14} /> },
                      { key: "admin-users", label: "Comptes", icon: <Users2 size={14} /> },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSection(t.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        section === t.key
                          ? "bg-gold text-[#07111e]"
                          : "bg-card border border-border text-muted hover:border-gold hover:text-gold"
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {section === "admin-overview" && <AdminOverview onNavigate={(s) => setSection(s)} />}
                {section === "admin-annonces" && (
                  <AdminAnnonces key={adminAnnoncesKey} initialSearch={adminAnnoncesSearch} />
                )}
                {section === "admin-users" && <AdminUsers onViewListings={goToOwnerListings} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="flex justify-between items-end mb-[30px]">
      <div>
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{label}</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">{title}</h2>
        {sub && <p className="text-sm text-muted mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
