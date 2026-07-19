"use client";

import "./Bookings.css";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { BookingTab, useHost } from "@/context/HostContext";
import { DAYS, fmtDate, initials, fmtPrice, net, statusMeta } from "@/data/format";

const tabDefs: [BookingTab, string][] = [
  ["upcoming", "Upcoming"],
  ["past", "Past"]
];

const WEEK = ["2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];

export default function Bookings() {
  const host = useHost();
  const bt = host.bookingTab;
  const bv = host.bookingView;

  const upB = host.bookings.filter((b) => b.status === "CONFIRMED").sort((a, b) => a.date.localeCompare(b.date));
  const pastB = host.bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED")
    .sort((a, b) => b.date.localeCompare(a.date));
  const counts: Record<BookingTab, number> = {
    upcoming: upB.length,
    past: pastB.length
  };

  const ledgerSrc = bt === "past" ? pastB : upB;
  const showLedger = bv === "list";
  const showCalendar = bv === "calendar";

  const weekDays = WEEK.map((d) => {
    const dt = new Date(d + "T00:00:00");
    const items = host.bookings
      .filter((b) => b.date === d && b.status !== "CANCELLED")
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((b) => ({
        id: b.id,
        time: b.start,
        space: host.spaceName(b.spaceId),
        guest: b.username.split(" ")[0]
      }));
    return {
      dow: DAYS[dt.getDay()],
      day: String(dt.getDate()).padStart(2, "0"),
      items
    };
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings.</h1>
      </div>

      <div className="h-book-bar">
        <div className="h-tabs">
          {tabDefs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => host.setBookingTab(key)}
              className={`mono h-tab ${bt === key ? "active" : ""}`}
            >
              {label}
              <span className="h-tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>
        <div className="h-seg">
          <button
            onClick={() => host.setBookingView("list")}
            className={`mono h-seg-btn ${bv === "list" ? "active" : ""}`}
          >
            List
          </button>
          <button
            onClick={() => host.setBookingView("calendar")}
            className={`mono h-seg-btn ${bv === "calendar" ? "active" : ""}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {showLedger &&
        (ledgerSrc.length === 0 ? (
          <div className="h-led-empty">Nothing here yet.</div>
        ) : (
          <div>
            <div className="mono h-led-grid h-led-head">
              <span>Ref</span>
              <span>Guest · Space</span>
              <span>When</span>
              <span>Earned</span>
              <span>Status</span>
            </div>
            {ledgerSrc.map((b) => {
              const sm = statusMeta(b.status);
              return (
                <div key={b.id} className="h-row h-led-grid h-led-row">
                  <span className="mono h-led-ref">#{b.id}</span>
                  <div className="h-led-guest-cell">
                    <AvatarImg
                      imageKey={b.profileImageKey}
                      name={b.username}
                      size={30}
                      radius={3}
                      style={{ flexShrink: 0 }}
                      fallback={
                        <div className="mono h-avatar-box" style={{ width: 30, height: 30, fontSize: 10 }}>
                          {initials(b.username)}
                        </div>
                      }
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="h-led-guest h-truncate">{b.username}</div>
                      <div className="mono h-led-space h-truncate">{host.spaceName(b.spaceId)}</div>
                    </div>
                  </div>
                  <div className="mono h-led-when">
                    <div>{fmtDate(b.date)}</div>
                    <div className="h-led-when-sub">
                      {b.start}–{b.end}
                    </div>
                  </div>
                  <span className="mono h-led-keep">{fmtPrice(net(b.totalPrice))}</span>
                  <span className="mono h-led-status" style={{ color: sm.fg }}>
                    <span className="h-led-dot" style={{ background: sm.dot }} />
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

      {showCalendar && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Week of 29 Jun – 5 Jul 2026
          </div>
          <div className="h-cal-grid">
            {weekDays.map((d) => (
              <div key={d.dow + d.day} className="h-cal-day">
                <div className="h-cal-day-head">
                  <span className="mono h-cal-dow">{d.dow}</span>
                  <span className="mono h-cal-daynum">{d.day}</span>
                </div>
                <div className="h-cal-day-body">
                  {d.items.map((it) => (
                    <div key={it.id} className="h-cal-ev">
                      <div className="mono h-cal-ev-time">{it.time}</div>
                      <div className="h-cal-ev-space h-truncate">{it.space}</div>
                      <div className="mono h-cal-ev-guest">{it.guest}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
