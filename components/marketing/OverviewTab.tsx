"use client";

import { useState } from "react";
import { Eye, UserPlus, Building2, Users, Heart, Star, Megaphone, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { evolution, num, type DayPoint, type MarketingOverview } from "@/lib/marketing";
import { useTranslations } from "@/i18n/IntlProvider";
import { BarChart, PeriodSwitch, SectionTitle, StateMessage, StatCard, Trend, useLoad } from "./ui";

const fmt = (n: number) => n.toLocaleString("fr-FR");
const shortDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export default function OverviewTab() {
  const t = useTranslations("Marketing");
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const overview = useLoad("overview", async () => {
    const { data, error } = await createClient().rpc("marketing_overview");
    if (error) throw error;
    return data as unknown as MarketingOverview;
  });

  const series = useLoad(`series-${days}`, async () => {
    const { data, error } = await createClient().rpc("marketing_timeseries", { p_days: days });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      day: r.day,
      new_accounts: num(r.new_accounts),
      new_listings: num(r.new_listings),
      unique_views: num(r.unique_views),
      campaign_visits: num(r.campaign_visits),
    })) as DayPoint[];
  });

  const o = overview.data;
  const vsPrev = t("vsPrevious");
  const pctOf = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <StateMessage loading={overview.loading} failed={overview.failed} />
      {o && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              icon={<Eye size={18} />}
              label={t("kpiUniqueViews")}
              value={fmt(num(o.unique_views_30d))}
              trend={<Trend value={evolution(num(o.unique_views_30d), num(o.unique_views_prev_30d))} suffix={vsPrev} />}
              hint={t("kpiUniqueViewsHint")}
            />
            <StatCard
              icon={<Activity size={18} />}
              label={t("kpiVisitors")}
              value={fmt(num(o.visitors_30d))}
              hint={t("kpiVisitorsHint")}
            />
            <StatCard
              icon={<UserPlus size={18} />}
              label={t("kpiNewAccounts")}
              value={fmt(num(o.accounts_30d))}
              trend={<Trend value={evolution(num(o.accounts_30d), num(o.accounts_prev_30d))} suffix={vsPrev} />}
              sub={t("kpiTotalAccounts", { n: fmt(num(o.accounts_total)) })}
            />
            <StatCard
              icon={<Building2 size={18} />}
              label={t("kpiNewListings")}
              value={fmt(num(o.listings_30d))}
              trend={<Trend value={evolution(num(o.listings_30d), num(o.listings_prev_30d))} suffix={vsPrev} />}
              sub={t("kpiActiveListings", { active: fmt(num(o.listings_active)), total: fmt(num(o.listings_total)) })}
            />
            <StatCard icon={<Users size={18} />} label={t("kpiOwners")} value={fmt(num(o.owners_total))} />
            <StatCard icon={<Heart size={18} />} label={t("kpiFavs")} value={fmt(num(o.favs_total))} />
            <StatCard
              icon={<Star size={18} />}
              label={t("kpiRating")}
              value={o.avg_rating ? num(o.avg_rating).toFixed(1) : "—"}
              sub={t("kpiRatingCount", { n: fmt(num(o.ratings_count)) })}
            />
            <StatCard
              icon={<Megaphone size={18} />}
              label={t("kpiCampaignVisits")}
              value={fmt(num(o.campaign_visits_30d))}
              hint={t("kpiCampaignVisitsHint")}
            />
          </div>

          <SectionTitle
            title={t("evolutionTitle")}
            sub={t("evolutionSub")}
            right={
              <PeriodSwitch
                value={days}
                onChange={setDays}
                options={[
                  { value: 7, label: t("days7") },
                  { value: 30, label: t("days30") },
                  { value: 90, label: t("days90") },
                ]}
              />
            }
          />
          <StateMessage loading={series.loading} failed={series.failed} />
          {series.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <BarChart
                title={t("chartUniqueViews")}
                points={series.data.map((d) => ({ label: shortDay(d.day), value: d.unique_views }))}
              />
              <BarChart
                title={t("chartNewAccounts")}
                color="#3D9970"
                points={series.data.map((d) => ({ label: shortDay(d.day), value: d.new_accounts }))}
              />
              <BarChart
                title={t("chartNewListings")}
                color="#63B3ED"
                points={series.data.map((d) => ({ label: shortDay(d.day), value: d.new_listings }))}
              />
              <BarChart
                title={t("chartCampaignVisits")}
                color="#F97316"
                points={series.data.map((d) => ({ label: shortDay(d.day), value: d.campaign_visits }))}
              />
            </div>
          )}

          <SectionTitle title={t("qualityTitle")} sub={t("qualitySub")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { n: num(o.listings_few_photos), label: t("qualityFewPhotos") },
              { n: num(o.listings_short_desc), label: t("qualityShortDesc") },
              { n: num(o.listings_unverified), label: t("qualityUnverified") },
            ].map((q) => (
              <div key={q.label} className="bg-card border border-border rounded-2xl p-5">
                <div className="font-display text-[26px] font-bold text-text leading-none">
                  {fmt(q.n)}
                  <span className="text-[13px] text-muted font-body font-normal ml-2">
                    {t("ofTotal", { pct: pctOf(q.n, num(o.listings_total)) })}
                  </span>
                </div>
                <div className="text-[12px] text-muted mt-2">{q.label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
