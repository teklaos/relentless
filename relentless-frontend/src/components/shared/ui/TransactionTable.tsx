"use client";

import "./TransactionTable.css";
import { Receipt } from "lucide-react";
import { WalletTransaction } from "@/lib/types";
import { fmtDateNoDow, fmtPrice } from "@/lib/format";

interface TransactionTableProps {
  transactions: WalletTransaction[];
  emptyHeading: string;
  emptyText: string;
}

export default function TransactionTable({ transactions, emptyHeading, emptyText }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Receipt size={20} />
        </div>
        <div className="empty-h">{emptyHeading}</div>
        <div className="empty-p">{emptyText}</div>
      </div>
    );
  }

  return (
    <>
      <div className="mono h-tx-grid h-tx-head">
        <span>Space</span>
        <span>Date</span>
        <span className="h-tx-net-h">Amount</span>
      </div>
      {[...transactions]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((t) => {
          const credit = t.type === "CREDIT";
          return (
            <div key={t.id} className="row h-tx-grid h-tx-row">
              <div style={{ minWidth: 0 }}>
                <div className="h-tx-space truncate">{t.space?.name ?? "—"}</div>
                <div className="mono h-tx-status" style={{ color: credit ? "var(--ok)" : "var(--ink-3)" }}>
                  {t.type}
                </div>
              </div>
              <span className="mono h-tx-date">{fmtDateNoDow(t.createdAt)}</span>
              <span className="mono h-tx-net">
                {credit ? "+" : "−"}
                {fmtPrice(Math.abs(t.amount))}
              </span>
            </div>
          );
        })}
    </>
  );
}
