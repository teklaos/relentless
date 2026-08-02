"use client";

import "./Wallet.css";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useHost } from "@/context/HostContext";
import { debitWallet } from "@/lib/api";
import { fmtPrice, buildEarningsBars } from "@/data/format";
import TransactionTable from "@/components/shared/ui/TransactionTable";

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

  const { hasEarnings, earningsBars } = buildEarningsBars(txs);

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
        <div className="card" style={{ padding: 22 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Earnings - 6 months</span>
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
                <span>Your first booking starts the climb.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 12 }}>
        Transactions
      </div>
      <TransactionTable
        transactions={txs}
        emptyHeading="No transactions yet"
        emptyText="Payouts and charges show up here."
      />
    </div>
  );
}
