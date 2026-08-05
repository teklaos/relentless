"use client";

import { useApp } from "@/context/AppContext";
import Profile from "@/components/shared/Profile";

export default function ProfilePage() {
  const { user, bookings, onSignOut } = useApp();
  return <Profile user={user} bookings={bookings} onSignOut={onSignOut} />;
}
