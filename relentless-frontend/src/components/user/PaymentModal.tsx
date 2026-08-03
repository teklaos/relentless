"use client";

import "./PaymentModal.css";
import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import { fmtPrice, fmtDateShort, fmtTimeRange } from "@/lib/format";
import { CreditCard, Loader } from "lucide-react";
import { Checkout } from "@/context/AppContext";

interface PaymentModalProps {
  checkout: Checkout;
  onClose: () => void;
  onProceed: () => void | Promise<void>;
}

export default function PaymentModal({ checkout, onClose, onProceed }: PaymentModalProps) {
  const { spaceName, total, duration, startIso, endIso } = checkout;
  const [loading, setLoading] = useState(false);

  const proceed = async () => {
    setLoading(true);
    try {
      await onProceed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Review & pay"
      subtitle={spaceName}
      onClose={loading ? () => {} : onClose}
      footer={
        <>
          <button className="btn" onClick={onClose} disabled={loading}>
            CANCEL
          </button>
          <button className="btn accent" onClick={proceed} disabled={loading}>
            {loading ? (
              <>
                <Loader size={15} className="pay-spin" /> REDIRECTING…
              </>
            ) : (
              <>
                <CreditCard size={15} /> PROCEED TO PAYMENT
              </>
            )}
          </button>
        </>
      }
    >
      <div className="pay-rows">
        <div className="pay-row">
          <span className="pay-k">DATE</span>
          <span className="pay-v">{fmtDateShort(startIso)}</span>
        </div>
        <div className="pay-row">
          <span className="pay-k">TIME</span>
          <span className="pay-v">{fmtTimeRange(startIso, endIso)}</span>
        </div>
        <div className="pay-row">
          <span className="pay-k">DURATION</span>
          <span className="pay-v">{Number(duration.toFixed(1).replace(/\.0$/, ""))}H</span>
        </div>
        <div className="pay-row total">
          <span className="pay-k">TOTAL</span>
          <span className="pay-v">{fmtPrice(total)}</span>
        </div>
      </div>
    </Modal>
  );
}
