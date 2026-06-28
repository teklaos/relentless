"use client";

import "./Sidebar.css";
import { usePathname, useRouter } from "next/navigation";
import AvatarImg from "@/components/shared/AvatarImg";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Bookmark,
  History,
  User,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

const items: { path: string; label: string; Icon: LucideIcon }[] = [
  { path: "/explore", label: "Explore", Icon: Compass },
  { path: "/saved", label: "Saved", Icon: Bookmark },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/profile", label: "Profile", Icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const initials = user
    ? user.username
        .split(".")
        .map((p) => p[0].toUpperCase())
        .join("")
    : "";

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <span className="sb-logo-mark">
          RELENT<span className="less">LESS</span>
        </span>
      </div>
      <div
        className="sb-logo-meta"
        style={{ marginTop: -32, marginBottom: 32 }}
      >
        V 1.0.0
      </div>

      <nav className="sb-nav">
        {items.map((it) => (
          <button
            key={it.path}
            className={`sb-item ${pathname === it.path ? "active" : ""}`}
            onClick={() => router.push(it.path)}
          >
            <span className="sb-item-icon">
              <it.Icon size={15} />
            </span>
            <span className="sb-item-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="sb-promo">
        <div className="sb-promo-eyebrow">For hosts</div>
        <div className="sb-promo-h">List your space</div>
        <div className="sb-promo-p">
          Set your hours, keep 85% of every booking.
        </div>
        <button className="sb-promo-link">
          Learn more <ArrowUpRight size={12} />
        </button>
      </div>

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
