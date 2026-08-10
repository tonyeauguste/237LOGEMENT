"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, LayoutGrid, List as ListIcon, X } from "lucide-react";
import CitySelect from "@/components/ui/CitySelect";
import ComingSoon from "@/components/ui/ComingSoon";
import Button from "@/components/ui/Button";
import { PROPERTIES, QUARTIERS } from "@/lib/data";
import type { ListingView, SearchFilters } from "@/lib/types";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyListCard from "@/components/property/PropertyListCard";

function SearchPageInner() {
  const params = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    city: params.get("city") || "",
    type: (params.get("type") as SearchFilters["type"]) || "",
    quartier: "",
    rooms: params.get("rooms") || "",
    minPrice: "",
    maxPrice: params.get("maxp") || "",
    sort: "recent",
  });
  const [view, setView] = useState<ListingView>("grid");

  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      query: "",
      city: "",
      type: "",
      quartier: "",
      rooms: "",
      minPrice: "",
      maxPrice: "",
      sort: "recent",
    });
  }

  // Logique de filtrage / tri — prête à fonctionner dès qu'un vrai
  // tableau de propriétés sera injecté dans lib/data.ts (PROPERTIES).
  const results = useMemo(() => {
    let list = PROPERTIES.filter((p) => {
      if (
        filters.query &&
        !`${p.title} ${p.city} ${p.quartier}`
          .toLowerCase()
          .includes(filters.query.toLowerCase())
      )
        return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.quartier && p.quartier !== filters.quartier) return false;
      if (filters.rooms && p.rooms < parseInt(filters.rooms, 10)) return false;
      if (filters.minPrice && p.price < parseInt(filters.minPrice, 10)) return false;
      if (filters.maxPrice && p.price > parseInt(filters.maxPrice, 10)) return false;
      return true;
    });
    switch (filters.sort) {
      case "prix-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "prix-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.owner.rating - a.owner.rating);
        break;
    }
    return list;
  }, [filters]);

  return (
    <div className="pt-[70px]">
      {/* Sticky topbar */}
      <div className="bg-bg2 border-b border-border px-[5%] py-3.5 sticky top-[70px] z-[100]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row gap-2.5 md:items-center">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
            <input
              className="w-full bg-card border-[1.5px] border-border text-text pl-[38px] pr-3.5 py-2.5 rounded-[10px] text-base outline-none focus:border-gold transition-colors placeholder:text-dim"
              placeholder="Rechercher par titre, ville, quartier…"
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
            />
          </div>
          <CitySelect
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none cursor-pointer focus:border-gold"
            placeholder="Toutes les villes"
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <select
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none cursor-pointer focus:border-gold"
            value={filters.type}
            onChange={(e) => set("type", e.target.value as SearchFilters["type"])}
          >
            <option value="">Tout type</option>
            <option value="longue">Long terme</option>
            <option value="courte">Court séjour</option>
          </select>
          <Button variant="gold" size="sm">
            <Search size={14} /> Chercher
          </Button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto my-6 px-[5%]">
        {/* Toolbar */}
        <div className="flex justify-between items-center flex-wrap gap-3 mb-[18px]">
          <div className="text-[15px] text-text">
            <strong className="font-semibold">{results.length}</strong> logements trouvés
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none cursor-pointer focus:border-gold"
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value as SearchFilters["sort"])}
            >
              <option value="recent">Plus récents</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-2 transition-colors ${view === "grid" ? "bg-gold3 text-gold" : "text-muted"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 transition-colors ${view === "list" ? "bg-gold3 text-gold" : "text-muted"}`}
              >
                <ListIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-card border border-border rounded-xl px-[18px] py-3.5 mb-[18px] flex gap-3 flex-wrap items-center">
          <span className="text-[13px] text-muted font-medium shrink-0">Filtres :</span>
          <select
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none cursor-pointer focus:border-gold"
            value={filters.quartier}
            onChange={(e) => set("quartier", e.target.value)}
          >
            <option value="">Tous les quartiers</option>
            {QUARTIERS.map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
          <select
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none cursor-pointer focus:border-gold"
            value={filters.rooms}
            onChange={(e) => set("rooms", e.target.value)}
          >
            <option value="">Chambres</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <input
            type="number"
            placeholder="Prix min"
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none focus:border-gold w-[120px]"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
          <input
            type="number"
            placeholder="Prix max"
            className="filter-select bg-card2 border border-border text-text px-3 py-[7px] rounded-lg text-base outline-none focus:border-gold w-[120px]"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
          <Button variant="danger" size="sm" onClick={resetFilters}>
            <X size={13} /> Réinitialiser
          </Button>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <ComingSoon
            icon="🏗️"
            title="Aucune annonce disponible pour le moment"
            text={
              <>
                La plateforme est en cours de déploiement. Nos équipes référencent actuellement
                les biens à travers tout le Cameroun.
                <br />
                Revenez très bientôt — les premières annonces seront publiées dans les prochains
                jours.
              </>
            }
            badge="🚀 Bientôt opérationnel"
            className="!max-w-none"
          />
        ) : view === "grid" ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {results.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col gap-3.5">
            {results.map((p) => (
              <PropertyListCard key={p.id} p={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
