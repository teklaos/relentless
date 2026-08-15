"use client";

import "./Admin.css";
import "./Transactions.css";
import { useEffect, useState } from "react";
import { Receipt, Landmark } from "lucide-react";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { fetchAdminTransactions } from "@/lib/api";
import { AdminTransaction, UserSummary } from "@/lib/types";
import { fmtDateNoDow, fmtTime, fmtPrice } from "@/lib/format";

const TYPES = ["ALL", "CREDIT", "DEBIT"] as const;
type TypeFilter = (typeof TYPES)[number];

function Party({ user, area }: { user: UserSummary | null; area: "from" | "to" }) {
  return (
    <div className={`a-tx-cell a-tx-${area}`}>
      <AvatarImg
        imageKey={user?.profileImageKey ?? null}
        name={user?.username ?? "—"}
        size={30}
        radius={3}
        style={{ flexShrink: 0 }}
      />
      <span className="a-tx-guest truncate">{user?.username ?? "—"}</span>
    </div>
  );
}

function Withdrawal({ area }: { area: "from" | "to" }) {
  return (
    <div className={`a-tx-cell a-tx-${area}`}>
      <span className="a-tx-bank">
        <Landmark size={15} />
      </span>
      <span className="a-tx-guest truncate">Bank</span>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [filter, setFilter] = useState<TypeFilter>("ALL");

  useEffect(() => {
    fetchAdminTransactions()
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  const counts = Object.fromEntries(
    TYPES.map((t) => [t, t === "ALL" ? transactions.length : transactions.filter((x) => x.type === t).length])
  ) as Record<TypeFilter, number>;
  const rows = transactions
    .filter((t) => filter === "ALL" || t.type === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactions.</h1>
      </div>

      <div className="tabs a-tabs">
        {TYPES.map((key) => (
          <button key={key} onClick={() => setFilter(key)} className={`mono tab ${filter === key ? "active" : ""}`}>
            {key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()}
            <span className="tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Receipt size={20} />
          </div>
          <div className="empty-h">No transactions found</div>
          <div className="empty-p">Wallet credits and withdrawals across the platform show up here.</div>
        </div>
      ) : (
        <div>
          <div className="mono a-tx-grid a-tx-head">
            <span>From</span>
            <span>To</span>
            <span>When</span>
            <span>Amount</span>
            <span className="a-tx-status-h">Type</span>
          </div>
          {rows.map((t) => {
            const credit = t.type === "CREDIT";
            return (
              <div key={t.id} className="row a-tx-grid a-tx-row">
                {credit ? (
                  <>
                    <Party user={t.user} area="from" />
                    <Party user={t.host} area="to" />
                  </>
                ) : (
                  <>
                    <Party user={t.host} area="from" />
                    <Withdrawal area="to" />
                  </>
                )}
                <div className="mono a-tx-when">
                  <div>{fmtDateNoDow(t.createdAt)}</div>
                  <div className="a-tx-time">{fmtTime(t.createdAt)}</div>
                </div>
                <span className="mono a-tx-amount">
                  {credit ? "+" : "−"}
                  {fmtPrice(Math.abs(credit ? (t.totalPrice ?? t.amount) : t.amount))}
                </span>
                <span className="mono badge a-tx-status" style={{ color: credit ? "var(--ok)" : "var(--ink-3)" }}>
                  <span className="badge-dot" style={{ background: credit ? "var(--ok)" : "var(--ink-3)" }} />
                  {t.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
