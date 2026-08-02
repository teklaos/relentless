"use client";

import "./Admin.css";
import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchAdminBookings, fetchSpaces } from "@/lib/api";
import { AdminUser, Booking, Space, WalletTransaction } from "@/data/types";
import { fmtPrice, buildEarningsBars, HOST_KEEP_RATE } from "@/data/format";

const PAID_STATUSES = new Set(["CONFIRMED", "COMPLETED"]);

export default function Statistics() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
    fetchAdminBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
    fetchSpaces()
      .then(setSpaces)
      .catch(() => setSpaces([]));
  }, []);

  const paidBookings = bookings.filter((b) => PAID_STATUSES.has(b.status));
  const grossVolume = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const platformRevenue = grossVolume * (1 - HOST_KEEP_RATE);
  const totalUsers = users.filter((u) => u.role === "USER").length;
  const totalHosts = users.filter((u) => u.role === "HOST").length;

  const kpis = [
    { label: "Money transferred", value: fmtPrice(grossVolume) },
    { label: "Platform revenue", value: fmtPrice(platformRevenue) },
    { label: "Paid bookings", value: String(paidBookings.length) },
    { label: "Users", value: String(totalUsers) },
    { label: "Hosts", value: String(totalHosts) },
    { label: "Active spaces", value: String(spaces.length) }
  ];

  const trendTxs: WalletTransaction[] = paidBookings.map((b) => ({
    id: b.id,
    amount: b.totalPrice,
    type: "CREDIT",
    createdAt: b.startTime,
    bookingId: b.id,
    space: b.space
  }));
  const { hasEarnings, earningsBars } = buildEarningsBars(trendTxs);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Statistics.</h1>
      </div>

      <div className="kpis a-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <div className="kpi-value">{k.value}</div>
            <div className="eyebrow kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <span className="eyebrow">Revenue - 6 months</span>
        </div>
        <div className="chart-wrap">
          <div className="bars" style={{ height: 130, gap: 14 }}>
            {earningsBars.map((b) => (
              <div key={b.m} className="bar-col" style={{ gap: 9 }}>
                {hasEarnings && <div className="mono bar-v">{b.full}</div>}
                <div
                  className={hasEarnings ? "bar" : "bar bar-ghost"}
                  style={{ height: b.h, background: hasEarnings ? b.fill : undefined }}
                />
                <div className="mono bar-mon">{b.m}</div>
              </div>
            ))}
          </div>
          {!hasEarnings && (
            <div className="chart-empty">
              <span>No paid bookings yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
