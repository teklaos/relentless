"use client";

import "./DataPrivacy.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD_RE, PASSWORD_HINT } from "@/data/format";
import PasswordField from "@/components/shared/ui/PasswordField";
import Modal from "@/components/shared/ui/Modal";
import { useApp } from "@/context/AppContext";
import { useHost } from "@/context/HostContext";
import { changePassword } from "@/lib/api";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

export default function DataPrivacy() {
  const router = useRouter();
  const { user, bookings, showToast, onDeleteAccount } = useApp();
  const { spaces, bookings: hostBookings, reviews, walletBalance, walletTransactions } = useHost();
  const isHost = user?.role === "HOST";

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const pwFieldErr = (k: "current" | "next" | "confirm"): string => {
    if (k === "current") {
      if (!pw.current) return "required";
      if (!PASSWORD_RE.test(pw.current)) return "INVALID PASSWORD";
    }
    if (k === "next") {
      if (!pw.next) return "required";
      if (!PASSWORD_RE.test(pw.next)) return PASSWORD_HINT;
    }
    if (k === "confirm") {
      if (!pw.confirm) return "required";
      if (pw.confirm !== pw.next) return "passwords do not match";
    }
    return "";
  };

  const pwBlur = (k: "current" | "next" | "confirm") => setPwErr((e) => ({ ...e, [k]: pwFieldErr(k) }));

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = ["current", "next", "confirm"] as const;
    const errs: Record<string, string> = {};
    for (const k of keys) {
      const msg = pwFieldErr(k);
      if (msg) errs[k] = msg;
    }
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      showToast("PASSWORD CHANGED");
    } catch {
      setPwErr({ current: "INVALID PASSWORD" });
    } finally {
      setPwSaving(false);
    }
  };

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

          <form className="profile-card" onSubmit={submitPassword}>
            <div className="field">
              <div className="field-label">
                <span>CURRENT PASSWORD</span>
                {pwErr.current && <span style={{ color: "var(--danger)" }}>{pwErr.current}</span>}
              </div>
              <PasswordField
                value={pw.current}
                onChange={(v) => setPw((f) => ({ ...f, current: v }))}
                onBlur={() => pwBlur("current")}
                autoComplete="current-password"
              />
            </div>

            <div className="field">
              <div className="field-label">
                <span>NEW PASSWORD</span>
                {pwErr.next && <span style={{ color: "var(--danger)" }}>{pwErr.next}</span>}
              </div>
              <PasswordField
                value={pw.next}
                onChange={(v) => setPw((f) => ({ ...f, next: v }))}
                onBlur={() => pwBlur("next")}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <div className="field-label">
                <span>CONFIRM NEW PASSWORD</span>
                {pwErr.confirm && <span style={{ color: "var(--danger)" }}>{pwErr.confirm}</span>}
              </div>
              <PasswordField
                value={pw.confirm}
                onChange={(v) => setPw((f) => ({ ...f, confirm: v }))}
                onBlur={() => pwBlur("confirm")}
                autoComplete="new-password"
              />
            </div>

            <button className="btn primary block" type="submit" disabled={pwSaving}>
              {pwSaving ? "SAVING…" : "UPDATE PASSWORD"}
            </button>
          </form>
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
            <div className="eyebrow" style={{ marginBottom: 10, color: "var(--danger)" }}>
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
