"use client";

import "./SpaceCard.css";
import Placeholder from "@/components/shared/Placeholder";
import { Space, fmtPrice } from "@/data";
import { CAT_ICON_COMPONENT, CAT_ICON_FALLBACK } from "@/lib/iconMap";
import { Heart, Star } from "lucide-react";

interface SpaceCardProps {
  space: Space;
  saved: boolean;
  onSave: (id: number) => void;
  onOpen: (space: Space) => void;
}

export default function SpaceCard({
  space,
  saved,
  onSave,
  onOpen,
}: SpaceCardProps) {
  const cat = space.category;
  const rating = space.rating;
  const CatIcon = CAT_ICON_COMPONENT[cat.id] ?? CAT_ICON_FALLBACK;

  return (
    <article className="space-card" onClick={() => onOpen(space)}>
      <div className="sc-image-wrap">
        <Placeholder />
        <div className="sc-id">{space.id}</div>
        <button
          className={`sc-save ${saved ? "saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(space.id);
          }}
          title={saved ? "Saved" : "Save"}
        >
          <Heart
            size={14}
            fill={saved ? "currentColor" : "none"}
            strokeWidth={saved ? 0 : 1.5}
          />
        </button>
        <div className="sc-tag">
          <CatIcon
            size={10}
            strokeWidth={1.7}
            style={{
              marginRight: 6,
              verticalAlign: "middle",
              display: "inline-block",
            }}
          />
          {cat?.name}
        </div>
      </div>
      <div className="sc-body">
        <div className="sc-row">
          <div className="sc-title">{space.name}</div>
          <div className="sc-price">
            {fmtPrice(space.pricePerHour)}
            <span className="unit">/HR</span>
          </div>
        </div>
        <div className="sc-meta">
          <span>
            {space.address.city.toUpperCase()} ·{" "}
            {space.address.country.toUpperCase()}
          </span>
          <span className="sc-rating">
            <Star size={10} fill="currentColor" strokeWidth={0} />
            <span style={{ marginLeft: 3 }}>{rating.toFixed(2)}</span>
            <span style={{ color: "var(--ink-4)", marginLeft: 4 }}>
              ({space.reviewCount})
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
