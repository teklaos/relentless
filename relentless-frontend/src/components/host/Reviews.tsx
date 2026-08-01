"use client";

import "./Reviews.css";
import { Star } from "lucide-react";
import { useHost } from "@/context/HostContext";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { fmtDate, initials } from "@/data/format";
import Stars from "@/components/shared/ui/Stars";

export default function Reviews() {
  const host = useHost();
  const allRev = host.reviews;
  const avg = allRev.length ? allRev.reduce((a, r) => a + r.rating, 0) / allRev.length : 0;
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const c = allRev.filter((r) => r.rating === star).length;
    return {
      star,
      count: c,
      w: (allRev.length ? Math.round((c / allRev.length) * 100) : 0) + "%"
    };
  });

  const revSpaceIds = [...new Set(allRev.map((r) => r.space.id))];
  const chips = [{ id: 0, label: "All spaces" }, ...revSpaceIds.map((id) => ({ id, label: host.spaceName(id) }))];
  const filtered = host.reviewFilter === 0 ? allRev : allRev.filter((r) => r.space.id === host.reviewFilter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Guest reviews.</h1>
      </div>

      <div className="h-rev-summary">
        <div className="h-card h-rev-avg">
          <div className="h-rev-avg-row">
            <span className="h-rev-avg-num">{avg.toFixed(2)}</span>
            <Stars rating={Math.round(avg)} size={18} />
          </div>
          <div className="mono h-rev-avg-sub">Across {allRev.length} reviews</div>
        </div>
        <div className="h-card h-rev-dist">
          {dist.map((d) => (
            <div key={d.star} className="h-rev-dist-row">
              <span className="mono h-rev-dist-star">{d.star}</span>
              <div className="h-rev-dist-track">
                <div className="h-rev-dist-fill" style={{ width: d.w }} />
              </div>
              <span className="mono h-rev-dist-count">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-book-bar">
        <div className="h-tabs">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => host.setReviewFilter(c.id)}
              className={`mono h-tab ${host.reviewFilter === c.id ? "active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Star size={20} />
          </div>
          <div className="empty-h">No reviews yet</div>
          <div className="empty-p">Reviews from guests show up here after their stay.</div>
        </div>
      ) : (
        <div className="h-rev-grid">
          {filtered.map((r) => (
            <div key={r.id} className="h-card h-rev-card">
              <div className="h-rev-head">
                <AvatarImg
                  imageKey={r.user.profileImageKey}
                  name={r.user.username}
                  size={36}
                  radius={3}
                  fallback={
                    <div className="mono h-avatar-box" style={{ width: 36, height: 36, fontSize: 12 }}>
                      {initials(r.user.username)}
                    </div>
                  }
                />
                <div className="h-rev-meta">
                  <div className="h-rev-guest">{r.user.username}</div>
                  <div className="mono h-rev-space">{host.spaceName(r.space.id)}</div>
                </div>
                <Stars rating={r.rating} size={13} />
              </div>
              <div className="h-rev-body">{r.comment}</div>
              <div className="h-rev-foot">
                <span className="mono h-rev-date">{fmtDate(r.createdAt.slice(0, 10))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
