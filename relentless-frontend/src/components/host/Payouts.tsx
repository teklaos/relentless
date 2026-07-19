"use client";

import "./Payouts.css";
import { useHost } from "@/context/HostContext";
import { fmtDate, money, fmtPrice, net, statusMeta } from "@/data/format";

export default function Payouts() {
  const host = useHost();
  const availGross = 2168;
  const availNet = net(availGross);

  const ev = [3200, 4100, 3850, 5200, 4750, 7180].map((g) => net(g));
  const maxE = Math.max(...ev);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
  const earningsBars = ev.map((v, i) => ({
    m: months[i],
    full: money(v),
    h: Math.round((v / maxE) * 100) + "%",
    fill: i === ev.length - 1 ? "var(--accent)" : "var(--hairline-strong)"
  }));

  const txSrc = host.bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .sort((a, b) => b.date.localeCompare(a.date));
  const transactions = txSrc.map((b) => {
    const sm = statusMeta(b.status);
    return {
      id: b.id,
      date: fmtDate(b.date),
      space: host.spaceName(b.spaceId),
      netLabel: fmtPrice(net(b.totalPrice)),
      status: b.status,
      statusFg: sm.fg,
      statusDot: sm.dot
    };
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your earnings.</h1>
      </div>

      <div className="h-payout-grid">
        <div className="h-withdraw">
          <div>
            <div className="mono h-withdraw-label">Available to withdraw</div>
            <div className="h-withdraw-amt">{fmtPrice(availNet)}</div>
          </div>
          <button onClick={() => host.withdraw(availNet)} className="h-withdraw-btn">
            Withdraw to bank
          </button>
        </div>
        <div className="h-card" style={{ padding: 22 }}>
          <div className="h-flex-between" style={{ marginBottom: 20 }}>
            <span className="h-panel-title-lg">Earnings</span>
            <span className="eyebrow">Last 6 months</span>
          </div>
          <div className="h-bars" style={{ height: 130, gap: 14 }}>
            {earningsBars.map((b) => (
              <div key={b.m} className="h-bar-col" style={{ gap: 9 }}>
                <div className="mono h-bar-v">{b.full}</div>
                <div className="h-bar" style={{ height: b.h, background: b.fill }} />
                <div className="mono h-bar-mon">{b.m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 12 }}>
        Transactions
      </div>
      <div className="mono h-tx-grid h-tx-head">
        <span>Ref</span>
        <span>Date</span>
        <span>Space</span>
        <span className="h-tx-net-h">Earned</span>
      </div>
      {transactions.map((t) => (
        <div key={t.id} className="h-row h-tx-grid h-tx-row">
          <span className="mono h-tx-ref">#{t.id}</span>
          <span className="mono h-tx-date">{t.date}</span>
          <div style={{ minWidth: 0 }}>
            <div className="h-tx-space h-truncate">{t.space}</div>
            <div className="mono h-tx-status" style={{ color: t.statusFg }}>
              <span className="h-tx-dot" style={{ background: t.statusDot }} />
              {t.status}
            </div>
          </div>
          <span className="mono h-tx-net">{t.netLabel}</span>
        </div>
      ))}
    </div>
  );
}
