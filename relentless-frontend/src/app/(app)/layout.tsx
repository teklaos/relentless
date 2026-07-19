"use client";

import "./layout.css";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { HostProvider } from "@/context/HostContext";
import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";
import SpaceDetail from "@/components/user/SpaceDetail";
import ReviewModal from "@/components/user/ReviewModal";

const HOST_ONLY = ["/dashboard", "/listings", "/payouts", "/reviews"];
const GUEST_ONLY = ["/explore", "/saved"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { auth, user, detail, reviewing, toast, savedIds, onSave, onBook, onClose, onCloseReview, onSubmitReview } =
    useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    const isHost = user.role === "HOST";
    const matches = (paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (isHost && matches(GUEST_ONLY)) {
      router.replace("/dashboard");
    } else if (!isHost && matches(HOST_ONLY)) {
      router.replace("/explore");
    }
  }, [auth, user, pathname, router]);

  if (!auth) {
    return null;
  }

  return (
    <HostProvider>
      <div className="app">
        <Sidebar />
        <main className="main">
          <div className="content">{children}</div>
        </main>
        <BottomNav />

        {detail && (
          <SpaceDetail
            space={detail}
            saved={savedIds.has(detail.id)}
            onClose={onClose}
            onSave={onSave}
            onBook={onBook}
          />
        )}

        {reviewing && <ReviewModal booking={reviewing} onClose={onCloseReview} onSubmit={onSubmitReview} />}

        {toast && (
          <div className="toast">
            <span className="dot" />
            {toast}
          </div>
        )}
      </div>
    </HostProvider>
  );
}
