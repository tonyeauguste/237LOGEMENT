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
  ShieldCheck,
  Home,
  AlertTriangle,
  Info,
} from "lucide-react";
import DashSidebar from "@/components/dashboard/DashSidebar";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ToggleRow from "@/components/ui/ToggleRow";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import PasswordField from "@/components/auth/PasswordField";
import PasswordStrength from "@/components/auth/PasswordStrength";
import CityInput from "@/components/ui/CityInput";
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
import { propertyGroup, transactionMeta } from "@/lib/data";
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
  // PARTIE B — statut d'occupation. `occupancyBusyId` couvre le toggle
  // (courte durée) ; `rentalModalTarget` porte l'annonce en attente de
  // confirmation dans la modale "Marquer comme loué" (longue durée,
  // suppression définitive — voir handleMarkAsRented).
  const [occupancyBusyId, setOccupancyBusyId] = useState<number | null>(null);
  const [rentalModalTarget, setRentalModalTarget] = useState<Property | null>(null);
  const [markingRented, setMarkingRented] = useState(false);
  // Incrémenté après un échec de handleToggleOccupancy pour forcer le
  // remontage du Toggle concerné (voir son usage plus bas) — sinon son
  // bascule optimiste reste affiché à tort après une erreur serveur.
  const [toggleNonce, setToggleNonce] = useState(0);
  const [messages, setMessages] = useState<
    { id: number; message: string; created_at: string; property_title: string; property_id: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ── Formulaire "Paramètres" ──────────────────────
  // Champs contrôlés initialisés depuis la session. `user` arrive de façon
  // asynchrone (relecture du cookie), d'où la resynchronisation ci-dessous
  // plutôt qu'une simple valeur initiale, qui resterait vide.
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  // Recopie les valeurs du compte dans le formulaire dès qu'il est connu,
  // et à chaque changement de compte — sans écraser une saisie en cours,
  // d'où la comparaison sur l'identifiant.
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setFormName(user.name ?? "");
    setFormEmail(user.email ?? "");
    setFormPhone(user.phone ?? "");
    setFormCity(user.city ?? "");
  }

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

  /**
   * PARTIE B.2 — Toggle réversible (court séjour uniquement) : bascule le
   * statut d'occupation sans jamais toucher à l'annonce elle-même. Le
   * badge rouge + le flou de la photo sur l'affichage public découlent de
   * ce seul champ (voir isOccupied dans PropertyCard.tsx / PropertyDetail.tsx).
   */
  async function handleToggleOccupancy(p: Property, occupied: boolean) {
    setOccupancyBusyId(p.id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("properties")
      .update({ occupancy_status: occupied ? "occupe" : "disponible" })
      .eq("id", p.id)
      .select();
    setOccupancyBusyId(null);
    if (error || !data || data.length === 0) {
      showToast("❌ Impossible de mettre à jour le statut. Réessayez.", "error");
      // Le composant Toggle bascule visuellement dès le clic (optimiste),
      // avant même la réponse du serveur. Sans ce remount forcé, un échec
      // laisserait le toggle affiché dans le mauvais état — sa `key` ne
      // change que si `occupancyStatus` change réellement, ce qui n'arrive
      // pas ici puisque l'update a échoué.
      setToggleNonce((n) => n + 1);
      return;
    }
    setListings((prev) =>
      prev.map((l) => (l.id === p.id ? { ...l, occupancyStatus: occupied ? "occupe" : "disponible" } : l))
    );
    showToast(
      occupied
        ? "🔴 Annonce marquée comme occupée — sa photo est floutée sur la fiche publique."
        : "✅ Annonce remise disponible.",
      "success"
    );
  }

  /**
   * PARTIE B.3 — Longue durée : action définitive, appelée uniquement
   * après confirmation dans la modale (voir `rentalModalTarget`). Pas de
   * statut "occupé" persisté ici : on réutilise directement le mécanisme
   * de suppression déjà en place (`handleDelete` ci-dessus, seule
   * suppression définitive existante dans le projet) pour rester cohérent
   * — l'annonce n'est ensuite plus ni visible ni récupérable.
   */
  async function handleMarkAsRented(p: Property) {
    setMarkingRented(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("properties").delete().eq("id", p.id).select();
    setMarkingRented(false);
    if (error || !data || data.length === 0) {
      showToast("❌ Impossible de finaliser cette action. Réessayez.", "error");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== p.id));
    // Ferme la modale seulement si elle affiche encore CETTE annonce — si
    // l'utilisateur l'a fermée puis a ouvert celle d'une autre annonce
    // pendant que cette requête était en vol, on ne veut pas lui fermer
    // sous le nez la modale d'une confirmation en cours pour une autre.
    setRentalModalTarget((current) => (current?.id === p.id ? null : current));
    showToast("🏠 Bien marqué comme loué — l'annonce a été supprimée définitivement.", "success");
  }

  /**
   * Enregistre le profil. Deux destinations distinctes :
   * - nom / téléphone / ville → table `profiles` (policy RLS "Users can
   *   update own profile") ;
   * - email → Supabase Auth, qui envoie un lien de confirmation à la
   *   nouvelle adresse et n'applique le changement qu'après validation.
   */
  async function saveProfile() {
    if (!user) return;
    if (!formName.trim()) {
      showToast("⚠️ Le nom ne peut pas être vide.", "error");
      return;
    }

    setSavingProfile(true);
    const supabase = createClient();

    // .select() pour distinguer un refus RLS (0 ligne, sans erreur
    // PostgREST) d'une vraie mise à jour — sinon on annoncerait un succès
    // alors que rien n'a changé en base.
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: formName.trim(),
        phone: formPhone.trim() || null,
        city: formCity.trim() || null,
      })
      .eq("id", user.id)
      .select();

    if (error || !data || data.length === 0) {
      setSavingProfile(false);
      showToast("❌ Impossible d'enregistrer le profil. Réessayez.", "error");
      return;
    }

    // Le changement d'email est traité à part, et seulement s'il a bougé.
    const newEmail = formEmail.trim();
    let emailPending = false;
    if (newEmail && newEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
      if (emailError) {
        setSavingProfile(false);
        showToast(
          emailError.message.toLowerCase().includes("already")
            ? "❌ Cette adresse email est déjà utilisée."
            : "❌ Impossible de changer l'email. Le reste du profil a été enregistré.",
          "error"
        );
        return;
      }
      emailPending = true;
    }

    // Met à jour la session locale pour que la sidebar et le reste de
    // l'application reflètent immédiatement le nouveau nom. L'email, lui,
    // ne change qu'une fois le lien de confirmation cliqué.
    setCurrentUser({
      ...user,
      name: data[0].name,
      phone: data[0].phone ?? undefined,
      city: data[0].city ?? undefined,
    });

    setSavingProfile(false);
    showToast(
      emailPending
        ? "✅ Profil enregistré. Confirmez le changement d'email via le lien reçu."
        : "✅ Profil mis à jour.",
      "success"
    );
  }

  /** Change le mot de passe de l'utilisateur connecté (sans passer par un email). */
  async function changePassword() {
    if (newPwd.length < 8) {
      showToast("⚠️ Le mot de passe doit contenir au moins 8 caractères.", "error");
      return;
    }
    if (newPwd !== newPwd2) {
      showToast("⚠️ Les deux mots de passe ne correspondent pas.", "error");
      return;
    }

    setSavingPwd(true);
    const { error } = await createClient().auth.updateUser({ password: newPwd });
    setSavingPwd(false);

    if (error) {
      showToast(
        error.message.toLowerCase().includes("should be different")
          ? "⚠️ Choisissez un mot de passe différent de l'actuel."
          : "❌ Impossible de changer le mot de passe. Réessayez.",
        "error"
      );
      return;
    }

    setNewPwd("");
    setNewPwd2("");
    showToast("✅ Mot de passe modifié.", "success");
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

                {/* PARTIE C — rappel discret (pas de popup) sur la gestion
                    du statut d'occupation, visible tant qu'il y a des
                    annonces en location à gérer. */}
                {listings.some((p) => p.transactionType === "location" && p.type !== null) && (
                  <div className="flex gap-3 bg-card2 border border-border rounded-xl px-4 py-3.5 mb-6 text-[13px] text-muted leading-relaxed">
                    <Info size={16} className="text-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-text">
                        📌 Rappel : une fois votre bien pris, pensez à mettre à jour son statut.
                      </span>
                      <br />
                      — <strong className="text-text">Courte durée</strong> : marquez l&apos;annonce comme
                      « Occupée » — elle reste visible mais la photo est floutée jusqu&apos;à la remise à jour du
                      statut.
                      <br />
                      — <strong className="text-text">Longue durée</strong> : marquer un bien comme loué
                      supprime définitivement l&apos;annonce de la recherche publique. Cette action est
                      irréversible.
                    </div>
                  </div>
                )}

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
                    {listings.map((p) => {
                      const group = propertyGroup(p.kind);
                      const meta = transactionMeta(p.transactionType, p.type, group);
                      // B.2/B.4 — badge + flou de la photo publique, cohérent
                      // avec PropertyCard.tsx / PropertyDetail.tsx.
                      const isOccupied = p.type === "courte" && p.occupancyStatus === "occupe";
                      return (
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
                              <Tag color={meta.tagColor}>{meta.badgeLabel}</Tag>
                              {isOccupied && <Tag color="red">🔴 Occupé</Tag>}
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

                          {/* B.2 — court séjour : toggle réversible, pas de
                              confirmation (contrairement au longue durée
                              ci-dessous, volontairement traité différemment
                              pour qu'on ne les confonde jamais). */}
                          {p.transactionType === "location" && p.type === "courte" && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              title={isOccupied ? "Remettre l'annonce disponible" : "Marquer comme occupé"}
                              className="shrink-0 flex items-center gap-2"
                            >
                              <span className="text-[11px] text-muted hidden sm:inline">Occupé</span>
                              <Toggle
                                key={`occ-${p.id}-${p.occupancyStatus ?? "disponible"}-${toggleNonce}`}
                                defaultOn={isOccupied}
                                disabled={occupancyBusyId === p.id}
                                onChange={(on) => handleToggleOccupancy(p, on)}
                              />
                            </div>
                          )}
                          {/* B.3 — longue durée : ouvre la modale de
                              confirmation, seule porte d'entrée vers
                              handleMarkAsRented (suppression définitive). */}
                          {p.transactionType === "location" && p.type === "longue" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRentalModalTarget(p);
                              }}
                              title="Marquer comme loué"
                              className="shrink-0 w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:bg-red/10 hover:border-red hover:text-red transition-colors"
                            >
                              <Home size={15} />
                            </button>
                          )}

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
                      );
                    })}
                  </div>
                )}

                {/* B.3 — modale de confirmation "Marquer comme loué",
                    délibérément distincte (rouge, texte d'avertissement
                    explicite) du toggle réversible du court séjour
                    ci-dessus, pour qu'un propriétaire ne les confonde pas. */}
                <Modal open={rentalModalTarget !== null} onClose={() => setRentalModalTarget(null)}>
                  {rentalModalTarget && (
                    <>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red/10 border border-red/30 flex items-center justify-center shrink-0">
                          <AlertTriangle size={18} className="text-red" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-text">Marquer ce bien comme loué ?</h3>
                      </div>
                      <p className="text-sm text-muted leading-relaxed mb-1.5">
                        Cette action est <strong className="text-text">définitive</strong>. Une fois votre bien «{" "}
                        {rentalModalTarget.title} » marqué comme loué, l&apos;annonce sera{" "}
                        <strong className="text-red">supprimée</strong> et ne pourra pas être récupérée.
                      </p>
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        Si vous souhaitez le publier à nouveau plus tard, il faudra créer une nouvelle annonce
                        depuis zéro.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setRentalModalTarget(null)}
                          disabled={markingRented}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="danger"
                          className="flex-1"
                          loading={markingRented}
                          onClick={() => handleMarkAsRented(rentalModalTarget)}
                        >
                          Confirmer — Supprimer l&apos;annonce
                        </Button>
                      </div>
                    </>
                  )}
                </Modal>
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
                      <input
                        className="form-control"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                      {/* Changer d'email ne se fait pas comme changer un nom :
                          Supabase envoie un lien à la nouvelle adresse et
                          n'applique le changement qu'une fois celui-ci cliqué. */}
                      {formEmail.trim() !== user.email && (
                        <p className="text-[12px] text-gold mt-1.5">
                          Un email de confirmation sera envoyé à cette adresse.
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
                      <input
                        className="form-control"
                        placeholder="+237 6XX XXX XXX"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Ville</label>
                      <CityInput
                        placeholder="Votre ville"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                      />
                    </div>
                    <Button variant="gold" size="sm" loading={savingProfile} onClick={saveProfile}>
                      Mettre à jour
                    </Button>
                  </div>
                  {/* Changement de mot de passe sans passer par l'email :
                      l'utilisateur est déjà authentifié, Supabase accepte
                      updateUser({ password }) directement. */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px] flex items-center gap-2">
                      <ShieldCheck size={15} className="text-gold" /> Mot de passe
                    </h4>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">
                        Nouveau mot de passe
                      </label>
                      <PasswordField
                        value={newPwd}
                        onChange={setNewPwd}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <PasswordStrength password={newPwd} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">
                        Confirmer
                      </label>
                      <PasswordField
                        value={newPwd2}
                        onChange={setNewPwd2}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {newPwd2.length > 0 && newPwd !== newPwd2 && (
                        <p className="text-[12px] text-red mt-1.5">
                          Les deux mots de passe ne correspondent pas.
                        </p>
                      )}
                    </div>
                    <Button variant="gold" size="sm" loading={savingPwd} onClick={changePassword}>
                      Changer le mot de passe
                    </Button>
                    <p className="text-[12px] text-dim mt-3 leading-relaxed">
                      Au moins 8 caractères. Vous resterez connecté après le changement.
                    </p>
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
