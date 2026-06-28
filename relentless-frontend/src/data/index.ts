export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface SpaceAddress {
  street: string;
  streetNumber: string;
  apartmentNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CategorySummary {
  id: number;
  name: string;
}

export interface HostSummary {
  id: number;
  username: string;
  profileImageKey: string | null;
}

export interface AmenitySummary {
  id: number;
  name: string;
}

export interface Space {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  imageKeys: string[];
  address: SpaceAddress;
  category: CategorySummary;
  host: HostSummary;
  amenities: AmenitySummary[];
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  author: UserSummary;
}

export interface UserSummary {
  id: number;
  username: string;
  profileImageKey: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  dateOfBirth: string;
  dateJoined: string;
  profileImageKey: string | null;
  role: string;
}

export type BookingStatus = "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";

export interface SpaceSummary {
  id: number;
  name: string;
  city: string;
  country: string;
  categoryName: string;
}

export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  reviewed: boolean;
  space: SpaceSummary;
}

export const fmtPrice = (n: number) => `$${Number(n).toFixed(2)}`;
export const padDate = (d: Date) => d.toISOString().slice(0, 10);

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const fmtDateLong = (iso: string) => {
  const d = new Date(iso);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtTimeRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso),
    e = new Date(endIso);
  const f = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${f(s)} — ${f(e)}`;
};

export const fmtDateShort = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};

export const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
