"use client";

import "./BottomNav.css";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Bookmark,
  History,
  User,
  type LucideIcon,
} from "lucide-react";

const items: { path: string; label: string; Icon: LucideIcon }[] = [
  { path: "/explore", label: "Explore", Icon: Compass },
  { path: "/saved", label: "Saved", Icon: Bookmark },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.path}
          className={`bn-item ${pathname === it.path ? "active" : ""}`}
          onClick={() => router.push(it.path)}
        >
          <it.Icon size={20} strokeWidth={pathname === it.path ? 2 : 1.5} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
