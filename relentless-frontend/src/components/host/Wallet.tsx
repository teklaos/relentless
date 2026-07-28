"use client";

import "./Wallet.css";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useHost } from "@/context/HostContext";
import { debitWallet } from "@/lib/api";
import { fmtDate, money, fmtPrice, earningsByMonth } from "@/data/format";

export default function Wallet() {
  const { showToast } = useApp();
  const host = useHost();
  const balance = host.walletBalance;
  const txs = host.walletTransactions;
  const [withdrawing, setWithdrawing] = useState(false);

  const withdraw = async () => {
    if (balance <= 0 || withdrawing) return;
    setWithdrawing(true);
    try {
      await debitWallet(balance);
      showToast(`WITHDRAWAL OF ${fmtPrice(balance)} INITIATED`);
      host.refreshWallet();
    } catch {
      showToast("WITHDRAWAL FAILED");
    } finally {
      setWithdrawing(false);
    }
  };

  const buckets = earningsByMonth(txs);
  const maxE = Math.max(1, ...buckets.map((b) => b.total));
  const earningsBars = buckets.map((b, i) => ({
    m: b.m,
    full: money(b.total),
    h: Math.round((b.total / maxE) * 100) + "%",
    fill: i === buckets.length - 1 ? "var(--accent)" : "var(--hairline-strong)"
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your earnings.</h1>
      </div>

      <div className="h-wallet-grid">
        <div className="h-withdraw">
          <div>
            <div className="mono h-withdraw-label">Available to withdraw</div>
            <div className="h-withdraw-amt">{fmtPrice(balance)}</div>
          </div>
          <button onClick={withdraw} disabled={balance <= 0 || withdrawing} className="h-withdraw-btn">
            {withdrawing ? "Processing…" : "Withdraw to bank"}
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
        <span className="h-tx-net-h">Amount</span>
      </div>
      {txs.map((t) => {
        const credit = t.type === "CREDIT";
        return (
          <div key={t.id} className="h-row h-tx-grid h-tx-row">
            <span className="mono h-tx-ref">#{t.id}</span>
            <span className="mono h-tx-date">{fmtDate(t.createdAt)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="h-tx-space h-truncate">{t.space?.name ?? "—"}</div>
              <div className="mono h-tx-status" style={{ color: credit ? "var(--ok)" : "var(--ink-3)" }}>
                {t.type}
              </div>
            </div>
            <span className="mono h-tx-net">
              {credit ? "+" : "−"}
              {fmtPrice(Math.abs(t.amount))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
