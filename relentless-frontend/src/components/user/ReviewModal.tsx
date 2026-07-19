"use client";

import "./ReviewModal.css";
import { useState } from "react";
import { Booking } from "@/data/types";
import { fmtDateShort } from "@/data/format";
import { Star, Check } from "lucide-react";

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmit: (params: { rating: number; comment: string }) => void;
}

export default function ReviewModal({ booking, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const sp = booking.space;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-h">Leave a review</h3>
        <div className="modal-sub">
          {sp.name} · {fmtDateShort(booking.startTime)}
        </div>

        <div className="book-label">RATING · 1 TO 5</div>
        <div className="rating-pick">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`rating-star ${n <= (hover || rating) ? "on" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              <Star size={16} fill="currentColor" strokeWidth={0} />
            </button>
          ))}
          <span
            className="mono"
            style={{
              alignSelf: "center",
              marginLeft: 10,
              color: "var(--ink-3)",
              fontSize: 12
            }}
          >
            {rating}.0 / 5.0
          </span>
        </div>

        <div className="book-label" style={{ marginTop: 12 }}>
          COMMENT · {comment.length} / 255
        </div>
        <textarea
          maxLength={255}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was good? What could be better? Be specific — future renters rely on this."
        />

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            CANCEL
          </button>
          <button className="btn primary" disabled={!comment.trim()} onClick={() => onSubmit({ rating, comment })}>
            <Check size={14} /> SUBMIT REVIEW
          </button>
        </div>
      </div>
    </div>
  );
}
