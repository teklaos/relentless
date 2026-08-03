"use client";

import "./BookingWidget.css";
import { useState, useMemo, useEffect } from "react";
import { fmtPrice, fmtDateShort, todayStart, DOW, MONTHS_FULL } from "@/data/format";
import { fetchAvailability, fetchMonthAvailability } from "@/lib/api";
import { Space, TimeSlot } from "@/data/types";
import { Dropdown } from "@/components/shared/ui/Dropdown";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const slotLength = (s: TimeSlot) => {
  let d = toMinutes(s.endTime) - toMinutes(s.startTime);
  if (d <= 0) d += 24 * 60;
  return d;
};

const fmtT = (t: string) => {
  const [h, m] = t.split(":");
  return `${Number(h)}:${m}`;
};

const fmtDur = (h: number) => {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  if (whole === 0) return `${mins}M`;
  return mins ? `${whole}H ${mins}M` : `${whole}H`;
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface BookingWidgetProps {
  space: Space;
  onBook: (params: { space: Space; startIso: string; endIso: string; total: number; duration: number }) => void;
}

export default function BookingWidget({ space, onBook }: BookingWidgetProps) {
  const today = useMemo(() => todayStart(), []);

  const [selectedDate, setSelectedDate] = useState<Date>(() => todayStart());
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [endIdx, setEndIdx] = useState<number | null>(null);
  const [slotData, setSlotData] = useState<{ month: string; days: Set<string> } | null>(null);

  const dateKey = ymd(selectedDate);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    let active = true;
    const reset = () => {
      setStartIdx(null);
      setEndIdx(null);
    };
    fetchAvailability(space.id, dateKey)
      .then((s) => {
        if (!active) return;
        setSlots(s);
        reset();
      })
      .catch(() => {
        if (!active) return;
        setSlots([]);
        reset();
      });
    return () => {
      active = false;
    };
  }, [space.id, dateKey]);

  useEffect(() => {
    let active = true;
    fetchMonthAvailability(space.id, monthKey)
      .then((days) => {
        if (!active) return;
        setSlotData({ month: monthKey, days: new Set(days.filter((d) => d.isAvailable).map((d) => d.date)) });
      })
      .catch(() => {
        if (!active) return;
        setSlotData({ month: monthKey, days: new Set() });
      });
    return () => {
      active = false;
    };
  }, [space.id, monthKey]);

  const monthCells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    return cells;
  }, [month]);

  const atCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const shiftMonth = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const startOptions = useMemo(
    () => slots.map((s, i) => ({ i, time: s.startTime, ok: s.isAvailable })).filter((o) => o.ok),
    [slots]
  );

  const endOptions = useMemo(() => {
    if (startIdx === null) return [];
    const opts: { i: number; time: string }[] = [];
    let e = startIdx;
    while (e < slots.length && slots[e].isAvailable) {
      opts.push({ i: e, time: slots[e].endTime });
      e++;
    }
    return opts;
  }, [startIdx, slots]);

  const chooseStart = (i: number) => {
    setStartIdx(i);
    setEndIdx(i);
  };

  const unit = slots.length ? slotLength(slots[0]) : 0;
  const count = startIdx !== null && endIdx !== null ? endIdx - startIdx + 1 : 0;
  const duration = (count * unit) / 60;
  const total = space.pricePerHour * duration;

  const startSlot = startIdx !== null ? slots[startIdx] : null;
  const endSlot = endIdx !== null ? slots[endIdx] : null;

  let startIso = "";
  let endIso = "";
  if (startSlot && endSlot) {
    startIso = `${dateKey}T${startSlot.startTime}`;
    const endDate = new Date(selectedDate);
    if (endSlot.endTime <= startSlot.startTime) endDate.setDate(endDate.getDate() + 1);
    endIso = `${ymd(endDate)}T${endSlot.endTime}`;
  }

  const ready = startSlot !== null && endSlot !== null;

  return (
    <div className="book-card">
      <div className="book-head">
        <div className="book-head-l">
          <span className="book-price">{fmtPrice(space.pricePerHour)}</span>
          <span className="book-price-u">/ hour</span>
        </div>
      </div>

      <div className="book-body">
        <div className="cal-head">
          <button
            className="cal-nav"
            onClick={() => shiftMonth(-1)}
            disabled={atCurrentMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="cal-title">
            {MONTHS_FULL[month.getMonth()]} {month.getFullYear()}
          </div>
          <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="cal-dow-row">
          {DOW.map((d) => (
            <div key={d} className="cal-dow">
              {d[0]}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {monthCells.map((d, i) => {
            if (!d) return <div key={`b${i}`} className="cal-blank" />;
            const loadedDays = slotData?.month === monthKey ? slotData.days : null;
            const noSlots = d < today || (loadedDays !== null && !loadedDays.has(ymd(d)));
            return (
              <button
                key={ymd(d)}
                disabled={noSlots}
                className={`cal-cell ${sameDay(d, selectedDate) ? "active" : noSlots ? "unavailable" : ""}`}
                onClick={() => !noSlots && setSelectedDate(d)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="book-label">Start & end - {fmtDateShort(dateKey)}</div>
        {slots.length === 0 || startOptions.length === 0 ? (
          <div className="time-empty">NO SLOTS THIS DAY</div>
        ) : (
          <div className="book-fields">
            <Dropdown
              label="FROM"
              value={startIdx}
              options={startOptions.map((o) => ({
                value: o.i,
                label: fmtT(o.time)
              }))}
              onChange={chooseStart}
            />
            <Dropdown
              label="TO"
              value={endIdx}
              disabled={startIdx === null}
              options={endOptions.map((o) => ({
                value: o.i,
                label: fmtT(o.time)
              }))}
              onChange={setEndIdx}
            />
          </div>
        )}

        <div className="summary">
          <div className="summary-row">
            <span>
              {fmtPrice(space.pricePerHour)} × {ready ? fmtDur(duration) : "—"}
            </span>
            <span>{fmtPrice(total)}</span>
          </div>
          <div className="summary-row">
            <span>{ready ? `${fmtT(startSlot.startTime)} — ${fmtT(endSlot.endTime)}` : "SELECT A RANGE"}</span>
            <span>{fmtDateShort(dateKey)}</span>
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
          disabled={!ready}
          onClick={() => onBook({ space, startIso, endIso, total, duration })}
        >
          <Check size={16} /> CONFIRM BOOKING
        </button>
      </div>
    </div>
  );
}
