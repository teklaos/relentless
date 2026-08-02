"use client";

import "./Host.css";
import "./Dashboard.css";
import { useRouter } from "next/navigation";
import { Plus, Calendar } from "lucide-react";
import { useHost } from "@/context/HostContext";
import { dayNum, fmtTimeRange, fmtPrice, monShort, buildEarningsBars } from "@/data/format";

export default function Dashboard() {
  const host = useHost();
  const router = useRouter();

  const live = host.spaces.filter((s) => s.status === "ACTIVE");
  const rated = live.filter((s) => s.reviewCount > 0);
  const avgR = (rated.reduce((a, s) => a + s.rating, 0) / Math.max(rated.length, 1)).toFixed(1);

  const kpis = [
    { label: "Balance", value: fmtPrice(host.walletBalance) },
    { label: "Live listings", value: String(live.length) },
    { label: "Avg rating", value: avgR }
  ];

  const { hasEarnings, earningsBars } = buildEarningsBars(host.walletTransactions);

  const confirmed = host.bookings
    .filter((b) => b.status === "CONFIRMED")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
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

      <div className="kpis host-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-value">{k.value}</div>
            <div className="eyebrow kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="h-sections">
        <div className="card" style={{ padding: 18 }}>
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <span className="eyebrow">Earnings - 6 months</span>
            <span onClick={() => router.push("/wallet")} className="mono h-panel-link">
              Details →
            </span>
          </div>
          <div className="chart-wrap">
            <div className="bars" style={{ height: 96, gap: 9 }}>
              {earningsBars.map((b) => (
                <div key={b.m} className="bar-col" style={{ gap: 7 }}>
                  <div
                    title={hasEarnings ? b.full : undefined}
                    className={hasEarnings ? "bar" : "bar bar-ghost"}
                    style={{ height: b.h, background: hasEarnings ? b.fill : undefined }}
                  />
                  <div className="mono h-bar-m">{b.m}</div>
                </div>
              ))}
            </div>
            {!hasEarnings && (
              <div className="chart-empty">
                <span>Your first booking starts the climb.</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="h-panel-head">
            <span className="h-panel-name">Next up</span>
            <button onClick={() => router.push("/bookings")} className="eyebrow h-link">
              All →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty h-empty-plain">
              <div className="empty-icon">
                <Calendar size={20} />
              </div>
              <div className="empty-h">No upcoming bookings</div>
              <div className="empty-p">When a guest books your space, it shows up here.</div>
            </div>
          ) : (
            upcoming.map((u) => (
              <div key={u.id} className="h-up-row">
                <div className="mono h-up-date">
                  <div className="h-up-day">{dayNum(u.startTime.slice(0, 10))}</div>
                  <div className="h-up-mon">{monShort(u.startTime.slice(0, 10))}</div>
                </div>
                <div className="h-up-div" />
                <div className="h-up-main">
                  <div className="h-up-name truncate">{u.space.name}</div>
                  <div className="mono h-up-meta">
                    {fmtTimeRange(u.startTime, u.endTime)} - {u.user.username}
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
