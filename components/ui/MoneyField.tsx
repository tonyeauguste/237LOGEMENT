"use client";

// ═══════════════════════════════════════════════
// Champ de saisie monétaire — Tâche 3 du prompt "publier-et-auth" :
// affiche le montant avec séparateurs de milliers + suffixe FCFA, mais ne
// stocke/renvoie jamais qu'un entier brut (chaîne de chiffres) via
// `onChange`, jamais le texte formaté — la conversion vit dans
// lib/format.ts (fmtMoneyInput/parseMoneyInput), réutilisée par tous les
// champs monétaires du formulaire (loyer, caution, avance, prix de vente).
// ═══════════════════════════════════════════════

import { fmtMoneyInput, parseMoneyInput } from "@/lib/format";

export default function MoneyField({
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
  inputClassName = "",
}: {
  /** Entier brut sous forme de chaîne (ex. "300000"), jamais formaté. */
  value: string;
  /** Reçoit l'entier brut sous forme de chaîne (ex. "300000"), jamais le texte formaté. */
  onChange: (rawValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        className={`form-control !pr-14 ${inputClassName}`}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={fmtMoneyInput(value)}
        disabled={disabled}
        onChange={(e) => {
          const parsed = parseMoneyInput(e.target.value);
          onChange(parsed != null ? String(parsed) : "");
        }}
      />
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted font-semibold pointer-events-none">
        FCFA
      </span>
    </div>
  );
}
