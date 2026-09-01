"use client";

import "./SpaceDetail.css";
import { useCallback, useEffect, useState } from "react";
import Placeholder from "@/components/shared/ui/Placeholder";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import Stars from "@/components/shared/ui/Stars";
import BookingWidget from "./BookingWidget";
import { CAT_ICON_COMPONENT, CAT_ICON_FALLBACK, AMEN_ICON_COMPONENT } from "@/lib/iconMap";
import { Space, Review } from "@/lib/types";
import { fmtDateShort, fmtPrice } from "@/lib/format";
import { fetchReviews, imageUrl } from "@/lib/api";
import { useMediaQuery } from "@/lib/useMediaQuery";
import Image from "next/image";
import { Bookmark, X, MapPin } from "lucide-react";

interface SpaceDetailProps {
  space: Space;
  saved: boolean;
  onClose: () => void;
  onSave: (id: number) => void;
  onBook: (params: { space: Space; startIso: string; endIso: string; total: number; duration: number }) => void;
}

export default function SpaceDetail({ space, saved, onClose, onSave, onBook }: SpaceDetailProps) {
  const cat = space.category;
  const CatIcon = CAT_ICON_COMPONENT[cat.id] ?? CAT_ICON_FALLBACK;
  const host = space.host;
  const amens = space.amenities;
  const rating = space.rating;
  const images = space.imageKeys ?? [];
  const hero = images[0];
  const thumbs = images.length ? images.slice(0, 4) : [null, null, null, null];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const mobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    setShown(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    fetchReviews(space.id)
      .then((data) => {
        if (active) setReviews([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
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
      if (e.key !== "Escape") return;
      if (bookOpen) setBookOpen(false);
      else requestClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [requestClose, bookOpen]);

  return (
    <>
      <div className={`drawer-backdrop ${shown ? "open" : ""}`} onClick={requestClose} />
      <div className={`drawer ${shown ? "open" : ""}`}>
        <div className="drawer-head">
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn sm ${saved ? "primary" : ""}`} onClick={() => onSave(space.id)}>
              <Bookmark size={13} fill={saved ? "currentColor" : "none"} strokeWidth={saved ? 0 : 1.5} />
              {saved ? "SAVED" : "SAVE"}
            </button>
            <button className="drawer-close" onClick={requestClose}>
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
                  display: "inline-block"
                }}
              />
              {cat.name.toUpperCase()} - HOSTED BY{" "}
              <AvatarImg
                imageKey={host.profileImageKey}
                name={host.username}
                size={16}
                style={{
                  verticalAlign: "middle",
                  margin: "0 4px",
                  display: "inline-block"
                }}
              />
              {host.username.toUpperCase()}
            </div>
            <h1 className="detail-title">{space.name}</h1>
            <div className="detail-loc">
              <MapPin size={13} />
              {space.address.street} {space.address.streetNumber}
              {space.address.apartmentNumber ? `/${space.address.apartmentNumber}` : ""}
              ,&nbsp;
              {space.address.city} {space.address.postalCode}, {space.address.country}
            </div>

            <div className="detail-hero">
              {hero ? (
                <Image
                  src={imageUrl(hero)}
                  alt={space.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              ) : (
                <Placeholder />
              )}
            </div>

            {images.length > 1 && (
              <div className="detail-thumbs">
                {thumbs.map((key, i) => (
                  <div key={i} className="detail-thumb">
                    {key ? (
                      <Image
                        src={imageUrl(key)}
                        alt={`${space.name} ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 180px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Placeholder />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="detail-section">
              <div className="detail-section-h">DESCRIPTION</div>
              <p className="detail-desc">{space.description}</p>
            </div>

            <div className="detail-section">
              <div className="detail-section-h">AMENITIES - {amens.length} ITEMS</div>
              <div className="amenity-grid">
                {amens.map((a) => {
                  const AmenIcon = AMEN_ICON_COMPONENT[a.name] ?? AMEN_ICON_COMPONENT["_fallback"];
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
                REVIEWS - {rating.toFixed(2)} / 5.00 - {reviews.length} ENTRIES
              </div>
              {reviews.length === 0 ? (
                <div
                  style={{
                    fontFamily: "'Geist Mono',monospace",
                    fontSize: 12,
                    color: "var(--ink-3)",
                    padding: "8px 0"
                  }}
                >
                  NO REVIEWS YET — BE THE FIRST.
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="review">
                    <div className="review-head">
                      <div className="review-who">
                        <AvatarImg
                          imageKey={r.user.profileImageKey}
                          name={r.user.username}
                          size={28}
                          style={{ flexShrink: 0 }}
                        />
                        <div>
                          <div className="review-author">@{r.user.username}</div>
                          <div className="review-date">{fmtDateShort(r.createdAt)}</div>
                        </div>
                      </div>
                      <div className="review-rating">
                        <Stars rating={r.rating} size={11} variant="outline" />
                      </div>
                    </div>
                    <div className="review-body">{r.comment}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="detail-side">{!mobile && <BookingWidget space={space} onBook={onBook} />}</div>
        </div>

        <div className="book-bar">
          <div className="book-bar-price">
            <span className="v">{fmtPrice(space.pricePerHour)}</span>
            <span className="u">/ hour</span>
          </div>
          <button className="btn accent lg" onClick={() => setBookOpen(true)}>
            BOOK
          </button>
        </div>
      </div>

      {mobile && (
        <div className={`book-drawer ${bookOpen ? "open" : ""}`}>
          <div className="book-drawer-head">
            <span className="book-drawer-title">Book this space</span>
            <button className="drawer-close" onClick={() => setBookOpen(false)} aria-label="Close booking">
              <X size={16} />
            </button>
          </div>
          <div className="book-drawer-body">
            <BookingWidget space={space} onBook={onBook} />
          </div>
        </div>
      )}
    </>
  );
}
