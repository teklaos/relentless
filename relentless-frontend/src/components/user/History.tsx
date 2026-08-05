"use client";

import "./History.css";
import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import ThumbImg from "@/components/shared/ui/ThumbImg";
import { Booking } from "@/lib/types";
import { BOOKING_TABS, bookingsForTab, type BookingTab } from "@/lib/bookings";
import { DAYS, fmtDateNoDow, fmtTimeRange, fmtPrice, statusMeta } from "@/lib/format";
import { Calendar, Star, Check, MoreVertical, CreditCard } from "lucide-react";

interface HistoryProps {
  bookings: Booking[];
  onLeaveReview: (booking: Booking) => void;
  onPayBooking: (booking: Booking) => void;
  onOpenSpace: (id: number) => void;
}

export default function History({ bookings, onLeaveReview, onPayBooking, onOpenSpace }: HistoryProps) {
  const [tab, setTab] = useState<BookingTab>("upcoming");
  const [menuBooking, setMenuBooking] = useState<Booking | null>(null);

  const sorted = bookingsForTab(bookings, tab);
  const counts = Object.fromEntries(
    BOOKING_TABS.map(({ key }) => [key, bookingsForTab(bookings, key).length])
  ) as Record<BookingTab, number>;
  const activeLabel = BOOKING_TABS.find((t) => t.key === tab)?.label ?? "";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings ledger.</h1>
      </div>

      <div className="list-toolbar">
        <div className="tabs">
          {BOOKING_TABS.map(({ key, label }) => (
            <button key={key} className={`mono tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
              {label.toUpperCase()}
              <span className={`tab-count ${counts[key] === 0 ? "zero" : ""}`}>{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Calendar size={20} />
          </div>
          <div className="empty-h">No {tab === "all" ? "" : `${activeLabel.toLowerCase()} `}bookings</div>
          <div className="empty-p">
            {tab === "upcoming" || tab === "all"
              ? "When you book a space, it shows up here."
              : `${activeLabel} bookings show up here.`}
          </div>
        </div>
      ) : (
        <div>
          <div className="booking-row head">
            <span>SPACE</span>
            <span>WHEN</span>
            <span>TOTAL</span>
            <span>STATUS</span>
            <span className="br-action-h">ACTIONS</span>
          </div>
          {sorted.map((b) => {
            const sp = b.space;
            const sm = statusMeta(b.status);
            return (
              <div key={b.id} className="booking-row" onClick={() => onOpenSpace(sp.id)}>
                <div className="br-space">
                  <ThumbImg imageKey={sp.coverImageKey} className="br-thumb" imgClassName="br-thumb-img" />
                  <div className="br-info" style={{ minWidth: 0 }}>
                    <div className="br-title">{sp.name}</div>
                    <div className="br-cat">
                      {sp.categoryName} - {sp.city}
                    </div>
                  </div>
                </div>
                <div className="br-when">
                  <div className="br-date">
                    <span className="br-dow">{DAYS[new Date(b.startTime).getDay()]} </span>
                    {fmtDateNoDow(b.startTime)}
                  </div>
                  <div className="br-time">{fmtTimeRange(b.startTime, b.endTime)}</div>
                </div>
                <span className="br-price">{fmtPrice(b.totalPrice)}</span>
                <span className="br-status" style={{ color: sm.fg }}>
                  <span className="dot" style={{ background: sm.dot }} />
                  {b.status}
                </span>
                <span className="br-action">
                  {b.status === "PENDING" && (
                    <button
                      className="btn sm accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPayBooking(b);
                      }}
                    >
                      <CreditCard size={12} />
                      <span className="pay-label-full">PROCEED TO PAYMENT</span>
                      <span className="pay-label-short">PROCEED</span>
                    </button>
                  )}
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
                <button
                  className="br-menu"
                  aria-label="Actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuBooking(b);
                  }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {menuBooking && (
        <Modal onClose={() => setMenuBooking(null)}>
          <div className="br-menu-preview">
            <ThumbImg imageKey={menuBooking.space.coverImageKey} className="br-thumb" imgClassName="br-thumb-img" />
            <div className="br-title">{menuBooking.space.name}</div>
          </div>
          <div className="br-menu-h">ACTIONS</div>
          <div className="br-menu-actions">
            {menuBooking.status === "COMPLETED" && !menuBooking.reviewed && (
              <button
                className="btn"
                onClick={() => {
                  onLeaveReview(menuBooking);
                  setMenuBooking(null);
                }}
              >
                <Star size={14} /> LEAVE REVIEW
              </button>
            )}
            {menuBooking.status === "COMPLETED" && menuBooking.reviewed && (
              <div className="mono br-menu-note">
                <Check size={14} /> Already reviewed
              </div>
            )}
            {menuBooking.status === "CANCELLED" && <div className="mono br-menu-note">Booking cancelled</div>}
            {menuBooking.status === "PENDING" && (
              <button
                className="btn accent"
                onClick={() => {
                  onPayBooking(menuBooking);
                  setMenuBooking(null);
                }}
              >
                <CreditCard size={14} /> PROCEED TO PAYMENT
              </button>
            )}
            {menuBooking.status === "CONFIRMED" && <div className="mono br-menu-note">No actions available</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
