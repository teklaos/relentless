"use client";

import "./Sidebar.css";
import { usePathname, useRouter } from "next/navigation";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { useApp } from "@/context/AppContext";
import { navItemsFor, isActivePath } from "@/lib/navItems";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useApp();
  const items = navItemsFor(auth, user?.role);

  const isActive = (path: string) => isActivePath(pathname, path);

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

      {auth ? (
        <div className="sb-footer">
          <div className="sb-avatar">
            <AvatarImg imageKey={user?.profileImageKey} name={user?.username ?? ""} size={32} radius="inherit" />
          </div>
          <div className="sb-user-meta">
            <span className="sb-user-name">{user?.username ?? "—"}</span>
            <span className="sb-user-email">{user?.email ?? ""}</span>
          </div>
        </div>
      ) : (
        <div className="sb-footer">
          <button className="btn" onClick={() => router.push("/login")}>
            LOG IN
          </button>
          <button className="btn accent" onClick={() => router.push("/register")}>
            SIGN UP
          </button>
        </div>
      )}
    </aside>
  );
}
