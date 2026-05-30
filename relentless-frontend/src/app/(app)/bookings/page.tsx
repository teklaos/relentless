"use client";

import { useApp } from "@/context/AppContext";
import History from "@/components/pages/History";

export default function BookingsPage() {
  const { bookings, onLeaveReview, onOpenById } = useApp();
  return (
    <History
      bookings={bookings}
      onLeaveReview={onLeaveReview}
      onOpenSpace={onOpenById}
    />
  );
}
