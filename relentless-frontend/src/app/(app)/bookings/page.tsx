"use client";

import { useApp } from "@/context/AppContext";
import History from "@/components/user/History";
import HostBookings from "@/components/host/Bookings";

export default function BookingsPage() {
  const { user, bookings, onLeaveReview, onOpenById } = useApp();

  if (user?.role === "HOST") {
    return <HostBookings />;
  }

  return <History bookings={bookings} onLeaveReview={onLeaveReview} onOpenSpace={onOpenById} />;
}
