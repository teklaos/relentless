import { Booking, BookingStatus } from "@/lib/types";

export type BookingTab = "upcoming" | "past" | "pending" | "cancelled" | "all";

export const BOOKING_TABS: { key: BookingTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" }
];

const TAB_STATUS: Record<BookingTab, BookingStatus | null> = {
  upcoming: "CONFIRMED",
  past: "COMPLETED",
  pending: "PENDING",
  cancelled: "CANCELLED",
  all: null
};

export function bookingsForTab(bookings: Booking[], tab: BookingTab): Booking[] {
  const status = TAB_STATUS[tab];
  const list = status ? bookings.filter((b) => b.status === status) : [...bookings];
  const dir = tab === "upcoming" ? 1 : -1;
  return list.sort((a, b) => dir * a.startTime.localeCompare(b.startTime));
}
