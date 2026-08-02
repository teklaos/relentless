"use client";

import "./Bookings.css";
import { Calendar } from "lucide-react";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { BookingTab, useHost } from "@/context/HostContext";
import { fmtDate, fmtTimeRange, fmtPrice, net, statusMeta } from "@/data/format";

const tabDefs: [BookingTab, string][] = [
  ["upcoming", "Upcoming"],
  ["past", "Past"]
];

export default function Bookings() {
  const host = useHost();
  const bt = host.bookingTab;

  const upB = host.bookings
    .filter((b) => b.status === "CONFIRMED")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pastB = host.bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED")
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
  const counts: Record<BookingTab, number> = {
    upcoming: upB.length,
    past: pastB.length
  };

  const ledgerSrc = bt === "past" ? pastB : upB;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings.</h1>
      </div>

      <div className="list-toolbar">
        <div className="tabs">
          {tabDefs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => host.setBookingTab(key)}
              className={`mono tab ${bt === key ? "active" : ""}`}
            >
              {label}
              <span className="tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {ledgerSrc.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Calendar size={20} />
          </div>
          <div className="empty-h">{bt === "past" ? "No past bookings yet" : "No bookings yet"}</div>
          <div className="empty-p">
            {bt === "past"
              ? "Completed and cancelled bookings show up here."
              : "When a guest books your space, it shows up here."}
          </div>
        </div>
      ) : (
        <div>
          <div className="mono h-led-grid h-led-head">
            <span>Ref</span>
            <span>Guest - Space</span>
            <span>When</span>
            <span>Earned</span>
            <span>Status</span>
          </div>
          {ledgerSrc.map((b) => {
            const sm = statusMeta(b.status);
            return (
              <div key={b.id} className="row h-led-grid h-led-row">
                <span className="mono h-led-ref">#{b.id}</span>
                <div className="h-led-guest-cell">
                  <AvatarImg
                    imageKey={b.user.profileImageKey}
                    name={b.user.username}
                    size={30}
                    radius={3}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="h-led-guest truncate">{b.user.username}</div>
                    <div className="mono h-led-space truncate">{b.space.name}</div>
                  </div>
                </div>
                <div className="mono h-led-when">
                  <div>{fmtDate(b.startTime)}</div>
                  <div className="h-led-when-sub">{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
                <span className="mono h-led-keep">{fmtPrice(net(b.totalPrice))}</span>
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
