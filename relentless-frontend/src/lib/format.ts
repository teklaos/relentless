import { DayHours, Draft, WalletTransaction, WorkingHoursPayload } from "./types";

const DAY_NAMES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER"
];

export const DOW = DAY_NAMES.map((d) => d.slice(0, 3));
export const DOW_INITIAL = DAY_NAMES.map((d) => d[0]);

const DAY_NAMES_SUN_FIRST = [DAY_NAMES[6], ...DAY_NAMES.slice(0, 6)];
export const DAYS = DAY_NAMES_SUN_FIRST.map((d) => d.slice(0, 3));

export const MONTHS_FULL = MONTH_NAMES;
export const MONTHS_SHORT_TITLE = MONTH_NAMES.map((m) => m[0] + m.slice(1, 3).toLowerCase());

export const defaultHours = (): DayHours[] =>
  DAY_NAMES.map((dayOfWeek) => ({ dayOfWeek, open: "09:00", close: "22:00", on: true }));

export const hoursFromSpace = (wh: WorkingHoursPayload[]): DayHours[] =>
  DAY_NAMES.map((dayOfWeek) => {
    const saved = wh.find((h) => h.dayOfWeek === dayOfWeek);
    return saved
      ? { dayOfWeek, open: saved.openTime.slice(0, 5), close: saved.closeTime.slice(0, 5), on: true }
      : { dayOfWeek, open: "09:00", close: "22:00", on: false };
  });
const MONTHS = MONTH_NAMES.map((m) => m.slice(0, 3));
export const HOST_KEEP_RATE = 0.95;

export const HOST_MIN_AGE = 18;
export const TENANT_MIN_AGE = 14;
export const maxDobIso = (minAge: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().slice(0, 10);
};

export const EMAIL_RE = /.+@.+\..+/;
export const PHONE_RE = /^\+[0-9]{7,15}$/;
export const IBAN_RE = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;

export const fmtIban = (iban: string) =>
  iban.length <= 12 ? iban : `${iban.slice(0, 4)} (…) ${iban.slice(-8, -4)} ${iban.slice(-4)}`;

export const PASSWORD_RE =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+[\]{}])[a-zA-Z0-9!@#$%^&*()\-_=+[\]{}]{8,64}$/;
export const PASSWORD_HINT = "Min 8 chars: upper, lower, number & symbol";

function earningsByMonth(txs: WalletTransaction[]) {
  const now = new Date();
  const buckets: { m: string; total: number }[] = [];
  const idx = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    idx.set(`${d.getFullYear()}-${d.getMonth()}`, buckets.length);
    buckets.push({ m: MONTHS[d.getMonth()], total: 0 });
  }
  for (const t of txs) {
    if (t.type !== "CREDIT") continue;
    const d = new Date(t.createdAt);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i != null) buckets[i].total += t.amount;
  }
  return buckets;
}

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
  return `${DAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDateNoDow = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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

const GHOST_EARNINGS_HEIGHTS = [22, 34, 30, 52, 68, 90];

export function buildEarningsBars(txs: WalletTransaction[]) {
  const buckets = earningsByMonth(txs);
  const hasEarnings = buckets.some((b) => b.total > 0);
  const maxE = Math.max(1, ...buckets.map((b) => b.total));
  const earningsBars = buckets.map((b, i) => ({
    m: b.m,
    full: money(b.total),
    h: (hasEarnings ? Math.round((b.total / maxE) * 100) : GHOST_EARNINGS_HEIGHTS[i]) + "%",
    fill: i === buckets.length - 1 ? "var(--accent)" : "var(--hairline-strong)"
  }));
  return { hasEarnings, earningsBars };
}
export const net = (gross: number) => gross * HOST_KEEP_RATE;

export const initials = (name: string) =>
  name
    .split(".")
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
    hours: defaultHours(),
    amenities: [],
    photos: []
  };
}

export function statusMeta(s: string): { fg: string; dot: string } {
  switch (s) {
    case "CONFIRMED":
    case "ACTIVE":
      return { fg: "var(--ok)", dot: "var(--ok-dot)" };
    case "PENDING":
    case "INACTIVE":
      return { fg: "var(--warn)", dot: "var(--warn-dot)" };
    case "CANCELLED":
      return { fg: "var(--danger)", dot: "var(--danger)" };
    default:
      return { fg: "var(--ink-3)", dot: "var(--ink-4)" };
  }
}
