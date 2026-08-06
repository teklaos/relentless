"use client";

import "./Admin.css";
import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchAdminTransactions, fetchSpaces } from "@/lib/api";
import { AdminUser, AdminTransaction, Space, WalletTransaction } from "@/lib/types";
import { fmtPrice, buildEarningsBars } from "@/lib/format";

export default function Statistics() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
    fetchAdminTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));
    fetchSpaces()
      .then(setSpaces)
      .catch(() => setSpaces([]));
  }, []);

  const credits = transactions.filter((t) => t.type === "CREDIT");
  const grossVolume = credits.reduce((sum, t) => sum + (t.totalPrice ?? 0), 0);
  const platformRevenue = credits.reduce((sum, t) => sum + ((t.totalPrice ?? 0) - t.amount), 0);
  const totalUsers = users.filter((u) => u.role === "USER").length;
  const totalHosts = users.filter((u) => u.role === "HOST").length;

  const kpis = [
    { label: "Total volume", value: fmtPrice(grossVolume) },
    { label: "Platform revenue", value: fmtPrice(platformRevenue) },
    { label: "Paid bookings", value: String(credits.length) },
    { label: "Users", value: String(totalUsers) },
    { label: "Hosts", value: String(totalHosts) },
    { label: "Active spaces", value: String(spaces.length) }
  ];

  const trendTxs: WalletTransaction[] = credits.map((t) => ({
    id: t.id,
    amount: t.totalPrice ?? 0,
    type: "CREDIT",
    createdAt: t.createdAt,
    bookingId: null,
    space: null
  }));
  const { hasEarnings, earningsBars } = buildEarningsBars(trendTxs);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard.</h1>
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
