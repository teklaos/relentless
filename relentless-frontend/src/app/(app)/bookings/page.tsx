"use client";

import { useApp } from "@/context/AppContext";
import History from "@/components/tenant/History";
import HostBookings from "@/components/host/Bookings";

export default function BookingsPage() {
  const { user, bookings, onLeaveReview, onPayBooking, onOpenById } = useApp();

  if (user?.role === "HOST") {
    return <HostBookings />;
  }

  return (
    <History bookings={bookings} onLeaveReview={onLeaveReview} onPayBooking={onPayBooking} onOpenSpace={onOpenById} />
  );
}
