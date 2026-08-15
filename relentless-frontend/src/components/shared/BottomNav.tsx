"use client";

import "./BottomNav.css";
import { usePathname, useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { navItemsFor, isActivePath } from "@/lib/navItems";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useApp();
  const items = navItemsFor(auth, user?.role);

  const isActive = (path: string) => isActivePath(pathname, path);

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
      {!auth && (
        <button className="bn-item" onClick={() => router.push("/login")}>
          <User size={20} strokeWidth={1.5} />
          <span>LOG IN</span>
        </button>
      )}
    </nav>
  );
}
