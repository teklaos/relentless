"use client";

import "./Sidebar.css";
import { usePathname, useRouter } from "next/navigation";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { useApp } from "@/context/AppContext";
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
  { path: "/wallet", label: "Wallet", Icon: Wallet },
  { path: "/reviews", label: "Reviews", Icon: Star },
  { path: "/profile", label: "Profile", Icon: User }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const isHost = user?.role === "HOST";
  const items = isHost ? HOST_ITEMS : GUEST_ITEMS;
  const initials = user
    ? user.username
        .split(".")
        .map((p) => p[0].toUpperCase())
        .join("")
    : "";

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <span className="sb-logo-mark">
          RELENT<span className="less">LESS</span>
        </span>
      </div>
      <div className="sb-logo-meta" style={{ marginTop: -32, marginBottom: 32 }}>
        V 1.0.0
      </div>

      <nav className="sb-nav">
        {items.map((it) => (
          <button
            key={it.path}
            className={`sb-item ${isActive(it.path) ? "active" : ""}`}
            onClick={() => router.push(it.path)}
          >
            <span className="sb-item-icon">
              <it.Icon size={15} />
            </span>
            <span className="sb-item-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-avatar">
          <AvatarImg
            imageKey={user?.profileImageKey}
            name={user?.username ?? ""}
            size={32}
            radius="inherit"
            fallback={initials}
          />
        </div>
        <div className="sb-user-meta">
          <span className="sb-user-name">{user?.username ?? "—"}</span>
          <span className="sb-user-email">{user?.email ?? ""}</span>
        </div>
      </div>
    </aside>
  );
}
