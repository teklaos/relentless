"use client";

import "./History.css";
import { useState } from "react";
import Image from "next/image";
import Placeholder from "@/components/shared/ui/Placeholder";
import { imageUrl } from "@/lib/api";
import { Booking } from "@/data/types";
import { fmtDateLong, fmtTimeRange, fmtPrice } from "@/data/format";
import { Calendar, Star, Check } from "lucide-react";

const STATUS_CLS: Record<string, string> = {
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

interface HistoryProps {
  bookings: Booking[];
  onLeaveReview: (booking: Booking) => void;
  onOpenSpace: (id: number) => void;
}

export default function History({ bookings, onLeaveReview, onOpenSpace }: HistoryProps) {
  const [tab, setTab] = useState<"UPCOMING" | "PAST" | "ALL">("UPCOMING");
  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.startTime) >= now && b.status !== "CANCELLED");
  const past = bookings.filter((b) => new Date(b.startTime) < now || b.status === "CANCELLED");

  const list = tab === "UPCOMING" ? upcoming : tab === "PAST" ? past : bookings;
  const sorted = [...list].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings ledger.</h1>
      </div>

      <div className="history-tabs">
        {(
          [
            ["UPCOMING", upcoming.length],
            ["PAST", past.length],
            ["ALL", bookings.length]
          ] as [string, number][]
        ).map(([k, ct]) => (
          <button
            key={k}
            className={`history-tab ${tab === k ? "active" : ""}`}
            onClick={() => setTab(k as "UPCOMING" | "PAST" | "ALL")}
          >
            {k}
            <span className="ct">{ct}</span>
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
            {tab === "PAST"
              ? "Completed and cancelled bookings show up here."
              : "When you book a space, it shows up here."}
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
