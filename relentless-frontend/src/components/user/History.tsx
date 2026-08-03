"use client";

import "./History.css";
import { useState } from "react";
import Image from "next/image";
import Placeholder from "@/components/shared/ui/Placeholder";
import { imageUrl } from "@/lib/api";
import { Booking, BookingStatus } from "@/lib/types";
import { fmtDateLong, fmtTimeRange, fmtPrice } from "@/lib/format";
import { Calendar, Star, Check } from "lucide-react";

const STATUS_CLS: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

type HistoryTab = "UPCOMING" | "PAST" | "PENDING" | "CANCELLED" | "ALL";

const TAB_STATUS: Partial<Record<HistoryTab, BookingStatus>> = {
  UPCOMING: "CONFIRMED",
  PAST: "COMPLETED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED"
};

interface HistoryProps {
  bookings: Booking[];
  onLeaveReview: (booking: Booking) => void;
  onOpenSpace: (id: number) => void;
}

export default function History({ bookings, onLeaveReview, onOpenSpace }: HistoryProps) {
  const [tab, setTab] = useState<HistoryTab>("UPCOMING");

  const byTab = (t: HistoryTab) => {
    const status = TAB_STATUS[t];
    const list = status ? bookings.filter((b) => b.status === status) : bookings;
    return [...list].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  };

  const sorted = byTab(tab);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings ledger.</h1>
      </div>

      <div className="history-tabs">
        {(["UPCOMING", "PAST", "PENDING", "CANCELLED", "ALL"] as HistoryTab[]).map((k) => (
          <button key={k} className={`history-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            {k}
            <span className="ct">{byTab(k).length}</span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Calendar size={20} />
          </div>
          <div className="empty-h">No {tab === "ALL" ? "" : `${tab.toLowerCase()} `}bookings</div>
          <div className="empty-p">
            {tab === "UPCOMING" || tab === "ALL"
              ? "When you book a space, it shows up here."
              : `${tab.charAt(0)}${tab.slice(1).toLowerCase()} bookings show up here.`}
          </div>
        </div>
      ) : (
        <div>
          <div className="booking-row head">
            <span>REF</span>
            <span></span>
            <span>SPACE</span>
            <span>WHEN</span>
            <span>TOTAL</span>
            <span>STATUS</span>
            <span></span>
          </div>
          {sorted.map((b) => {
            const sp = b.space;
            return (
              <div key={b.id} className="booking-row" onClick={() => onOpenSpace(sp.id)}>
                <span className="br-id">#{b.id}</span>
                <div className="br-thumb">
                  <Placeholder />
                  {sp.coverImageKey && (
                    <Image
                      src={imageUrl(sp.coverImageKey)}
                      alt=""
                      fill
                      sizes="64px"
                      className="br-thumb-img"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
                <div>
                  <div className="br-title">{sp.name}</div>
                  <div className="br-cat">
                    {sp.categoryName} - {sp.city}
                  </div>
                </div>
                <div className="br-when">
                  <div>{fmtDateLong(b.startTime)}</div>
                  <div className="t">{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
                <span className="br-price">{fmtPrice(b.totalPrice)}</span>
                <span className={`br-status ${STATUS_CLS[b.status]}`}>
                  <span className="dot"></span>
                  {b.status}
                </span>
                <span className="br-action">
                  {b.status === "COMPLETED" && !b.reviewed && (
                    <button
                      className="btn sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeaveReview(b);
                      }}
                    >
                      <Star size={12} /> REVIEW
                    </button>
                  )}
                  {b.status === "COMPLETED" && b.reviewed && (
                    <span
                      style={{
                        fontFamily: "'Geist Mono',monospace",
                        fontSize: 10,
                        color: "var(--accent-ink)",
                        letterSpacing: "0.08em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Check size={11} /> REVIEWED
                    </span>
                  )}
                  {b.status === "CANCELLED" && (
                    <button className="btn sm ghost" disabled>
                      CANCELLED
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
