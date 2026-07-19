import { Draft } from "./types";

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const HOST_KEEP_RATE = 0.95;

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]}`;
}

export const fmtDateShort = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};

export const fmtDateLong = (iso: string) => {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const padDate = (d: Date) => d.toISOString().slice(0, 10);

export const dayNum = (iso: string) => String(new Date(iso + "T00:00:00").getDate()).padStart(2, "0");
export const monShort = (iso: string) => MONTHS[new Date(iso + "T00:00:00").getMonth()];

export const fmtTimeRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso),
    e = new Date(endIso);
  const f = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${f(s)} — ${f(e)}`;
};

export const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const fmtPrice = (n: number) => `€${Number(n).toFixed(2)}`;
export const money = (n: number) => "€" + Math.round(n).toLocaleString("en-US");
export const net = (gross: number) => gross * HOST_KEEP_RATE;

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function blankDraft(): Draft {
  return {
    name: "",
    category: "Dancing Studio",
    description: "",
    street: "",
    streetNumber: "",
    apt: "",
    city: "",
    postalCode: "",
    country: "Poland",
    price: "",
    openTime: "09:00",
    closeTime: "22:00",
    amenities: [],
    photos: []
  };
}

export function statusMeta(s: string): { fg: string; dot: string } {
  switch (s) {
    case "CONFIRMED":
    case "ACTIVE":
      return { fg: "var(--ok)", dot: "var(--ok-dot)" };
    case "INACTIVE":
      return { fg: "var(--warn)", dot: "var(--warn-dot)" };
    case "CANCELLED":
      return { fg: "var(--danger)", dot: "var(--danger)" };
    default:
      return { fg: "var(--ink-3)", dot: "var(--ink-4)" };
  }
}
