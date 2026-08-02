"use client";

import "./Admin.css";
import "./Transactions.css";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { fetchAdminBookings } from "@/lib/api";
import { Booking } from "@/data/types";
import { fmtDate, fmtTimeRange, fmtPrice, statusMeta } from "@/data/format";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type StatusFilter = (typeof STATUSES)[number];

export default function Transactions() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    fetchAdminBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, s === "ALL" ? bookings.length : bookings.filter((b) => b.status === s).length])
  ) as Record<StatusFilter, number>;
  const rows = bookings.filter((b) => filter === "ALL" || b.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactions.</h1>
      </div>

      <div className="tabs a-tabs">
        {STATUSES.map((key) => (
          <button key={key} onClick={() => setFilter(key)} className={`mono tab ${filter === key ? "active" : ""}`}>
            {key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()}
            <span className="tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Receipt size={20} />
          </div>
          <div className="empty-h">No transactions found</div>
          <div className="empty-p">Bookings made across the platform show up here.</div>
        </div>
      ) : (
        <div>
          <div className="mono a-tx-grid a-tx-head">
            <span>Ref</span>
            <span>Guest - Space</span>
            <span>When</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {rows.map((b) => {
            const sm = statusMeta(b.status);
            return (
              <div key={b.id} className="row a-tx-grid a-tx-row">
                <span className="mono a-tx-ref">#{b.id}</span>
                <div className="a-tx-cell">
                  <AvatarImg
                    imageKey={b.user.profileImageKey}
                    name={b.user.username}
                    size={30}
                    radius={3}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="a-tx-guest truncate">{b.user.username}</div>
                    <div className="mono a-tx-space truncate">{b.space.name}</div>
                  </div>
                </div>
                <div className="mono a-tx-when">
                  <div>{fmtDate(b.startTime)}</div>
                  <div className="a-tx-when-sub">{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
                <span className="mono a-tx-amount">{fmtPrice(b.totalPrice)}</span>
                <span className="mono badge" style={{ color: sm.fg }}>
                  <span className="badge-dot" style={{ background: sm.dot }} />
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
