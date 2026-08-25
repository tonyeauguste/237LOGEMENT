"use client";

// ═══════════════════════════════════════════════
// Panneau admin — Gestion de TOUTES les annonces
// (tous propriétaires confondus). Recherche, filtres, pagination
// 20/page, modifier (réutilise /publier), bloquer/débloquer, supprimer.
// Le blocage masque l'annonce du site public (policy RLS "Public can
// read active properties") sans la supprimer — elle reste visible ici
// avec un badge "Bloqué".
// ═══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Pencil, Trash2, Ban, CheckCircle2 } from "lucide-react";
import Tag from "@/components/ui/Tag";
import CityInput from "@/components/ui/CityInput";
import Pagination from "@/components/ui/Pagination";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { rowToProperty } from "@/lib/supabase/mappers";
import { fmtPrice } from "@/lib/format";
import { listingTypeMeta } from "@/lib/data";
import type { ListingStatus, Property } from "@/lib/types";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: ListingStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Bloquée" },
  { value: "pending", label: "En attente" },
];

export default function AdminAnnonces({ initialSearch = "" }: { initialSearch?: string }) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);

  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [page, setPage] = useState(1);

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Les changements de filtre remettent la page à 1 (sinon on peut se
  // retrouver sur une page vide, ex: page 3 alors que 5 résultats) et
  // relancent immédiatement l'indicateur de chargement. Fait directement
  // dans les handlers (pas dans un effet) : la règle react-hooks/set-state
  // -in-effect interdit d'appeler setState de façon synchrone dans le
  // corps d'un effet — seul un .then() (continuation asynchrone) le peut.
  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
    setLoading(true);
  }
  function handleCityChange(v: string) {
    setCity(v);
    setPage(1);
    setLoading(true);
  }
  function handleStatusChange(v: ListingStatus | "") {
    setStatus(v);
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

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from("properties").select("*", { count: "exact" }).order("created_at", { ascending: false });

    // Recherche sur titre, ville ou nom du propriétaire (dénormalisé sur
    // `properties.owner_name`, pas besoin de jointure). Les virgules sont
    // retirées pour ne pas casser la syntaxe du filtre .or().
    const q = search.trim().replace(/,/g, " ");
    if (q) {
      query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,owner_name.ilike.%${q}%`);
    }
    if (city) query = query.eq("city", city);
    if (status) query = query.eq("status", status);

    query.range(from, to).then(({ data, count, error }) => {
      if (cancelled) return;
      if (error) {
        showToast("❌ Impossible de charger les annonces.", "error");
        setLoading(false);
        return;
      }
      setProperties((data ?? []).map(rowToProperty));
      setTotal(count ?? 0);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city, status, page]);

  async function toggleBlock(p: Property) {
    const nextStatus: ListingStatus = p.status === "blocked" ? "active" : "blocked";
    const label = nextStatus === "blocked" ? "bloquer" : "débloquer";
    if (!window.confirm(`Voulez-vous vraiment ${label} l'annonce « ${p.title} » ?`)) return;

    setBusyId(p.id);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("properties")
      .update({ status: nextStatus })
      .eq("id", p.id)
      .select();
    setBusyId(null);

    if (error || !data || data.length === 0) {
      showToast("❌ Action impossible. Réessayez.", "error");
      return;
    }
    setProperties((prev) => prev.map((l) => (l.id === p.id ? { ...l, status: nextStatus } : l)));
    showToast(
      nextStatus === "blocked" ? "🚫 Annonce bloquée — masquée du site public." : "✅ Annonce débloquée.",
      "success"
    );
  }

  async function handleDelete(p: Property) {
    if (!window.confirm(`Supprimer définitivement l'annonce « ${p.title} » ? Cette action est irréversible.`)) {
      return;
    }
    setBusyId(p.id);
    const supabase = createClient();
    const { data, error } = await supabase.from("properties").delete().eq("id", p.id).select();
    setBusyId(null);
    if (error || !data || data.length === 0) {
      showToast("❌ Impossible de supprimer l'annonce. Réessayez.", "error");
      return;
    }
    setProperties((prev) => prev.filter((l) => l.id !== p.id));
    setTotal((t) => Math.max(0, t - 1));
    showToast("🗑️ Annonce supprimée définitivement.", "success");
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="mb-6">
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">Administration</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">Toutes les annonces</h2>
        <p className="text-sm text-muted mt-1.5">
          {loading ? "Chargement…" : `${total} annonce${total > 1 ? "s" : ""} sur la plateforme.`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="form-control !pl-10"
            placeholder="Rechercher par titre, ville ou propriétaire…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {/* Saisie libre : les propriétaires peuvent publier dans une ville
            absente de la liste, l'admin doit donc pouvoir la filtrer aussi. */}
        <CityInput
          placeholder="Toutes les villes"
          className="form-control sm:w-[200px]"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
        />
        <select
          className="form-control sm:w-[180px]"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as ListingStatus | "")}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted text-center py-16">Chargement des annonces…</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 px-5">
          <div className="text-[40px] mb-3">🔍</div>
          <h3 className="text-base font-semibold text-text mb-1.5">Aucune annonce ne correspond</h3>
          <p className="text-sm text-muted">Essayez d&apos;élargir votre recherche ou vos filtres.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="relative w-full sm:w-[120px] h-[120px] sm:h-auto shrink-0">
                <Image src={p.imgs[0]} alt={p.title} fill sizes="120px" className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 mb-1.5 flex-wrap">
                    <Tag color={listingTypeMeta(p.type).tagColor}>{listingTypeMeta(p.type).badgeLabel}</Tag>
                    {p.status === "blocked" && <Tag color="orange">🚫 Bloqué</Tag>}
                    {p.status === "pending" && <Tag color="blue">⏳ En attente</Tag>}
                  </div>
                  <div className="font-semibold text-base text-text mb-1 truncate">{p.title}</div>
                  <div className="text-[13px] text-muted">
                    {p.quartier}, {p.city} · {p.owner.name}
                  </div>
                </div>
                <div className="font-display font-bold text-lg text-gold shrink-0">{fmtPrice(p.price)}</div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => router.push(`/publier?edit=${p.id}`)}
                    title="Modifier l'annonce"
                    className="w-9 h-9 rounded-lg border border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.08)] flex items-center justify-center text-blue hover:bg-[rgba(59,130,246,.18)] transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggleBlock(p)}
                    disabled={busyId === p.id}
                    title={p.status === "blocked" ? "Débloquer l'annonce" : "Bloquer l'annonce"}
                    className={
                      p.status === "blocked"
                        ? "w-9 h-9 rounded-lg border border-[rgba(34,197,94,.3)] bg-[rgba(34,197,94,.08)] flex items-center justify-center text-green2 hover:bg-[rgba(34,197,94,.18)] transition-colors disabled:opacity-50"
                        : "w-9 h-9 rounded-lg border border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.08)] flex items-center justify-center text-orange hover:bg-[rgba(249,115,22,.18)] transition-colors disabled:opacity-50"
                    }
                  >
                    {p.status === "blocked" ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    title="Supprimer l'annonce"
                    className="w-9 h-9 rounded-lg border border-[rgba(224,85,85,.3)] bg-[rgba(224,85,85,.08)] flex items-center justify-center text-red hover:bg-[rgba(224,85,85,.18)] transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={handlePageChange} />
    </>
  );
}
