"use client";

// ═══════════════════════════════════════════════
// Champ "Ville" en saisie libre avec suggestions.
//
// Remplace le <select> fermé (CitySelect) partout où l'utilisateur doit
// pouvoir désigner une ville : la liste CITIES_BY_REGION ne couvre pas
// toutes les localités du Cameroun, et un select bloquait purement et
// simplement quiconque habite une ville absente de la liste — impossible
// de publier son bien, impossible de le chercher.
//
// On garde les suggestions (datalist) pour l'immense majorité des cas,
// mais toute autre valeur est acceptée telle quelle.
// ═══════════════════════════════════════════════

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { ALL_CITIES } from "@/lib/data";

interface CityInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
}

const CityInput = forwardRef<HTMLInputElement, CityInputProps>(function CityInput(
  { placeholder = "📍 Ville", className = "form-control", ...props },
  ref
) {
  // Un id unique par instance : plusieurs champs ville peuvent coexister
  // sur une même page (barre de recherche + filtres, par exemple).
  const listId = useId();

  return (
    <>
      <input
        ref={ref}
        type="text"
        list={listId}
        autoComplete="off"
        placeholder={placeholder}
        className={className}
        {...props}
      />
      <datalist id={listId}>
        {ALL_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
});

export default CityInput;
