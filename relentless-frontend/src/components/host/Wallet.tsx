"use client";

import "./Wallet.css";
import { useState } from "react";
import { Receipt } from "lucide-react";
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
  const hasEarnings = buckets.some((b) => b.total > 0);
  const maxE = Math.max(1, ...buckets.map((b) => b.total));
  const ghost = [22, 34, 30, 52, 68, 90];
  const earningsBars = buckets.map((b, i) => ({
    m: b.m,
    full: money(b.total),
    h: (hasEarnings ? Math.round((b.total / maxE) * 100) : ghost[i]) + "%",
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
            <div className="mono h-withdraw-label">Balance</div>
            <div className="h-withdraw-amt">{fmtPrice(balance)}</div>
          </div>
          <button onClick={withdraw} disabled={balance <= 0 || withdrawing} className="h-withdraw-btn">
            {withdrawing ? "Processing…" : "Withdraw"}
          </button>
        </div>
        <div className="h-card" style={{ padding: 22 }}>
          <div className="h-flex-between" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Earnings - 6 months</span>
          </div>
          <div className="h-chart-wrap">
            <div className="h-bars" style={{ height: 130, gap: 14 }}>
              {earningsBars.map((b) => (
                <div key={b.m} className="h-bar-col" style={{ gap: 9 }}>
                  {hasEarnings && <div className="mono h-bar-v">{b.full}</div>}
                  <div
                    className={hasEarnings ? "h-bar" : "h-bar h-bar-ghost"}
                    style={{ height: b.h, background: hasEarnings ? b.fill : undefined }}
                  />
                  <div className="mono h-bar-mon">{b.m}</div>
                </div>
              ))}
            </div>
            {!hasEarnings && (
              <div className="h-chart-empty">
                <span>Your first booking starts the climb.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 12 }}>
        Transactions
      </div>
      {txs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Receipt size={20} />
          </div>
          <div className="empty-h">No transactions yet</div>
          <div className="empty-p">Payouts and charges show up here.</div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
