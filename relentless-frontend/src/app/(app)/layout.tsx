"use client";

import "./layout.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import SpaceDetail from "@/components/detail/SpaceDetail";
import ReviewModal from "@/components/pages/ReviewModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    auth,
    detail,
    reviewing,
    toast,
    savedIds,
    onSave,
    onBook,
    onClose,
    onCloseReview,
    onSubmitReview,
  } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.replace("/login");
    }
  }, [auth, router]);

  if (!auth) {
    return null;
  }

  return (
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

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={onCloseReview}
          onSubmit={onSubmitReview}
        />
      )}

      {toast && (
        <div className="toast">
          <span className="dot" />
          {toast}
        </div>
      )}
    </div>
  );
}
