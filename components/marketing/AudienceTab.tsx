"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Link from "@/components/ui/LocalizedLink";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { kindLabel } from "@/lib/data";
import { fmtPrice } from "@/lib/format";
import { dateDuJour, downloadCsv, toCsv } from "@/lib/csv";
import { num, type KindRow, type TopListing } from "@/lib/marketing";
import { useAppStore } from "@/lib/store";
import { useTranslations } from "@/i18n/IntlProvider";
import { DataTable, PeriodSwitch, SectionTitle, StateMessage, td, th, useLoad } from "./ui";

type Period = "7d" | "30d" | "all";

/** Libellé court d'un type d'offre : vente, courte durée ou longue durée. */
function useOfferLabel() {
  const t = useTranslations("Marketing");
  return (transaction: string, listing: string | null) =>
    transaction === "vente" ? t("offerSale") : listing === "courte" ? t("offerShort") : t("offerLong");
}

export default function AudienceTab() {
  const t = useTranslations("Marketing");
  const tKind = useTranslations("PropertyKinds");
  const showToast = useAppStore((s) => s.showToast);
  const offer = useOfferLabel();
  const [period, setPeriod] = useState<Period>("30d");

  const top = useLoad(`top-${period}`, async () => {
    const { data, error } = await createClient().rpc("marketing_top_listings", { p_period: period, p_limit: 100 });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      price: num(r.price),
      views: num(r.views),
      favs: num(r.favs),
      period_views: num(r.period_views),
    })) as TopListing[];
  });

  const kinds = useLoad("kinds", async () => {
    const { data, error } = await createClient().rpc("marketing_by_kind");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      listings: num(r.listings),
      views: num(r.views),
      favs: num(r.favs),
      avg_price: r.avg_price == null ? null : num(r.avg_price),
    })) as KindRow[];
  });

  function exportCsv() {
    const rows = top.data ?? [];
    if (rows.length === 0) {
      showToast(t("exportEmpty"), "info");
      return;
    }
    const content = toCsv(
      [t("colRank"), t("colListing"), t("colCity"), t("colKind"), t("colOffer"), t("colViews"), t("colFavs"), t("colPrice")],
      rows.map((r, i) => [
        i + 1, r.title.trim(), r.city, kindLabel(r.kind, tKind), offer(r.transaction_type, r.listing_type),
        r.period_views, r.favs, r.price,
      ])
    );
    downloadCsv(`237logement-marketing-annonces-${period}-${dateDuJour()}.csv`, content);
  }

  return (
    <>
      <SectionTitle
        title={t("topTitle")}
        sub={t("topSub")}
        right={
          <div className="flex gap-2 items-center flex-wrap">
            <PeriodSwitch
              value={period}
              onChange={setPeriod}
              options={[
                { value: "7d", label: t("days7") },
                { value: "30d", label: t("days30") },
                { value: "all", label: t("periodAll") },
              ]}
            />
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              <Download size={14} /> {t("exportCsv")}
            </Button>
          </div>
        }
      />
      <StateMessage loading={top.loading} failed={top.failed} />
      {top.data && (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>#</th>
              <th className={th}>{t("colListing")}</th>
              <th className={th}>{t("colCity")}</th>
              <th className={th}>{t("colOffer")}</th>
              <th className={th}>{t("colViews")}</th>
              <th className={th}>{t("colFavs")}</th>
              <th className={th}>{t("colPrice")}</th>
            </tr>
          </thead>
          <tbody>
            {top.data.slice(0, 20).map((r, i) => (
              <tr key={r.id}>
                <td className={td}>{i + 1}</td>
                <td className={td}>
                  <Link href={`/annonce/${r.id}`} className="text-gold hover:underline">
                    {r.title.trim()}
                  </Link>
                  <div className="text-[11px] text-dim">{kindLabel(r.kind, tKind)}</div>
                </td>
                <td className={td}>{r.city}</td>
                <td className={td}>{offer(r.transaction_type, r.listing_type)}</td>
                <td className={`${td} font-semibold`}>{r.period_views.toLocaleString("fr-FR")}</td>
                <td className={td}>{r.favs}</td>
                <td className={`${td} whitespace-nowrap`}>{fmtPrice(r.price)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
      {top.data && top.data.length > 20 && <p className="text-[11px] text-dim mt-2">{t("topMore", { n: top.data.length })}</p>}

      <SectionTitle title={t("kindsTitle")} sub={t("kindsSub")} />
      <StateMessage loading={kinds.loading} failed={kinds.failed} />
      {kinds.data && (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>{t("colKind")}</th>
              <th className={th}>{t("colOffer")}</th>
              <th className={th}>{t("colListings")}</th>
              <th className={th}>{t("colViews")}</th>
              <th className={th}>{t("colViewsPerListing")}</th>
              <th className={th}>{t("colFavs")}</th>
              <th className={th}>{t("colAvgPrice")}</th>
            </tr>
          </thead>
          <tbody>
            {kinds.data.map((k) => (
              <tr key={`${k.kind}-${k.transaction_type}-${k.listing_type}`}>
                <td className={td}>{kindLabel(k.kind, tKind)}</td>
                <td className={td}>{offer(k.transaction_type, k.listing_type)}</td>
                <td className={td}>{k.listings}</td>
                <td className={td}>{k.views.toLocaleString("fr-FR")}</td>
                <td className={`${td} font-semibold`}>{k.listings ? Math.round(k.views / k.listings) : 0}</td>
                <td className={td}>{k.favs}</td>
                <td className={`${td} whitespace-nowrap`}>{k.avg_price == null ? "—" : fmtPrice(k.avg_price)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
