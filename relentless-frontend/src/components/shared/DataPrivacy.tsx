"use client";

import "./Profile.css";
import "./DataPrivacy.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "@/components/shared/ui/ChangePasswordForm";
import Modal from "@/components/shared/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useHost } from "@/context/HostContext";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

export default function DataPrivacy() {
  const router = useRouter();
  const { user, bookings, showToast, onDeleteAccount } = useApp();
  const { spaces, bookings: hostBookings, reviews, walletBalance, walletTransactions } = useHost();
  const isHost = user?.role === "HOST";

  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const downloadData = () => {
    if (!user) return;
    const payload = isHost
      ? {
          user,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          spaces: spaces.map(({ workingHours, ...s }) => s),
          bookings: hostBookings,
          reviews,
          walletBalance,
          walletTransactions
        }
      : { user, bookings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relentless-data-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteAccount();
    } catch {
      showToast("COULD NOT DELETE ACCOUNT");
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="page-header privacy-head">
        <h1 className="page-title">Data & privacy.</h1>
        <button className="btn mono privacy-back" onClick={() => router.push("/profile")}>
          <ArrowLeft size={12} /> Back
        </button>
      </div>

      <div className="privacy-grid">
        <div>
          <div style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              CHANGE PASSWORD
            </div>
          </div>

          <ChangePasswordForm className="profile-card" />
        </div>

        <div>
          <div style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              YOUR DATA
            </div>
          </div>
          <div className="profile-card" style={{ marginBottom: 32 }}>
            <p className="privacy-copy">
              Download a copy of your profile
              {isHost ? ", spaces, bookings, reviews, and wallet transactions" : " and bookings"}.
            </p>
            <button className="btn block" onClick={downloadData}>
              <Download size={13} /> DOWNLOAD MY DATA
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="eyebrow field-err" style={{ marginBottom: 10 }}>
              DELETE ACCOUNT
            </div>
          </div>
          <div className="profile-card privacy-danger">
            <p className="privacy-copy">
              Deleting your account anonymizes your profile and signs you out everywhere. This cannot be undone.
            </p>
            <button className="btn privacy-delete-btn" onClick={() => setConfirming(true)}>
              <Trash2 size={13} /> DELETE ACCOUNT
            </button>
          </div>
        </div>
      </div>

      {confirming && (
        <Modal
          title="Delete account"
          subtitle="This cannot be undone"
          onClose={() => !deleting && setConfirming(false)}
          footer={
            <>
              <button className="btn" disabled={deleting} onClick={() => setConfirming(false)}>
                CANCEL
              </button>
              <button
                className="btn privacy-delete-btn"
                disabled={deleting || confirmText !== user.username}
                onClick={confirmDelete}
              >
                {deleting ? "DELETING…" : "DELETE ACCOUNT"}
              </button>
            </>
          }
        >
          <p className="privacy-copy">
            Type <b>{user.username}</b> to confirm you want to permanently delete your account.
          </p>
          <input
            className="profile-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={user.username}
            autoFocus
          />
        </Modal>
      )}
    </div>
  );
}
