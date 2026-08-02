import {
  Compass,
  Bookmark,
  History,
  User,
  LayoutDashboard,
  LayoutGrid,
  Wallet,
  Star,
  Users,
  Receipt,
  BarChart3,
  type LucideIcon
} from "lucide-react";
import type { User as AppUser } from "@/data/types";

export type NavItem = { path: string; label: string; Icon: LucideIcon };

export const GUEST_ITEMS: NavItem[] = [
  { path: "/explore", label: "Explore", Icon: Compass },
  { path: "/saved", label: "Saved", Icon: Bookmark },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/profile", label: "Profile", Icon: User }
];

export const HOST_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/listings", label: "Listings", Icon: LayoutGrid },
  { path: "/bookings", label: "Bookings", Icon: History },
  { path: "/wallet", label: "Wallet", Icon: Wallet },
  { path: "/reviews", label: "Reviews", Icon: Star },
  { path: "/profile", label: "Profile", Icon: User }
];

export const ADMIN_ITEMS: NavItem[] = [
  { path: "/users", label: "Users", Icon: Users },
  { path: "/transactions", label: "Transactions", Icon: Receipt },
  { path: "/statistics", label: "Statistics", Icon: BarChart3 },
  { path: "/profile", label: "Profile", Icon: User }
];

export const ANON_ITEMS: NavItem[] = [{ path: "/explore", label: "Explore", Icon: Compass }];

export const navItemsFor = (auth: boolean, role: AppUser["role"] | undefined) =>
  !auth ? ANON_ITEMS : role === "HOST" ? HOST_ITEMS : role === "ADMIN" ? ADMIN_ITEMS : GUEST_ITEMS;

export const isActivePath = (pathname: string, path: string) => pathname === path || pathname.startsWith(path + "/");
