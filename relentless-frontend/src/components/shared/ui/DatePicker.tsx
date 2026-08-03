"use client";

import "./DatePicker.css";
import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Dropdown } from "@/components/shared/ui/Dropdown";
import { DOW_INITIAL, MONTHS_SHORT_TITLE } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parse(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: +match[1], m: +match[2] - 1, d: +match[3] };
}

interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  maxDate?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  minYear = 1920,
  maxYear = new Date().getFullYear() - 14,
  maxDate
}: DatePickerProps) {
  const selected = parse(value);
  const max = maxDate ? parse(maxDate) : null;
  const effMaxYear = max ? max.y : maxYear;
  const afterMax = (day: number) => {
    if (!max) return false;
    if (view.y !== max.y) return view.y > max.y;
    if (view.m !== max.m) return view.m > max.m;
    return day > max.d;
  };
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? { y: Math.min(2000, maxYear), m: 0 };
    return { y: base.y, m: base.m };
  });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const years: number[] = [];
  for (let y = effMaxYear; y >= minYear; y--) years.push(y);

  const firstDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const shiftMonth = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const pick = (day: number) => {
    onChange(toIso(view.y, view.m, day));
    setOpen(false);
  };

  const label = selected ? `${pad(selected.d)}/${pad(selected.m + 1)}/${selected.y}` : placeholder;

  return (
    <div className="datepicker" ref={ref}>
      <button
        type="button"
        className={`dp-trigger ${selected ? "" : "placeholder"}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        <Calendar size={15} />
      </button>

      {open && (
        <div className="dp-pop">
          <div className="dp-head">
            <button type="button" className="dp-nav" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <div className="dp-selects">
              <Dropdown
                value={view.m}
                options={MONTHS_SHORT_TITLE.map((name, i) => ({ value: i, label: name }))}
                onChange={(m) => setView((v) => ({ ...v, m }))}
              />
              <Dropdown
                value={view.y}
                options={years.map((y) => ({ value: y, label: String(y) }))}
                onChange={(y) => setView((v) => ({ ...v, y }))}
              />
            </div>
            <button type="button" className="dp-nav" aria-label="Next month" onClick={() => shiftMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="dp-grid dp-dow">
            {DOW_INITIAL.map((d, i) => (
              <span key={i} className="dp-dow-cell">
                {d}
              </span>
            ))}
          </div>
          <div className="dp-grid">
            {cells.map((day, i) =>
              day === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={afterMax(day)}
                  className={`dp-day ${
                    selected && selected.y === view.y && selected.m === view.m && selected.d === day ? "on" : ""
                  }`}
                  onClick={() => pick(day)}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
