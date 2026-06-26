"use client";

import "./Explore.css";
import { useState, useMemo, useEffect, useRef } from "react";
import SpaceCard from "./SpaceCard";
import { Space, Category } from "@/data";
import { CAT_ICON_COMPONENT, CAT_ICON_FALLBACK } from "@/lib/iconMap";
import { Search, Filter } from "lucide-react";

interface ExploreProps {
  spaces: Space[];
  categories: Category[];
  loading?: boolean;
  error?: string | null;
  savedIds: Set<number>;
  onSave: (id: number) => void;
  onOpen: (space: Space) => void;
  initialFilter?: { category?: number } | null;
}

export default function Explore({
  spaces,
  categories,
  loading,
  error,
  savedIds,
  onSave,
  onOpen,
  initialFilter,
}: ExploreProps) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("ALL");
  const [sort, setSort] = useState("RECOMMENDED");
  const [activeCat, setActiveCat] = useState<number | null>(
    initialFilter?.category ?? null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prevInitialFilter, setPrevInitialFilter] = useState(initialFilter);
  const filtersRef = useRef<HTMLDivElement>(null);

  if (prevInitialFilter !== initialFilter) {
    setPrevInitialFilter(initialFilter);
    if (initialFilter?.category) {
      setActiveCat(initialFilter.category);
    }
  }

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    };
    if (filtersOpen) {
      document.addEventListener("mousedown", close);
    }
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, [filtersOpen]);

  const cities = useMemo(
    () => [...new Set(spaces.map((s) => s.address.city))].sort(),
    [spaces],
  );

  const filtered = useMemo(() => {
    let list = spaces.filter((s) => {
      if (activeCat && s.category.id !== activeCat) {
        return false;
      }
      if (city !== "ALL" && s.address.city !== city) {
        return false;
      }
      if (q) {
        const t = q.toLowerCase();
        if (
          !s.name.toLowerCase().includes(t) &&
          !s.address.city.toLowerCase().includes(t) &&
          !s.description.toLowerCase().includes(t)
        ) {
          return false;
        }
      }
      return true;
    });
    if (sort === "PRICE_LOW") {
      list = [...list].sort((a, b) => a.pricePerHour - b.pricePerHour);
    }
    if (sort === "PRICE_HIGH") {
      list = [...list].sort((a, b) => b.pricePerHour - a.pricePerHour);
    }
    if (sort === "RATING") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [spaces, q, city, activeCat, sort]);

  const activeFilterCount = (activeCat ? 1 : 0) + (city !== "ALL" ? 1 : 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Spaces by the hour.</h1>
      </div>

      <div className="filter-bar">
        <div className="filter-input">
          <Search size={15} />
          <input
            placeholder="Search by name, neighbourhood, equipment…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filter-input">
          <span className="label">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="RECOMMENDED">Recommended</option>
            <option value="PRICE_LOW">Price · low to high</option>
            <option value="PRICE_HIGH">Price · high to low</option>
            <option value="RATING">Top rated</option>
          </select>
        </div>
        <div className="filter-popover-wrap" ref={filtersRef}>
          <button
            className={`btn ${filtersOpen || activeFilterCount ? "primary" : ""}`}
            style={{ height: 44 }}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>

          {filtersOpen && (
            <div className="filter-popover">
              <div className="fp-section">
                <div className="fp-label">Category</div>
                <div className="fp-chip-row">
                  <button
                    className={`fp-chip ${activeCat === null ? "active" : ""}`}
                    onClick={() => setActiveCat(null)}
                  >
                    All
                  </button>
                  {categories.map((c) => {
                    const CatIcon =
                      CAT_ICON_COMPONENT[c.id] ?? CAT_ICON_FALLBACK;
                    return (
                      <button
                        key={c.id}
                        className={`fp-chip ${activeCat === c.id ? "active" : ""}`}
                        onClick={() =>
                          setActiveCat(activeCat === c.id ? null : c.id)
                        }
                      >
                        <CatIcon size={12} strokeWidth={1.7} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="fp-section">
                <div className="fp-label">City</div>
                <div className="fp-chip-row">
                  <button
                    className={`fp-chip ${city === "ALL" ? "active" : ""}`}
                    onClick={() => setCity("ALL")}
                  >
                    All cities
                  </button>
                  {cities.map((c) => (
                    <button
                      key={c}
                      className={`fp-chip ${city === c ? "active" : ""}`}
                      onClick={() => setCity(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="fp-foot">
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    setActiveCat(null);
                    setCity("ALL");
                  }}
                >
                  Reset
                </button>
                <button
                  className="btn primary sm"
                  onClick={() => setFiltersOpen(false)}
                >
                  Show {filtered.length} results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="results-bar">
        <span>
          <span className="count-strong">{filtered.length}</span> results
          {activeCat && (
            <span> · {categories.find((c) => c.id === activeCat)?.name}</span>
          )}
          {city !== "ALL" && <span> · {city}</span>}
        </span>
      </div>

      {loading ? (
        <div className="empty">
          <div className="empty-h">Loading spaces…</div>
        </div>
      ) : error ? (
        <div className="empty">
          <div className="empty-icon">
            <Search size={20} />
          </div>
          <div className="empty-h">Couldn’t load spaces</div>
          <div className="empty-p">{error}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Search size={20} />
          </div>
          <div className="empty-h">No spaces match your filters</div>
          <div className="empty-p">
            Try widening the city, clearing the search, or browsing a different
            category.
          </div>
        </div>
      ) : (
        <div className="space-grid">
          {filtered.map((s) => (
            <SpaceCard
              key={s.id}
              space={s}
              saved={savedIds.has(s.id)}
              onSave={onSave}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
