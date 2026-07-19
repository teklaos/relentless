"use client";

import "./BottomNav.css";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Bookmark,
  History,
  User,
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  Star,
  type LucideIcon
} from "lucide-react";
import { useApp } from "@/context/AppContext";

type NavItem = { path: string; label: string; Icon: LucideIcon };

const GUEST_ITEMS: NavItem[] = [
  { path: "/explore", label: "Explore", Icon: Compass },
  { path: "/saved", label: "Saved", Icon: Bookmark },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/profile", label: "Profile", Icon: User }
];

const HOST_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/listings", label: "Listings", Icon: LayoutGrid },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/payouts", label: "Payouts", Icon: Wallet },
  { path: "/reviews", label: "Reviews", Icon: Star },
  { path: "/profile", label: "Profile", Icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const items = user?.role === "HOST" ? HOST_ITEMS : GUEST_ITEMS;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="bottom-nav">
      {items.map((it) => {
        const active = isActive(it.path);
        return (
          <button key={it.path} className={`bn-item ${active ? "active" : ""}`} onClick={() => router.push(it.path)}>
            <it.Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
