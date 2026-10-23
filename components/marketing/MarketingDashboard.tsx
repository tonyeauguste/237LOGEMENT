"use client";

// ═══════════════════════════════════════════════
// Espace marketing — réservé au DG Marketing (et à l'admin).
//
// Uniquement des indicateurs de marketing : audience, croissance, offre par
// ville, campagnes, outils de diffusion. Aucune action d'administration
// (modération, comptes, suppression) et aucune donnée personnelle (ni email
// ni téléphone). L'accès est vérifié côté base par can_view_marketing() dans
// chaque fonction marketing_* : masquer l'onglet côté interface n'est qu'un
// confort, pas la sécurité.
// ═══════════════════════════════════════════════

import { useState } from "react";
import { LayoutDashboard, Eye, MapPin, Megaphone, Wrench } from "lucide-react";
import { useTranslations } from "@/i18n/IntlProvider";
import OverviewTab from "./OverviewTab";
import AudienceTab from "./AudienceTab";
import CitiesTab from "./CitiesTab";
import CampaignsTab from "./CampaignsTab";
import ToolkitTab from "./ToolkitTab";

type Tab = "overview" | "audience" | "cities" | "campaigns" | "toolkit";

export default function MarketingDashboard() {
  const t = useTranslations("Marketing");
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("tabOverview"), icon: <LayoutDashboard size={14} /> },
    { key: "audience", label: t("tabAudience"), icon: <Eye size={14} /> },
    { key: "cities", label: t("tabCities"), icon: <MapPin size={14} /> },
    { key: "campaigns", label: t("tabCampaigns"), icon: <Megaphone size={14} /> },
    { key: "toolkit", label: t("tabToolkit"), icon: <Wrench size={14} /> },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{t("kicker")}</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">{t("title")}</h2>
        <p className="text-sm text-muted mt-1.5 max-w-[640px]">{t("subtitle")}</p>
      </div>

      <div className="flex gap-2 mb-7 flex-wrap">
        {tabs.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              tab === x.key
                ? "bg-gold text-[#07111e]"
                : "bg-card border border-border text-muted hover:border-gold hover:text-gold"
            }`}
          >
            {x.icon} {x.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "audience" && <AudienceTab />}
      {tab === "cities" && <CitiesTab />}
      {tab === "campaigns" && <CampaignsTab onOpenToolkit={() => setTab("toolkit")} />}
      {tab === "toolkit" && <ToolkitTab />}
    </>
  );
}
