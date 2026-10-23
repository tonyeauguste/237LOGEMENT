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

/** Histogramme minimal en SVG (aucune dépendance) : une barre par point, infobulle native au survol. */
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
  const W = 600;
  const H = 120;
  const gap = points.length > 45 ? 1 : 3;
  const bw = Math.max(2, (W - gap * (points.length - 1)) / Math.max(points.length, 1));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex justify-between items-baseline mb-3 gap-3">
        <h4 className="text-[13px] font-semibold text-text">{title}</h4>
        <span className="text-[12px] text-muted shrink-0">{total.toLocaleString("fr-FR")}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]" role="img" aria-label={title} preserveAspectRatio="none">
        {points.map((p, i) => {
          const h = p.value === 0 ? 2 : Math.max(3, (p.value / max) * (H - 4));
          return (
            <rect
              key={p.label}
              x={i * (bw + gap)}
              y={H - h}
              width={bw}
              height={h}
              rx={1.5}
              fill={color}
              opacity={p.value === 0 ? 0.25 : 0.9}
            >
              <title>{`${p.label} : ${p.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-dim mt-1.5">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
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
