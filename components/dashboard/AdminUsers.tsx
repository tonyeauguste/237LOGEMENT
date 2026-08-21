"use client";

// ═══════════════════════════════════════════════
// Panneau admin — Gestion de TOUS les comptes utilisateurs
// Recherche nom/email, pagination 20/page, fiche profil complète,
// modification (nom/téléphone), bloquer/débloquer, suppression
// définitive (profil + annonces).
//
// L'email n'existe que dans auth.users (pas dans `profiles`), donc on
// passe par le RPC `admin_list_users` (SECURITY DEFINER, réservé aux
// admins — voir la migration add_admin_system) plutôt que par une
// requête directe sur `profiles`.
// ═══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Ban, CheckCircle2, Trash2, X, Building2 } from "lucide-react";
import Tag from "@/components/ui/Tag";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { fmtRelativeDate } from "@/lib/format";
import { DEFAULT_AVATAR } from "@/lib/data";
import type { AccountStatus, AdminUserRow, UserRole } from "@/lib/types";

const PAGE_SIZE = 20;

export default function AdminUsers({ onViewListings }: { onViewListings: (ownerName: string) => void }) {
  const showToast = useAppStore((s) => s.showToast);
  const currentUser = useAppStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserRow | null>(null);

  // setState synchrone (setPage, setLoading) déclenché depuis les handlers
  // d'événement ci-dessous, jamais dans le corps d'un effet — voir la
  // règle react-hooks/set-state-in-effect. L'effet ne fait que la requête
  // et pousse le résultat dans .then() (continuation asynchrone, autorisée).
  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
    setLoading(true);
  }
  function handlePageChange(p: number) {
    setPage(p);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .rpc("admin_list_users", {
        p_search: search.trim() || undefined,
        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          showToast("❌ Impossible de charger les comptes.", "error");
          setLoading(false);
          return;
        }
        const rows = data ?? [];
        setUsers(
          rows.map((u) => ({
            id: u.id,
            email: u.email,
            createdAt: u.created_at,
            lastSignInAt: u.last_sign_in_at,
            name: u.name || "Utilisateur",
            phone: u.phone,
            avatar: u.avatar,
            role: u.role as UserRole,
            status: u.status as AccountStatus,
            listingsCount: u.listings_count,
          }))
        );
        setTotal(rows[0]?.total_count ?? 0);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  async function toggleBlock(u: AdminUserRow) {
    if (u.id === currentUser?.id) {
      showToast("⛔ Vous ne pouvez pas bloquer votre propre compte.", "error");
      return;
    }
    const nextStatus: AccountStatus = u.status === "blocked" ? "active" : "blocked";
    const label = nextStatus === "blocked" ? "bloquer" : "débloquer";
    const warn =
      nextStatus === "blocked"
        ? ` Ses annonces seront automatiquement masquées du site public.`
        : "";
    if (!window.confirm(`Voulez-vous vraiment ${label} le compte de « ${u.name} » ?${warn}`)) return;

    setBusyId(u.id);
    const supabase = createClient();
    const { data, error } = await supabase.from("profiles").update({ status: nextStatus }).eq("id", u.id).select();
    setBusyId(null);

    if (error || !data || data.length === 0) {
      showToast("❌ Action impossible. Réessayez.", "error");
      return;
    }
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: nextStatus } : x)));
    setDetail((d) => (d && d.id === u.id ? { ...d, status: nextStatus } : d));
    showToast(
      nextStatus === "blocked" ? "🚫 Compte bloqué — connexion refusée." : "✅ Compte débloqué.",
      "success"
    );
  }

  async function handleDelete(u: AdminUserRow) {
    if (u.id === currentUser?.id) {
      showToast("⛔ Vous ne pouvez pas supprimer votre propre compte.", "error");
      return;
    }
    if (
      !window.confirm(
        `Supprimer définitivement le compte de « ${u.name} » ? Ses ${u.listingsCount} annonce(s) seront aussi supprimées. Cette action est irréversible.`
      )
    ) {
      return;
    }
    setBusyId(u.id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_delete_user", { p_id: u.id });
    setBusyId(null);

    if (error) {
      showToast("❌ Impossible de supprimer ce compte. Réessayez.", "error");
      return;
    }
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    setTotal((t) => Math.max(0, t - 1));
    setDetail((d) => (d && d.id === u.id ? null : d));
    showToast("🗑️ Compte supprimé définitivement.", "success");
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="mb-6">
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">Administration</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">Tous les comptes</h2>
        <p className="text-sm text-muted mt-1.5">
          {loading ? "Chargement…" : `${total} compte${total > 1 ? "s" : ""} inscrit${total > 1 ? "s" : ""}.`}
        </p>
      </div>

      <div className="relative mb-6 max-w-[420px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="form-control !pl-10"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted text-center py-16">Chargement des comptes…</p>
      ) : users.length === 0 ? (
        <div className="text-center py-16 px-5">
          <div className="text-[40px] mb-3">🔍</div>
          <h3 className="text-base font-semibold text-text mb-1.5">Aucun compte ne correspond</h3>
          <p className="text-sm text-muted">Essayez une autre recherche.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4"
            >
              <button
                onClick={() => setDetail(u)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatar || DEFAULT_AVATAR} alt={u.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-text truncate">{u.name}</div>
                  <div className="text-[12px] text-muted truncate">{u.email}</div>
                </div>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <Tag color={u.role === "owner" ? "gold" : u.role === "admin" ? "blue" : "neutral"}>
                  {u.role === "owner" ? "🔑 Propriétaire" : u.role === "admin" ? "🛡 Admin" : "👤 Visiteur"}
                </Tag>
                {u.status === "blocked" && <Tag color="red">🚫 Bloqué</Tag>}
                <span className="text-[12px] text-muted whitespace-nowrap">
                  {u.listingsCount} annonce{u.listingsCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onViewListings(u.name)}
                  title="Voir ses annonces"
                  className="w-9 h-9 rounded-lg border border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.08)] flex items-center justify-center text-blue hover:bg-[rgba(59,130,246,.18)] transition-colors"
                >
                  <Building2 size={15} />
                </button>
                <button
                  onClick={() => toggleBlock(u)}
                  disabled={busyId === u.id || u.id === currentUser?.id}
                  title={u.status === "blocked" ? "Débloquer le compte" : "Bloquer le compte"}
                  className={
                    u.status === "blocked"
                      ? "w-9 h-9 rounded-lg border border-[rgba(34,197,94,.3)] bg-[rgba(34,197,94,.08)] flex items-center justify-center text-green2 hover:bg-[rgba(34,197,94,.18)] transition-colors disabled:opacity-40"
                      : "w-9 h-9 rounded-lg border border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.08)] flex items-center justify-center text-orange hover:bg-[rgba(249,115,22,.18)] transition-colors disabled:opacity-40"
                  }
                >
                  {u.status === "blocked" ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(u)}
                  disabled={busyId === u.id || u.id === currentUser?.id}
                  title="Supprimer le compte"
                  className="w-9 h-9 rounded-lg border border-[rgba(224,85,85,.3)] bg-[rgba(224,85,85,.08)] flex items-center justify-center text-red hover:bg-[rgba(224,85,85,.18)] transition-colors disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={handlePageChange} />

      <AnimatePresence>
        {detail && (
          <UserDetailModal
            user={detail}
            isSelf={detail.id === currentUser?.id}
            onClose={() => setDetail(null)}
            onSaved={(updated) => {
              setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              setDetail(updated);
            }}
            onViewListings={() => {
              onViewListings(detail.name);
              setDetail(null);
            }}
            onToggleBlock={() => toggleBlock(detail)}
            onDelete={() => handleDelete(detail)}
            busy={busyId === detail.id}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function UserDetailModal({
  user,
  isSelf,
  onClose,
  onSaved,
  onViewListings,
  onToggleBlock,
  onDelete,
  busy,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onClose: () => void;
  onSaved: (u: AdminUserRow) => void;
  onViewListings: () => void;
  onToggleBlock: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() || null })
      .eq("id", user.id)
      .select()
      .maybeSingle();
    setSaving(false);
    if (error || !data) {
      showToast("❌ Impossible d'enregistrer les modifications.", "error");
      return;
    }
    showToast("✅ Profil mis à jour.", "success");
    onSaved({ ...user, name: data.name, phone: data.phone });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-border shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar || DEFAULT_AVATAR} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-text">{user.name}</div>
              <div className="text-[13px] text-muted">{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          <Tag color={user.role === "owner" ? "gold" : user.role === "admin" ? "blue" : "neutral"}>
            {user.role === "owner" ? "🔑 Propriétaire" : user.role === "admin" ? "🛡 Admin" : "👤 Visiteur"}
          </Tag>
          <Tag color={user.status === "blocked" ? "red" : "green"}>
            {user.status === "blocked" ? "🚫 Bloqué" : "✅ Actif"}
          </Tag>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-[13px]">
          <div className="bg-bg3 rounded-xl px-3.5 py-3">
            <div className="text-muted text-[11px] uppercase tracking-wide mb-1">Inscrit</div>
            <div className="text-text font-medium">{fmtRelativeDate(user.createdAt)}</div>
          </div>
          <div className="bg-bg3 rounded-xl px-3.5 py-3">
            <div className="text-muted text-[11px] uppercase tracking-wide mb-1">Dernière connexion</div>
            <div className="text-text font-medium">
              {user.lastSignInAt ? fmtRelativeDate(user.lastSignInAt) : "Jamais"}
            </div>
          </div>
          <div className="bg-bg3 rounded-xl px-3.5 py-3 col-span-2">
            <div className="text-muted text-[11px] uppercase tracking-wide mb-1">Annonces publiées</div>
            <div className="text-text font-medium">{user.listingsCount}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom complet</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-5">
          <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
          <input
            className="form-control"
            placeholder="+237 6XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="gold" size="sm" loading={saving} onClick={save}>
            Enregistrer
          </Button>
          <Button variant="outline" size="sm" onClick={onViewListings}>
            <Building2 size={14} /> Voir ses annonces
          </Button>
          {!isSelf && (
            <>
              <Button
                variant={user.status === "blocked" ? "green" : "outline"}
                size="sm"
                loading={busy}
                onClick={onToggleBlock}
                className={user.status === "blocked" ? "" : "!border-orange !text-orange hover:!bg-orange hover:!text-[#07111e]"}
              >
                {user.status === "blocked" ? (
                  <>
                    <CheckCircle2 size={14} /> Débloquer
                  </>
                ) : (
                  <>
                    <Ban size={14} /> Bloquer
                  </>
                )}
              </Button>
              <Button variant="danger" size="sm" loading={busy} onClick={onDelete}>
                <Trash2 size={14} /> Supprimer
              </Button>
            </>
          )}
        </div>
        {isSelf && (
          <p className="text-[12px] text-muted mt-3">
            Vous ne pouvez pas bloquer ou supprimer votre propre compte administrateur.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
