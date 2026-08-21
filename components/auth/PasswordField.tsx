"use client";

// Champ mot de passe avec bouton œil pour révéler/masquer la saisie
// (comportement attendu sur un formulaire d'inscription moderne : permet
// de vérifier ce qu'on tape sans avoir à tout resaisir en cas d'erreur).

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className="form-control !pr-11"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
