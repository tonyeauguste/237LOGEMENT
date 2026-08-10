"use client";

import { CITIES_BY_REGION } from "@/lib/data";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface CitySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  className?: string;
}

const CitySelect = forwardRef<HTMLSelectElement, CitySelectProps>(function CitySelect(
  { placeholder = "📍 Ville", className = "form-control", ...props },
  ref
) {
  return (
    <select ref={ref} className={className} {...props}>
      <option value="">{placeholder}</option>
      {Object.entries(CITIES_BY_REGION).map(([region, cities]) => (
        <optgroup key={region} label={region}>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
});

export default CitySelect;
