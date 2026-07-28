"use client";

import "./Dropdown.css";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  label,
  placeholder = "—",
  disabled,
  bare
}: {
  value: T | null;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const active = activeRef.current;
    if (menu && active) {
      menu.scrollTop = active.offsetTop - menu.clientHeight / 2 + active.clientHeight / 2;
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`ts-field ${bare ? "bare" : ""}`} ref={ref}>
      {label && <span className="ts-label">{label}</span>}
      <button
        type="button"
        className={`ts-trigger ${open ? "open" : ""}`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="ts-menu" ref={menuRef}>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              ref={o.value === value ? activeRef : undefined}
              className={`ts-opt ${o.value === value ? "active" : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
