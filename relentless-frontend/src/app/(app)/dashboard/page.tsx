"use client";

import Dashboard from "@/components/host/Dashboard";
import Statistics from "@/components/admin/Statistics";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const { user } = useApp();
  return user?.role === "ADMIN" ? <Statistics /> : <Dashboard />;
}
