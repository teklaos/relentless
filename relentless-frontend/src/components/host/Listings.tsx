"use client";

import "./Listings.css";
import { useRouter } from "next/navigation";
import { Plus, Star, Activity, Mic, Camera, Music, Headphones, Target, type LucideIcon } from "lucide-react";
import { useHost } from "@/context/HostContext";
import Placeholder from "@/components/shared/ui/Placeholder";
import { imageUrl } from "@/lib/api";
import { fmtPrice, statusMeta } from "@/data/format";

const chipDefs: [string, string][] = [
  ["ALL", "All"],
  ["ACTIVE", "Visible"],
  ["INACTIVE", "Hidden"]
];

const CAT_ICON: Record<string, LucideIcon> = {
  "Dancing Studio": Activity,
  "Vocal Studio": Mic,
  Photography: Camera,
  "Music Studio": Music,
  "Podcast Booth": Headphones,
  "Rehearsal Hall": Target
};

export default function Listings() {
  const host = useHost();
  const router = useRouter();
  const lf = host.listingFilter;
  const counts: Record<string, number> = {
    ALL: host.spaces.length,
    ACTIVE: host.spaces.filter((s) => s.status === "ACTIVE").length,
    DELETED: host.spaces.filter((s) => s.status === "DELETED").length,
    INACTIVE: host.spaces.filter((s) => s.status === "INACTIVE").length
  };
  const cards = host.spaces.filter((s) => lf === "ALL" || s.status === lf);

  return (
    <div>
      <div className="page-header host-head">
        <h1 className="page-title">Your spaces.</h1>
        <button className="btn primary" onClick={() => router.push("/listings/new")}>
          <Plus size={14} /> New listing
        </button>
      </div>

      <div className="h-chips">
        {chipDefs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => host.setListingFilter(key)}
            className={`h-chip ${lf === key ? "active" : ""}`}
          >
            {label}
            <span className="mono h-chip-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="h-listing-grid">
        {cards.map((s) => {
          const sm = statusMeta(s.status);
          const isDeleted = s.status === "DELETED";
          const isActive = s.status === "ACTIVE";
          const loc = [`${s.address.street} ${s.address.streetNumber}`, s.address.city, s.address.country]
            .join(" - ")
            .toUpperCase();
          const CatIcon = CAT_ICON[s.category.name] ?? Activity;
          const cover = s.imageKeys?.[0];
          return (
            <div key={s.id} className="h-card h-card-hover h-list-card">
              <div
                className="h-list-media"
                style={
                  cover
                    ? {
                        backgroundImage: `url(${imageUrl(cover)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                    : undefined
                }
              >
                {!cover && <Placeholder />}
                <span className="mono h-list-tag h-list-badge" style={{ color: sm.fg }}>
                  <span className="h-list-dot" style={{ background: sm.dot }} />
                  {s.status}
                </span>
                <span className="mono h-list-tag h-list-cat">
                  <CatIcon size={10} strokeWidth={1.7} style={{ verticalAlign: "middle" }} />
                  {s.category.name}
                </span>
              </div>
              <div className="h-list-body">
                <div className="h-list-title-row">
                  <span className="h-list-name">{s.name}</span>
                  <span className="mono h-list-price">
                    {fmtPrice(s.pricePerHour)}
                    <span className="h-list-price-u">/HR</span>
                  </span>
                </div>
                <div className="mono h-list-meta">
                  <span className="h-list-loc h-truncate">{loc}</span>
                  <span className="h-list-rating">
                    <Star size={10} fill="currentColor" strokeWidth={0} />
                    <span className="h-list-rating-num">{s.rating.toFixed(2)}</span>
                    <span className="h-list-rating-cnt">({s.reviewCount})</span>
                  </span>
                </div>

                <div className="h-list-actions">
                  {isDeleted ? (
                    <button onClick={() => router.push(`/listings/${s.id}/edit`)} className="h-btn-dark h-list-btn">
                      Continue setup
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/listings/${s.id}/edit`)}
                        className="h-btn-outline h-list-btn"
                      >
                        Edit
                      </button>
                      <button onClick={() => host.toggleStatus(s.id)} className="h-btn-outline h-list-btn">
                        {isActive ? "Hide" : "Show"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
