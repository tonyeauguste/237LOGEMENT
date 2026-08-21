"use client";

// ═══════════════════════════════════════════════
// Panneau admin — Vue d'ensemble
// Compteurs globaux (annonces, propriétaires, bloqués) + dernières
// annonces et derniers comptes inscrits sur toute la plateforme.
// ═══════════════════════════════════════════════

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users2, ShieldOff, UserX, ArrowRight } from "lucide-react";
import Tag from "@/components/ui/Tag";
import { createClient } from "@/lib/supabase/client";
import { fmtPrice } from "@/lib/format";
import { fmtRelativeDate } from "@/lib/format";

interface RecentProperty {
  id: number;
  title: string;
  city: string;
  owner_name: string;
  status: string;
  price: number;
  created_at: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminOverview({
  onNavigate,
}: {
  onNavigate: (section: "admin-annonces" | "admin-users") => void;
}) {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ properties: 0, owners: 0, blockedProperties: 0, blockedAccounts: 0 });
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "owner"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "blocked"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "blocked"),
      supabase
        .from("properties")
        .select("id, title, city, owner_name, status, price, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      // admin_list_users seul moyen d'obtenir l'email (stocké dans auth.users,
      // pas dans profiles) — voir la migration add_admin_system.
      supabase.rpc("admin_list_users", { p_limit: 5, p_offset: 0 }),
    ]).then(([propsCount, ownersCount, blockedProps, blockedAccounts, recentProps, recentUsersRes]) => {
      if (cancelled) return;
      setCounts({
        properties: propsCount.count ?? 0,
        owners: ownersCount.count ?? 0,
        blockedProperties: blockedProps.count ?? 0,
        blockedAccounts: blockedAccounts.count ?? 0,
      });
      setRecentProperties(recentProps.data ?? []);
      setRecentUsers(
        (recentUsersRes.data ?? []).map((u) => ({
          id: u.id,
          name: u.name || "Utilisateur",
          email: u.email,
          role: u.role,
          created_at: u.created_at,
        }))
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      icon: <Building2 size={20} />,
      val: counts.properties,
      label: "Annonces sur le site",
      color: "text-gold",
      onClick: () => onNavigate("admin-annonces"),
    },
    {
      icon: <Users2 size={20} />,
      val: counts.owners,
      label: "Propriétaires inscrits",
      color: "text-blue",
      onClick: () => onNavigate("admin-users"),
    },
    {
      icon: <ShieldOff size={20} />,
      val: counts.blockedProperties,
      label: "Annonces bloquées",
      color: "text-orange",
      onClick: () => onNavigate("admin-annonces"),
    },
    {
      icon: <UserX size={20} />,
      val: counts.blockedAccounts,
      label: "Comptes bloqués",
      color: "text-red",
      onClick: () => onNavigate("admin-users"),
    },
  ];

  return (
    <>
      <div className="mb-[30px]">
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">Administration</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">Vue d&apos;ensemble</h2>
        <p className="text-sm text-muted mt-1.5">Activité globale de la plateforme, tous propriétaires confondus.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="text-left bg-card border border-border rounded-2xl px-5 py-[18px] hover:border-gold transition-colors cursor-pointer"
          >
            <div className={`mb-2 ${c.color}`}>{c.icon}</div>
            <div className={`font-display text-[28px] font-bold mb-1 ${c.color}`}>
              {loading ? "…" : c.val}
            </div>
            <div className="text-[13px] text-muted">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[15px] font-semibold text-text">Annonces les plus récentes</h4>
            <button
              onClick={() => onNavigate("admin-annonces")}
              className="text-[12px] text-gold font-semibold flex items-center gap-1 hover:underline"
            >
              Tout voir <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted py-4">Chargement…</p>
          ) : recentProperties.length === 0 ? (
            <p className="text-sm text-muted py-4">Aucune annonce sur la plateforme pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentProperties.map((p) => (
                <Link
                  key={p.id}
                  href={`/annonce/${p.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 bg-bg3 rounded-xl hover:bg-card2 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-text truncate">{p.title}</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {p.owner_name} · {p.city} · {fmtRelativeDate(p.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "blocked" && <Tag color="orange">Bloqué</Tag>}
                    <span className="text-[13px] font-bold text-gold">{fmtPrice(p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[15px] font-semibold text-text">Derniers comptes inscrits</h4>
            <button
              onClick={() => onNavigate("admin-users")}
              className="text-[12px] text-gold font-semibold flex items-center gap-1 hover:underline"
            >
              Tout voir <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted py-4">Chargement…</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-muted py-4">Aucun compte inscrit pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-3.5 py-3 bg-bg3 rounded-xl">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-text truncate">{u.name}</div>
                    <div className="text-[11px] text-muted mt-0.5 truncate">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag color={u.role === "owner" ? "gold" : "neutral"}>
                      {u.role === "owner" ? "Propriétaire" : u.role === "admin" ? "Admin" : "Visiteur"}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
