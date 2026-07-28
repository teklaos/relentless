"use client";

import "./Dashboard.css";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useHost } from "@/context/HostContext";
import { dayNum, money, monShort, earningsByMonth } from "@/data/format";

export default function Dashboard() {
  const host = useHost();
  const router = useRouter();

  const live = host.spaces.filter((s) => s.status === "ACTIVE");
  const rated = live.filter((s) => s.reviewCount > 0);
  const avgR = (rated.reduce((a, s) => a + s.rating, 0) / Math.max(rated.length, 1)).toFixed(1);

  const kpis = [
    { label: "Balance", value: money(host.walletBalance) },
    { label: "Live listings", value: String(live.length) },
    { label: "Avg rating", value: avgR }
  ];

  const buckets = earningsByMonth(host.walletTransactions);
  const maxE = Math.max(1, ...buckets.map((b) => b.total));
  const earningsBars = buckets.map((b, i) => ({
    m: b.m,
    full: money(b.total),
    h: Math.round((b.total / maxE) * 100) + "%",
    fill: i === buckets.length - 1 ? "var(--accent)" : "var(--hairline-strong)"
  }));

  const confirmed = host.bookings.filter((b) => b.status === "CONFIRMED").sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = confirmed.slice(0, 3);

  return (
    <div>
      <div className="page-header host-head" style={{ marginBottom: 18 }}>
        <h1 className="page-title">Evening, host.</h1>
        <button className="btn primary" onClick={() => router.push("/listings/new")}>
          <Plus size={14} /> New listing
        </button>
      </div>
      <div className="h-intro">
        You have <span className="h-accent">{confirmed.length} upcoming bookings</span>.
      </div>

      <div className="h-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="h-kpi">
            <div className="eyebrow h-kpi-label">{k.label}</div>
            <div className="h-kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="h-sections">
        <div className="h-card" style={{ padding: 18 }}>
          <div className="h-flex-between" style={{ marginBottom: 18 }}>
            <span className="eyebrow">Earnings - 6 mo</span>
            <span onClick={() => router.push("/wallet")} className="mono h-panel-link">
              Details →
            </span>
          </div>
          <div className="h-bars" style={{ height: 96, gap: 9 }}>
            {earningsBars.map((b) => (
              <div key={b.m} className="h-bar-col" style={{ gap: 7 }}>
                <div title={b.full} className="h-bar" style={{ height: b.h, background: b.fill }} />
                <div className="mono h-bar-m">{b.m}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-card">
          <div className="h-panel-head">
            <span className="h-panel-name">Next up</span>
            <button onClick={() => router.push("/bookings")} className="eyebrow h-link">
              All →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="h-empty-note">No upcoming bookings.</div>
          ) : (
            upcoming.map((u) => (
              <div key={u.id} className="h-up-row">
                <div className="mono h-up-date">
                  <div className="h-up-day">{dayNum(u.date)}</div>
                  <div className="h-up-mon">{monShort(u.date)}</div>
                </div>
                <div className="h-up-div" />
                <div className="h-up-main">
                  <div className="h-up-name h-truncate">{host.spaceName(u.spaceId)}</div>
                  <div className="mono h-up-meta">
                    {u.start}–{u.end} - {u.username}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
