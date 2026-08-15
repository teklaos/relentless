"use client";

import "../payments.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/shared/ui/Modal";
import { XCircle } from "lucide-react";
import { clearPendingBookingId } from "@/lib/auth";

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    clearPendingBookingId();
  }, []);

  const back = () => router.push("/explore");

  return (
    <Modal onClose={back}>
      <div className="pay-status" style={{ "--tone": "var(--danger)" } as React.CSSProperties}>
        <div className="pay-badge">
          <XCircle size={34} />
        </div>
        <h2 className="pay-status-title">Payment cancelled</h2>
        <p className="pay-status-msg">No charge was made. You can pick another slot and try again anytime.</p>
        <button className="btn accent block lg" onClick={back}>
          BACK TO EXPLORE
        </button>
      </div>
    </Modal>
  );
}
