"use client";

import "./Host.css";
import "./Listings.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Home, Trash2 } from "lucide-react";
import { useHost } from "@/context/HostContext";
import Placeholder from "@/components/shared/ui/Placeholder";
import Modal from "@/components/shared/ui/Modal";
import { imageUrl } from "@/lib/api";
import { fmtPrice } from "@/data/format";
import { CAT_ICON_COMPONENT, CAT_ICON_FALLBACK } from "@/lib/iconMap";

const chipDefs: [string, string][] = [
  ["ACTIVE", "Visible"],
  ["INACTIVE", "Hidden"],
  ["ALL", "All"]
];

export default function Listings() {
  const host = useHost();
  const router = useRouter();
  const lf = host.listingFilter;
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deleteTarget = deleteId != null ? host.space(deleteId) : undefined;

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    await host.removeSpace(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };
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

      <div className="list-toolbar">
        <div className="tabs">
          {chipDefs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => host.setListingFilter(key)}
              className={`mono tab ${lf === key ? "active" : ""}`}
            >
              {label}
              <span className="tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Home size={20} />
          </div>
          <div className="empty-h">{lf === "INACTIVE" ? "No hidden spaces yet" : "No spaces yet"}</div>
          <div className="empty-p">
            {lf === "INACTIVE"
              ? "Spaces you hide from guests show up here."
              : "Create your first listing to get started."}
          </div>
        </div>
      ) : (
        <div className="h-listing-grid">
          {cards.map((s) => {
            const isDeleted = s.status === "DELETED";
            const isActive = s.status === "ACTIVE";
            const loc = [`${s.address.street} ${s.address.streetNumber}`, s.address.city, s.address.country]
              .join(" - ")
              .toUpperCase();
            const CatIcon = CAT_ICON_COMPONENT[s.category.id] ?? CAT_ICON_FALLBACK;
            const cover = s.imageKeys?.[0];
            return (
              <div key={s.id} className="card h-card-hover h-list-card">
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
                    <span className="h-list-loc truncate">{loc}</span>
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
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="h-btn-outline h-list-btn h-list-btn-danger"
                          aria-label="Delete listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <Modal
          title="Delete listing"
          subtitle="This cannot be undone"
          onClose={() => !deleting && setDeleteId(null)}
          footer={
            <>
              <button className="btn" disabled={deleting} onClick={() => setDeleteId(null)}>
                CANCEL
              </button>
              <button className="btn h-list-btn-danger" disabled={deleting} onClick={confirmDelete}>
                {deleting ? "DELETING…" : "DELETE LISTING"}
              </button>
            </>
          }
        >
          <p>
            Permanently delete <b>{deleteTarget.name}</b>? Guests will no longer be able to book this space.
          </p>
        </Modal>
      )}
    </div>
  );
}
