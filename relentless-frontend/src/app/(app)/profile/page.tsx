"use client";

import { useApp } from "@/context/AppContext";
import Profile from "@/components/pages/Profile";

export default function ProfilePage() {
  const { user, bookings, savedIds, onSignOut } = useApp();
  return (
    <Profile
      user={user}
      bookings={bookings}
      savedIds={savedIds}
      onSignOut={onSignOut}
    />
  );
}
