"use client";

import "./BookingWidget.css";
import { useState, useMemo } from "react";
import {
  Space,
  fmtPrice,
  fmtDateLong,
  fmtDateShort,
  padDate,
  todayStart,
} from "@/data";
import { Check } from "lucide-react";

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MIN_DUR = 0.5;
const MAX_DUR = 24;
const STEP = 0.5;

function fmtDur(d: number): string {
  const h = Math.floor(d);
  const half = d % 1 !== 0;
  if (h === 0) {
    return "30M";
  }
  if (!half) {
    return `${h}H`;
  }
  return `${h}H 30M`;
}

function formatHour(h: number): string {
  const totalMins = Math.round(h * 60);
  const hrs = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  return `${hrs}:${String(mins).padStart(2, "0")}`;
}

interface BookingWidgetProps {
  space: Space;
  onBook: (params: {
    space: Space;
    startIso: string;
    endIso: string;
    total: number;
    duration: number;
  }) => void;
}

export default function BookingWidget({ space, onBook }: BookingWidgetProps) {
  const today = useMemo(() => todayStart(), []);

  const mondayOffset = useMemo(() => {
    const dow = today.getDay();
    return dow === 0 ? 6 : dow - 1;
  }, [today]);

  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i);
      return d;
    });
  }, [today, mondayOffset]);

  const [dateIdx, setDateIdx] = useState(() => mondayOffset);
  const [startHour, setStartHour] = useState(14);
  const [duration, setDuration] = useState(2);

  const unavailable = useMemo(() => {
    const seed = (dateIdx * 7 + space.id) % 11;
    const blocks = new Set<number>();
    [10, 12, 16, 19].forEach((h, i) => {
      if ((seed + i) % 3 === 0) blocks.add(h);
      if ((seed + i) % 4 === 0) blocks.add(h + 1);
    });
    return blocks;
  }, [dateIdx, space.id]);

  const hours = useMemo(() => Array.from({ length: 14 }, (_, i) => 8 + i), []);

  const selectedDate = dates[dateIdx];

  const isStartOK = (h: number) => {
    const hoursSpanned = Math.ceil(duration);
    for (let k = 0; k < hoursSpanned; k++)
      if (unavailable.has(h + k)) return false;
    return true;
  };

  const effectiveStartHour = useMemo(() => {
    const ok = (h: number) => {
      const span = Math.ceil(duration);
      for (let k = 0; k < span; k++) if (unavailable.has(h + k)) return false;
      return true;
    };
    if (ok(startHour)) return startHour;
    return hours.find(ok) ?? startHour;
  }, [startHour, duration, unavailable, hours]);

  const endHourRaw = effectiveStartHour + duration;
  const endHour = endHourRaw % 24;
  const endDayOffset = endHourRaw >= 24 ? 1 : 0;
  const total = space.pricePerHour * duration;

  const startIso = `${padDate(selectedDate)}T${formatHour(effectiveStartHour)}`;
  const endDate = new Date(selectedDate);
  endDate.setDate(endDate.getDate() + endDayOffset);
  const endIso = `${padDate(endDate)}T${formatHour(endHour)}`;

  const inRange = (h: number) =>
    effectiveStartHour !== h && h > effectiveStartHour && h < endHourRaw;

  return (
    <div className="book-card">
      <div className="book-head">
        <div className="book-head-l">
          <span className="book-price">{fmtPrice(space.pricePerHour)}</span>
          <span className="book-price-u">/ hour</span>
        </div>
      </div>

      <div className="book-body">
        <div className="book-label">Select date · 14 days ahead</div>
        <div className="date-strip">
          {dates.slice(0, 7).map((d, i) => {
            const past = d < today;
            const dow = d.getDay();
            const dowIdx = dow === 0 ? 6 : dow - 1;
            return (
              <button
                key={i}
                disabled={past}
                className={`date-cell ${dateIdx === i ? "active" : ""} ${past ? "past" : ""}`}
                onClick={() => !past && setDateIdx(i)}
              >
                <div className="dow">{DOW[dowIdx]}</div>
                <div className="day">{d.getDate()}</div>
              </button>
            );
          })}
        </div>

        <div className="book-label">Duration · 30 min – 24 hr</div>
        <div className="dur-stepper">
          <button
            className="dur-step-btn"
            onClick={() =>
              setDuration((d) => Math.max(MIN_DUR, +(d - STEP).toFixed(1)))
            }
            disabled={duration <= MIN_DUR}
          >
            −
          </button>
          <div className="dur-step-val">
            <div className="h">{fmtDur(duration)}</div>
            <div className="l">{fmtPrice(space.pricePerHour * duration)}</div>
          </div>
          <button
            className="dur-step-btn"
            onClick={() =>
              setDuration((d) => Math.min(MAX_DUR, +(d + STEP).toFixed(1)))
            }
            disabled={duration >= MAX_DUR}
          >
            +
          </button>
        </div>

        <div className="book-label">
          Start time · {fmtDateLong(padDate(selectedDate))}
        </div>
        <div className="time-grid">
          {hours.map((h) => {
            const ok = isStartOK(h);
            return (
              <button
                key={h}
                disabled={!ok}
                className={`time-cell ${!ok ? "unavailable" : ""} ${effectiveStartHour === h ? "active" : ""} ${inRange(h) ? "range" : ""}`}
                onClick={() => ok && setStartHour(h)}
              >
                {formatHour(h)}
              </button>
            );
          })}
        </div>

        <div className="summary">
          <div className="summary-row">
            <span>
              {fmtPrice(space.pricePerHour)} × {fmtDur(duration)}
            </span>
            <span>{fmtPrice(total)}</span>
          </div>
          <div className="summary-row">
            <span>Service fee</span>
            <span>{fmtPrice(0)}</span>
          </div>
          <div className="summary-row">
            <span>
              {formatHour(effectiveStartHour)} — {formatHour(endHour)}
              {endDayOffset > 0 ? " +1d" : ""}
            </span>
            <span>{fmtDateShort(padDate(selectedDate))}</span>
          </div>
          <div className="summary-row total">
            <span>TOTAL</span>
            <span className="v">{fmtPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="book-foot">
        <button
          className="btn accent block lg"
          onClick={() => onBook({ space, startIso, endIso, total, duration })}
        >
          <Check size={16} /> CONFIRM BOOKING
        </button>
      </div>
    </div>
  );
}
