"use client";

// ═══════════════════════════════════════════════
// Panneau admin — Statistiques
// Audience de TOUTES les annonces du site, quel que soit leur auteur :
// totaux globaux + classement par nombre de vues, sur la période choisie.
//
// Les données viennent de deux fonctions SQL (admin_site_stats et
// admin_property_stats) plutôt que d'une requête directe : le classement
// par période agrège property_views, table que le client ne peut pas lire
// (RLS sans policy, accès réservé aux fonctions). Le contrôle du rôle est
// fait là aussi, côté base — voir la migration admin_statistics_functions.
// ═══════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Eye, Heart, Building2, Users2 } from "lucide-react";
import Tag from "@/components/ui/Tag";
import Pagination from "@/components/ui/Pagination";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { kindLabel } from "@/lib/data";
import { useTranslations } from "@/i18n/IntlProvider";

const PAGE_SIZE = 20;

type Period = "all" | "30d" | "7d";

interface StatRow {
  id: number;
  title: string;
  city: string;
  kind: string;
  status: string;
  owner_name: string;
  views: number;
  favs: number;
  period_views: number;
  total_count: number;
}

interface SiteTotals {
  total_views: number;
  total_favs: number;
  total_properties: number;
  active_properties: number;
  total_owners: number;
}

export default function AdminStats() {
  const t = useTranslations("AdminStats");
  const tKind = useTranslations("PropertyKinds");
  const showToast = useAppStore((s) => s.showToast);

  const [period, setPeriod] = useState<Period>("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<StatRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState<SiteTotals | null>(null);
  const [loading, setLoading] = useState(true);

  // Changer de période ou de page relance l'indicateur de chargement ici,
  // pas dans l'effet : la règle react-hooks/set-state-in-effect interdit un
  // setState synchrone dans le corps d'un effet (même convention que les
  // autres panneaux admin).
  function handlePeriodChange(p: Period) {
    setPeriod(p);
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

    Promise.all([
      supabase.rpc("admin_site_stats"),
      supabase.rpc("admin_property_stats", {
        p_period: period,
        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      }),
    ]).then(([totalsRes, rowsRes]) => {
      if (cancelled) return;
      if (totalsRes.error || rowsRes.error) {
        showToast(t("toastLoadError"), "error");
        setLoading(false);
        return;
      }
      setTotals((totalsRes.data ?? [])[0] ?? null);
      const data = (rowsRes.data ?? []) as StatRow[];
      setRows(data);
      setTotal(data.length > 0 ? Number(data[0].total_count) : 0);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, page]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstRank = (page - 1) * PAGE_SIZE + 1;

  const cards = totals
    ? [
        { icon: <Eye size={20} />, val: totals.total_views, label: t("cardViews"), color: "text-gold" },
        { icon: <Heart size={20} />, val: totals.total_favs, label: t("cardFavs"), color: "text-red" },
        {
          icon: <Building2 size={20} />,
          val: totals.total_properties,
          label: t("cardListings"),
          color: "text-blue",
          hint: t("cardListingsActive", {
            count: totals.active_properties,
            plural: totals.active_properties > 1 ? "s" : "",
          }),
        },
        { icon: <Users2 size={20} />, val: totals.total_owners, label: t("cardOwners"), color: "text-green2" },
      ]
    : [];

  const PERIODS: { key: Period; label: string }[] = [
    { key: "all", label: t("periodAll") },
    { key: "30d", label: t("periodMonth") },
    { key: "7d", label: t("periodWeek") },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{t("administration")}</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">{t("title")}</h2>
        <p className="text-sm text-muted mt-1.5">{t("subtitle")}</p>
      </div>

      {/* Compteurs globaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`${c.color} mb-2`}>{c.icon}</div>
            <div className="font-display text-[26px] font-bold text-text leading-none">
              {c.val.toLocaleString()}
            </div>
            <div className="text-[12px] text-muted mt-1.5">{c.label}</div>
            {c.hint && <div className="text-[11px] text-dim mt-0.5">{c.hint}</div>}
          </div>
        ))}
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h3 className="text-[15px] font-semibold text-text">{t("rankingTitle")}</h3>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePeriodChange(p.key)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${
                period === p.key
                  ? "bg-gold text-[#07111e]"
                  : "bg-card border border-border text-muted hover:border-gold hover:text-gold"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {period !== "all" && (
        <p className="text-[11.5px] text-dim leading-relaxed mb-4">{t("periodNote")}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted text-center py-16">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 px-5">
          <div className="text-[40px] mb-3">📊</div>
          <h3 className="text-base font-semibold text-text mb-1.5">{t("emptyTitle")}</h3>
          <p className="text-sm text-muted">{t("emptyText")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => {
            const rank = firstRank + i;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3"
              >
                {/* Les trois premières places en doré : le classement doit se
                    lire d'un coup d'œil sans avoir à comparer les chiffres. */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold ${
                    rank <= 3 ? "bg-gold text-[#07111e]" : "bg-bg3 text-muted"
                  }`}
                >
                  {rank}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13.5px] font-semibold text-text truncate">{r.title}</span>
                    {r.status === "blocked" && <Tag color="orange">{t("statusBlocked")}</Tag>}
                    {r.status === "pending" && <Tag color="blue">{t("statusPending")}</Tag>}
                  </div>
                  <div className="text-[11.5px] text-muted mt-0.5 truncate">
                    {kindLabel(r.kind, tKind)} · {r.city} · {r.owner_name}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="font-display text-[19px] font-bold text-gold leading-none">
                    {Number(r.period_views).toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-dim mt-1">{t("viewsLabel")}</div>
                </div>

                <div className="shrink-0 text-right w-[52px]">
                  <div className="text-[15px] font-semibold text-text leading-none">{r.favs}</div>
                  <div className="text-[10.5px] text-dim mt-1">{t("favsLabel")}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={handlePageChange} />
    </>
  );
}
