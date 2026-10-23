"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { dateDuJour, downloadCsv, toCsv } from "@/lib/csv";
import { num, type CampaignRow } from "@/lib/marketing";
import { useTranslations } from "@/i18n/IntlProvider";
import { DataTable, PeriodSwitch, SectionTitle, StateMessage, td, th, useLoad } from "./ui";

export default function CampaignsTab({ onOpenToolkit }: { onOpenToolkit: () => void }) {
  const t = useTranslations("Marketing");
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const campaigns = useLoad(`campaigns-${days}`, async () => {
    const { data, error } = await createClient().rpc("marketing_campaigns", { p_days: days });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      ...r,
      visits: num(r.visits),
      unique_visitors: num(r.unique_visitors),
      signups: num(r.signups),
    })) as CampaignRow[];
  });

  const rows = campaigns.data ?? [];
  const conversion = (r: CampaignRow) =>
    r.unique_visitors ? `${((r.signups / r.unique_visitors) * 100).toFixed(1)}%` : "—";

  function exportCsv() {
    const content = toCsv(
      [t("colSource"), t("colMedium"), t("colCampaign"), t("colVisits"), t("colUniqueVisitors"), t("colSignups"), t("colConversion")],
      rows.map((r) => [r.source, r.medium, r.campaign, r.visits, r.unique_visitors, r.signups, conversion(r)])
    );
    downloadCsv(`237logement-marketing-campagnes-${days}j-${dateDuJour()}.csv`, content);
  }

  return (
    <>
      <SectionTitle
        title={t("campaignsTitle")}
        sub={t("campaignsSub")}
        right={
          <div className="flex gap-2 items-center flex-wrap">
            <PeriodSwitch
              value={days}
              onChange={setDays}
              options={[
                { value: 7, label: t("days7") },
                { value: 30, label: t("days30") },
                { value: 90, label: t("days90") },
              ]}
            />
            <Button variant="ghost" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              <Download size={14} /> {t("exportCsv")}
            </Button>
          </div>
        }
      />
      <StateMessage loading={campaigns.loading} failed={campaigns.failed} />
      {campaigns.data && rows.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div className="text-[36px] mb-2">📣</div>
          <h4 className="text-[15px] font-semibold text-text mb-1.5">{t("campaignsEmptyTitle")}</h4>
          <p className="text-[13px] text-muted max-w-[480px] mx-auto mb-4">{t("campaignsEmptyText")}</p>
          <Button variant="gold" size="sm" onClick={onOpenToolkit}>
            {t("campaignsEmptyButton")}
          </Button>
        </div>
      )}
      {rows.length > 0 && (
        <DataTable>
          <thead>
            <tr>
              <th className={th}>{t("colSource")}</th>
              <th className={th}>{t("colMedium")}</th>
              <th className={th}>{t("colCampaign")}</th>
              <th className={th}>{t("colVisits")}</th>
              <th className={th}>{t("colUniqueVisitors")}</th>
              <th className={th}>{t("colSignups")}</th>
              <th className={th}>{t("colConversion")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.source}|${r.medium}|${r.campaign}`}>
                <td className={`${td} font-semibold`}>{r.source}</td>
                <td className={td}>{r.medium || "—"}</td>
                <td className={td}>{r.campaign || "—"}</td>
                <td className={td}>{r.visits}</td>
                <td className={td}>{r.unique_visitors}</td>
                <td className={`${td} font-semibold`}>{r.signups}</td>
                <td className={td}>{conversion(r)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <div className="mt-6 bg-card2 border border-border rounded-xl px-5 py-4 text-[12px] text-muted leading-relaxed">
        <div className="font-semibold text-text mb-1">{t("howTrackingTitle")}</div>
        {t("howTrackingText")}
      </div>
    </>
  );
}
