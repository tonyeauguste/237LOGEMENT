"use client";

// Briques communes de l'espace marketing : chargement de données, carte de
// chiffre avec tendance, histogramme SVG, sélecteur de période.

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "@/i18n/IntlProvider";

/**
 * Charge des données dès que `key` change. `loading` est dérivé (pas d'état
 * séparé) : une valeur n'est « à jour » que si elle a été chargée pour la clé
 * courante — évite un setState synchrone dans l'effet et l'affichage d'un
 * ancien résultat pendant un changement de période.
 */
export function useLoad<T>(key: string, load: () => PromiseLike<T>) {
  const [state, setState] = useState<{ key: string; data?: T; failed?: boolean }>({ key: "" });

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ key, data });
      },
      () => {
        if (!cancelled) setState({ key, failed: true });
      }
    );
    return () => {
      cancelled = true;
    };
    // `load` est recréée à chaque rendu : seule `key` décide du rechargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = state.key === key;
  return {
    data: current ? state.data : undefined,
    loading: !current,
    failed: current && !!state.failed,
  };
}

/** Évolution vs période précédente : ▲ +12 % (vert), ▼ −5 % (rouge), « — » sans base de comparaison. */
export function Trend({ value, suffix }: { value: number | null; suffix?: string }) {
  const t = useTranslations("Marketing");
  if (value === null) {
    return <span className="text-[11px] text-dim">{t("trendNone")}</span>;
  }
  const up = value > 0;
  const flat = value === 0;
  return (
    <span
      className={`text-[11px] font-semibold ${flat ? "text-muted" : up ? "text-green2" : "text-red"}`}
      title={suffix}
    >
      {flat ? "＝" : up ? "▲" : "▼"} {up ? "+" : ""}
      {value}%{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: ReactNode;
  trend?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5" title={hint}>
      <div className="flex items-center gap-2 text-gold mb-3">{icon}</div>
      <div className="font-display text-[28px] font-bold text-text leading-none">{value}</div>
      <div className="text-[12px] text-muted mt-1.5">{label}</div>
      {(trend || sub) && (
        <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-dim">
          {trend}
          {sub}
        </div>
      )}
    </div>
  );
}

// Largeur minimale d'une barre : de quoi afficher son nombre (jusqu'à 3-4
// chiffres) au-dessus d'elle. Au-delà de ce que la carte peut contenir
// (30 et 90 jours, surtout sur mobile), le graphique défile horizontalement
// plutôt que d'écraser les nombres les uns sur les autres.
const BAR_SLOT = 22;
const BAR_AREA = 110;

/** Histogramme minimal (aucune dépendance) : une barre par point, son nombre affiché au-dessus. */
export function BarChart({
  title,
  points,
  color = "#C89B3C",
}: {
  title: string;
  points: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((s, p) => s + p.value, 0);
  const minWidth = points.length * BAR_SLOT;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex justify-between items-baseline mb-3 gap-3">
        <h4 className="text-[13px] font-semibold text-text">{title}</h4>
        <span className="text-[12px] text-muted shrink-0">{total.toLocaleString("fr-FR")}</span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div role="img" aria-label={title} className="flex items-end gap-[3px]" style={{ minWidth }}>
          {points.map((p) => {
            const h = p.value === 0 ? 2 : Math.max(3, (p.value / max) * BAR_AREA);
            return (
              <div
                key={p.label}
                title={`${p.label} : ${p.value}`}
                className="flex-1 min-w-0 flex flex-col items-center justify-end"
              >
                <span
                  className={`text-[10px] leading-none mb-1 font-semibold ${p.value === 0 ? "text-dim" : "text-text"}`}
                >
                  {p.value.toLocaleString("fr-FR")}
                </span>
                <div
                  className="w-full rounded-[2px]"
                  style={{ height: h, background: color, opacity: p.value === 0 ? 0.25 : 0.9 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-dim mt-1.5" style={{ minWidth }}>
          <span>{points[0]?.label}</span>
          <span>{points[points.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
}

export function PeriodSwitch<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
            value === o.value
              ? "bg-gold text-[#07111e]"
              : "bg-card border border-border text-muted hover:border-gold hover:text-gold"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex justify-between items-end gap-3 flex-wrap mb-4 mt-8 first:mt-0">
      <div>
        <h3 className="text-[16px] font-semibold text-text">{title}</h3>
        {sub && <p className="text-[12px] text-muted mt-1 max-w-[620px]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function StateMessage({ loading, failed }: { loading: boolean; failed: boolean }) {
  const t = useTranslations("Marketing");
  if (loading) return <p className="text-sm text-muted py-6">{t("loading")}</p>;
  if (failed) return <p className="text-sm text-red py-6">{t("loadError")}</p>;
  return null;
}

/** Tableau scrollable horizontalement sur mobile (le corps de la page ne doit jamais déborder). */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-x-auto">
      <table className="w-full text-[13px] min-w-[560px]">{children}</table>
    </div>
  );
}

export const th = "text-left text-[11px] uppercase tracking-[1px] text-muted font-semibold px-4 py-3 border-b border-border whitespace-nowrap";
export const td = "px-4 py-3 border-b border-border/60 text-text align-top";
