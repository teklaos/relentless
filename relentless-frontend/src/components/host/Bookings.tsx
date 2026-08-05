"use client";

import "./Bookings.css";
import { Calendar } from "lucide-react";
import ThumbImg from "@/components/shared/ui/ThumbImg";
import { useHost } from "@/context/HostContext";
import { BOOKING_TABS, bookingsForTab, type BookingTab } from "@/lib/bookings";
import { DAYS, fmtDateNoDow, fmtTimeRange, fmtPrice, net, statusMeta } from "@/lib/format";

export default function Bookings() {
  const host = useHost();
  const bt = host.bookingTab;

  const counts = Object.fromEntries(
    BOOKING_TABS.map(({ key }) => [key, bookingsForTab(host.bookings, key).length])
  ) as Record<BookingTab, number>;

  const ledgerSrc = bookingsForTab(host.bookings, bt);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings.</h1>
      </div>

      <div className="list-toolbar">
        <div className="tabs">
          {BOOKING_TABS.map(({ key, label }) => (
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
          <div className="empty-h">{bt === "upcoming" ? "No bookings yet" : `No ${bt} bookings`}</div>
          <div className="empty-p">
            {bt === "upcoming"
              ? "When a guest books your space, it shows up here."
              : `${BOOKING_TABS.find((t) => t.key === bt)?.label} bookings show up here.`}
          </div>
        </div>
      ) : (
        <div>
          <div className="mono h-led-grid h-led-head">
            <span>Space</span>
            <span>When</span>
            <span>Earned</span>
            <span className="h-led-status-h">Status</span>
          </div>
          {ledgerSrc.map((b) => {
            const sm = statusMeta(b.status);
            return (
              <div key={b.id} className="row h-led-grid h-led-row">
                <div className="h-led-space">
                  <ThumbImg imageKey={b.space.coverImageKey} className="h-led-thumb" imgClassName="h-led-thumb-img" />
                  <div className="h-led-info" style={{ minWidth: 0 }}>
                    <div className="h-led-title">{b.space.name}</div>
                    <div className="h-led-sub">
                      {b.space.categoryName} - {b.space.city}
                    </div>
                  </div>
                </div>
                <div className="mono h-led-when">
                  <div className="h-led-date">
                    <span className="h-led-dow">{DAYS[new Date(b.startTime).getDay()]} </span>
                    {fmtDateNoDow(b.startTime)}
                  </div>
                  <div className="h-led-when-sub">{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
                <span className="mono h-led-keep">{fmtPrice(net(b.totalPrice))}</span>
                <span className="mono badge h-led-status" style={{ color: sm.fg }}>
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
