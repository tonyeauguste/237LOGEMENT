"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { createClient } from "@/lib/supabase/client";
import { fmtPrice } from "@/lib/format";
import { dateDuJour, downloadCsv, toCsv } from "@/lib/csv";
import { num, type CityRow, type OwnerRow } from "@/lib/marketing";
import { useTranslations } from "@/i18n/IntlProvider";
import { DataTable, SectionTitle, StateMessage, td, th, useLoad } from "./ui";

export default function CitiesTab() {
  const t = useTranslations("Marketing");

  const cities = useLoad("cities", async () => {
    const { data, error } = await createClient().rpc("marketing_by_city");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      listings: num(r.listings),
      active_listings: num(r.active_listings),
      views: num(r.views),
      favs: num(r.favs),
      owners: num(r.owners),
      avg_price: r.avg_price == null ? null : num(r.avg_price),
    })) as CityRow[];
  });

  const owners = useLoad("owners", async () => {
    const { data, error } = await createClient().rpc("marketing_owners", { p_limit: 20 });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      listings: num(r.listings),
      views: num(r.views),
      favs: num(r.favs),
      rating: r.rating == null ? null : num(r.rating),
      rating_count: r.rating_count == null ? null : num(r.rating_count),
    })) as OwnerRow[];
  });

  const rows = cities.data ?? [];
  const totalViews = rows.reduce((s, c) => s + c.views, 0);
  const totalListings = rows.reduce((s, c) => s + c.listings, 0);
  const avgViewsPerListing = totalListings ? totalViews / totalListings : 0;
  const avgListingsPerCity = rows.length ? totalListings / rows.length : 0;

  // Opportunité de recrutement : une ville où chaque annonce attire nettement
  // plus de vues que la moyenne du site (la demande existe) mais où l'offre
  // est inférieure à la moyenne des villes (il manque des annonces).
  const isOpportunity = (c: CityRow) =>
    c.listings > 0 && c.views / c.listings >= avgViewsPerListing * 1.2 && c.listings <= avgListingsPerCity;

  function exportCsv() {
    const content = toCsv(
      [t("colCity"), t("colListings"), t("colActive"), t("colViews"), t("colViewsPerListing"), t("colFavs"), t("colOwners"), t("colAvgPrice")],
      rows.map((c) => [
        c.city, c.listings, c.active_listings, c.views, c.listings ? Math.round(c.views / c.listings) : 0,
        c.favs, c.owners, c.avg_price ?? "",
      ])
    );
    downloadCsv(`237logement-marketing-villes-${dateDuJour()}.csv`, content);
  }

  return (
    <>
      <SectionTitle
        title={t("citiesTitle")}
        sub={t("citiesSub")}
        right={
          <Button variant="ghost" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download size={14} /> {t("exportCsv")}
          </Button>
        }
      />
      <StateMessage loading={cities.loading} failed={cities.failed} />
      {cities.data && (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>{t("colCity")}</th>
              <th className={th}>{t("colListings")}</th>
              <th className={th}>{t("colViews")}</th>
              <th className={th}>{t("colViewsPerListing")}</th>
              <th className={th}>{t("colFavs")}</th>
              <th className={th}>{t("colOwners")}</th>
              <th className={th}>{t("colAvgPrice")}</th>
              <th className={th}>{t("colSignal")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.city}>
                <td className={`${td} font-semibold`}>{c.city}</td>
                <td className={td}>
                  {c.listings}
                  <span className="text-[11px] text-dim"> ({t("activeShort", { n: c.active_listings })})</span>
                </td>
                <td className={td}>{c.views.toLocaleString("fr-FR")}</td>
                <td className={`${td} font-semibold`}>{c.listings ? Math.round(c.views / c.listings) : 0}</td>
                <td className={td}>{c.favs}</td>
                <td className={td}>{c.owners}</td>
                <td className={`${td} whitespace-nowrap`}>{c.avg_price == null ? "—" : fmtPrice(c.avg_price)}</td>
                <td className={td}>{isOpportunity(c) ? <Tag color="gold">{t("signalRecruit")}</Tag> : null}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <SectionTitle title={t("ownersTitle")} sub={t("ownersSub")} />
      <StateMessage loading={owners.loading} failed={owners.failed} />
      {owners.data && (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>{t("colOwner")}</th>
              <th className={th}>{t("colListings")}</th>
              <th className={th}>{t("colViews")}</th>
              <th className={th}>{t("colFavs")}</th>
              <th className={th}>{t("colRating")}</th>
              <th className={th}>{t("colJoined")}</th>
            </tr>
          </thead>
          <tbody>
            {owners.data.map((o) => (
              <tr key={o.owner_id}>
                <td className={`${td} font-semibold`}>{o.owner_name}</td>
                <td className={td}>{o.listings}</td>
                <td className={td}>{o.views.toLocaleString("fr-FR")}</td>
                <td className={td}>{o.favs}</td>
                <td className={td}>
                  {o.rating_count && o.rating ? `★ ${o.rating.toFixed(1)} (${o.rating_count})` : <span className="text-dim">{t("ratingNone")}</span>}
                </td>
                <td className={`${td} whitespace-nowrap`}>
                  {o.joined_at ? new Date(o.joined_at).toLocaleDateString("fr-FR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
