"use client";

import "./SpaceDetail.css";
import { useEffect, useState } from "react";
import Placeholder from "@/components/shared/Placeholder";
import BookingWidget from "./BookingWidget";
import {
  CAT_ICON_COMPONENT,
  CAT_ICON_FALLBACK,
  AMEN_ICON_COMPONENT,
} from "@/lib/iconMap";
import { Space, Review, fmtDateShort } from "@/data";
import { fetchReviews } from "@/lib/api";
import { Heart, X, MapPin, Star } from "lucide-react";

interface SpaceDetailProps {
  space: Space;
  saved: boolean;
  onClose: () => void;
  onSave: (id: number) => void;
  onBook: (params: {
    space: Space;
    startIso: string;
    endIso: string;
    total: number;
    duration: number;
  }) => void;
}

export default function SpaceDetail({
  space,
  saved,
  onClose,
  onSave,
  onBook,
}: SpaceDetailProps) {
  const cat = space.category;
  const CatIcon = CAT_ICON_COMPONENT[cat.id] ?? CAT_ICON_FALLBACK;
  const host = space.host;
  const amens = space.amenities;
  const rating = space.rating;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    fetchReviews(space.id)
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, [space.id]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn sm ${saved ? "primary" : ""}`}
              onClick={() => onSave(space.id)}
            >
              <Heart
                size={13}
                fill={saved ? "currentColor" : "none"}
                strokeWidth={saved ? 0 : 1.5}
              />
              {saved ? "SAVED" : "SAVE"}
            </button>
            <button className="drawer-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          <div className="detail-main">
            <div className="detail-cat">
              <CatIcon
                size={11}
                strokeWidth={1.7}
                style={{
                  marginRight: 8,
                  verticalAlign: "middle",
                  display: "inline-block",
                }}
              />
              {cat.name.toUpperCase()} · HOSTED BY {host.username.toUpperCase()}
            </div>
            <h1 className="detail-title">{space.name}</h1>
            <div className="detail-loc">
              <MapPin size={13} />
              {space.address.street} {space.address.streetNumber}
              {space.address.apartmentNumber
                ? `/${space.address.apartmentNumber}`
                : ""}
              ,&nbsp;
              {space.address.city} {space.address.postalCode},{" "}
              {space.address.country}
            </div>

            <div className="detail-hero">
              <Placeholder />
            </div>

            <div className="detail-thumbs">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="detail-thumb">
                  <Placeholder />
                </div>
              ))}
            </div>

            <div className="detail-section">
              <div className="detail-section-h">DESCRIPTION</div>
              <p className="detail-desc">{space.description}</p>
            </div>

            <div className="detail-section">
              <div className="detail-section-h">
                AMENITIES · {amens.length} ITEMS
              </div>
              <div className="amenity-grid">
                {amens.map((a) => {
                  if (!a) return null;
                  const AmenIcon =
                    AMEN_ICON_COMPONENT[a.name] ??
                    AMEN_ICON_COMPONENT["_fallback"];
                  return (
                    <div key={a.id} className="amenity">
                      <span className="icon">
                        <AmenIcon size={14} />
                      </span>
                      {a.name}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-h">
                REVIEWS · {rating.toFixed(2)} / 5.00 · {reviews.length} ENTRIES
              </div>
              {reviews.length === 0 ? (
                <div
                  style={{
                    fontFamily: "'Geist Mono',monospace",
                    fontSize: 12,
                    color: "var(--ink-3)",
                    padding: "8px 0",
                  }}
                >
                  NO REVIEWS YET — BE THE FIRST.
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review">
                    <div>
                      <div className="review-author">@{r.author.username}</div>
                      <div className="review-date">
                        {fmtDateShort(r.createdAt)}
                      </div>
                    </div>
                    <div className="review-body">{r.comment}</div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={i < r.rating ? "currentColor" : "none"}
                          strokeWidth={i < r.rating ? 0 : 1.5}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="detail-side">
            <BookingWidget space={space} onBook={onBook} />
          </div>
        </div>
      </div>
    </>
  );
}
