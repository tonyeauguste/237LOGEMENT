"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { fmtPrice } from "@/lib/format";
import {
  CHANNELS,
  buildCampaignUrl,
  listingShareText,
  num,
  siteShareText,
  slugify,
  type TopListing,
} from "@/lib/marketing";
import { useAppStore } from "@/lib/store";
import { useLocale, useTranslations } from "@/i18n/IntlProvider";
import type { Locale } from "@/i18n/config";
import { SectionTitle, useLoad } from "./ui";

type Destination = "home" | "search" | "pricing" | "signup" | "listing";

const PATHS: Record<Exclude<Destination, "listing">, string> = {
  home: "",
  search: "/recherche",
  pricing: "/tarifs",
  signup: "/connexion?tab=register",
};

const inputCls = "form-control";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[12px] text-muted mb-1.5 font-medium">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-dim mt-1">{hint}</p>}
    </div>
  );
}

export default function ToolkitTab() {
  const t = useTranslations("Marketing");
  const currentLocale = useLocale();
  const showToast = useAppStore((s) => s.showToast);

  const [dest, setDest] = useState<Destination>("home");
  const [listingId, setListingId] = useState<number | null>(null);
  const [lang, setLang] = useState<Locale>(currentLocale);
  const [source, setSource] = useState("whatsapp");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("");

  // Les annonces proposées pour un lien ciblé : les plus vues, qui sont aussi
  // celles qu'il est le plus rentable de pousser.
  const listings = useLoad("toolkit-listings", async () => {
    const { data, error } = await createClient().rpc("marketing_top_listings", { p_period: "all", p_limit: 40 });
    if (error) throw error;
    return (data ?? []).map((r) => ({ ...r, price: num(r.price), views: num(r.views), favs: num(r.favs) })) as TopListing[];
  });

  const chosen = listings.data?.find((l) => l.id === listingId) ?? null;
  const path = dest === "listing" ? (chosen ? `/annonce/${chosen.id}` : null) : PATHS[dest];
  const ready = path !== null && slugify(source) !== "" && slugify(campaign) !== "";
  const url = ready ? buildCampaignUrl({ lang, path, source, medium, campaign }) : "";

  const priceSuffix = (l: TopListing) =>
    l.transaction_type === "vente" ? "" : l.listing_type === "courte" ? (lang === "en" ? "/night" : "/nuit") : lang === "en" ? "/month" : "/mois";

  const message = !ready
    ? ""
    : dest === "listing" && chosen
      ? listingShareText({ title: chosen.title, city: chosen.city, priceLabel: `${fmtPrice(chosen.price)}${priceSuffix(chosen)}` }, url)
      : siteShareText(lang, url);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t("copied"), "success");
    } catch {
      showToast(t("copyError"), "error");
    }
  }

  return (
    <>
      <SectionTitle title={t("builderTitle")} sub={t("builderSub")} />
      <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t("builderDestination")}>
          <select className={inputCls} value={dest} onChange={(e) => setDest(e.target.value as Destination)}>
            <option value="home">{t("destHome")}</option>
            <option value="search">{t("destSearch")}</option>
            <option value="pricing">{t("destPricing")}</option>
            <option value="signup">{t("destSignup")}</option>
            <option value="listing">{t("destListing")}</option>
          </select>
        </Field>

        <Field label={t("builderLanguage")}>
          <select className={inputCls} value={lang} onChange={(e) => setLang(e.target.value as Locale)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Field>

        {dest === "listing" && (
          <div className="md:col-span-2">
            <Field label={t("builderListing")}>
              <select
                className={inputCls}
                value={listingId ?? ""}
                onChange={(e) => setListingId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t("builderListingPlaceholder")}</option>
                {(listings.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title.trim()} — {l.city}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-[12px] text-muted mb-1.5 font-medium">{t("builderChannel")}</label>
          <div className="flex gap-2 flex-wrap">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSource(c.id);
                  setMedium(c.medium);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  slugify(source) === c.id
                    ? "bg-gold text-[#07111e]"
                    : "bg-card2 border border-border text-muted hover:border-gold hover:text-gold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Field label={t("builderSource")} hint={t("builderSourceHint")}>
          <input className={inputCls} value={source} onChange={(e) => setSource(e.target.value)} />
        </Field>
        <Field label={t("builderMedium")} hint={t("builderMediumHint")}>
          <input className={inputCls} value={medium} onChange={(e) => setMedium(e.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label={t("builderCampaign")} hint={t("builderCampaignHint")}>
            <input
              className={inputCls}
              value={campaign}
              placeholder={t("builderCampaignPlaceholder")}
              onChange={(e) => setCampaign(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-4 bg-card border border-border rounded-2xl p-5">
        <div className="text-[12px] text-muted font-medium mb-1.5">{t("resultLink")}</div>
        {ready ? (
          <>
            <input readOnly className={`${inputCls} text-[12px]`} value={url} onFocus={(e) => e.currentTarget.select()} />
            <div className="flex gap-2 flex-wrap mt-3">
              <Button variant="gold" size="sm" onClick={() => copy(url)}>
                <Copy size={14} /> {t("copyLink")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => copy(message)}>
                <Copy size={14} /> {t("copyMessage")}
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] px-4 py-[7px] text-[13px] rounded-lg bg-[#25D366] text-[#07120A] hover:bg-[#1FBD5A] transition-colors"
              >
                <ExternalLink size={14} /> {t("openWhatsapp")}
              </a>
            </div>
            <div className="text-[12px] text-muted font-medium mt-4 mb-1.5">{t("resultMessage")}</div>
            <pre className="whitespace-pre-wrap break-words text-[13px] text-text bg-card2 border border-border rounded-xl px-4 py-3 font-body">
              {message}
            </pre>
          </>
        ) : (
          <p className="text-[13px] text-dim">{t("resultWaiting")}</p>
        )}
      </div>

      <SectionTitle title={t("playbookTitle")} sub={t("playbookSub")} />
      <ul className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 text-[13px] text-muted leading-relaxed">
        {(["playbook1", "playbook2", "playbook3", "playbook4", "playbook5"] as const).map((k) => (
          <li key={k} className="flex gap-2.5">
            <span className="text-gold shrink-0">✓</span>
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
