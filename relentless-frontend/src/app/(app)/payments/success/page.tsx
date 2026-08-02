"use client";

import "../payments.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyBookings } from "@/lib/api";
import Modal from "@/components/shared/ui/Modal";
import { CheckCircle2, Loader, Clock, HelpCircle } from "lucide-react";
import { getPendingBookingId, clearPendingBookingId } from "@/lib/auth";

type State = "checking" | "confirmed" | "pending" | "unknown";
const MAX_TRIES = 15;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const tries = useRef(0);

  useEffect(() => {
    const id = getPendingBookingId();
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("unknown");
      return;
    }

    let active = true;
    const poll = async () => {
      tries.current += 1;
      try {
        const bookings = await fetchMyBookings();
        const booking = bookings.find((b) => b.id === id);
        if (!active) return;
        if (booking?.status === "CONFIRMED") {
          clearPendingBookingId();
          setState("confirmed");
          return;
        }
      } catch {
        // ignore errors
      }
      if (!active) return;
      if (tries.current >= MAX_TRIES) {
        setState("pending");
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    let timer = setTimeout(poll, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const view = {
    checking: {
      icon: <Loader className="pay-spin" size={34} />,
      tone: "var(--ink-3)",
      title: "Confirming payment…",
      msg: "Hang tight while we verify your payment with Stripe."
    },
    confirmed: {
      icon: <CheckCircle2 size={34} />,
      tone: "var(--ok)",
      title: "Booking confirmed",
      msg: "Your reservation is locked in."
    },
    pending: {
      icon: <Clock size={34} />,
      tone: "var(--warn)",
      title: "Payment processing",
      msg: "Payment received — confirmation is taking a moment. It'll show in your bookings shortly."
    },
    unknown: {
      icon: <HelpCircle size={34} />,
      tone: "var(--ink-3)",
      title: "No pending payment",
      msg: "We couldn't find a payment in progress. Check your bookings for status."
    }
  }[state];

  const done = () => router.push("/bookings");

  return (
    <Modal onClose={done}>
      <div className="pay-status" style={{ "--tone": view.tone } as React.CSSProperties}>
        <div className="pay-badge">{view.icon}</div>
        <h2 className="pay-status-title">{view.title}</h2>
        <p className="pay-status-msg">{view.msg}</p>
        <button className="btn accent block lg" onClick={done}>
          VIEW MY BOOKINGS
        </button>
      </div>
    </Modal>
  );
}
