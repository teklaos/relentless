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
import PaymentModal from "@/components/user/PaymentModal";
import AuthGateModal from "@/components/shared/AuthGateModal";

const HOST_ONLY = ["/dashboard", "/listings", "/wallet", "/reviews"];
const GUEST_ONLY = ["/explore", "/saved"];
const PUBLIC_PATHS = ["/explore"];
const isPublic = (p: string) => PUBLIC_PATHS.some((x) => p === x || p.startsWith(x + "/"));

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    auth,
    authReady,
    user,
    detail,
    reviewing,
    checkout,
    toast,
    authGate,
    savedIds,
    onSave,
    onBook,
    onClose,
    onCloseReview,
    onSubmitReview,
    onCloseCheckout,
    onProceedPayment,
    onCloseAuthGate,
    onAuthGateContinue
  } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authReady) return;
    if (!auth) {
      if (!isPublic(pathname)) router.replace("/login");
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
  }, [authReady, auth, user, pathname, router]);

  if (!authReady) return null;
  if (!auth && !isPublic(pathname)) return null;

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

        {checkout && <PaymentModal checkout={checkout} onClose={onCloseCheckout} onProceed={onProceedPayment} />}

        {authGate && (
          <AuthGateModal action={authGate.action} onClose={onCloseAuthGate} onContinue={onAuthGateContinue} />
        )}

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
