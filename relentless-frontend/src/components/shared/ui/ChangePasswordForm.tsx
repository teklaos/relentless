"use client";

import { useState } from "react";
import { PASSWORD_RE, PASSWORD_HINT } from "@/lib/format";
import PasswordField from "@/components/shared/ui/PasswordField";
import { useApp } from "@/context/AppContext";
import { changePassword } from "@/lib/api";

interface ChangePasswordFormProps {
  className?: string;
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ className, onSuccess }: ChangePasswordFormProps) {
  const { showToast } = useApp();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);

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
      onSuccess?.();
    } catch {
      setPwErr({ current: "INVALID PASSWORD" });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <form className={className} onSubmit={submitPassword}>
      <div className="field">
        <div className="field-label">
          <span>CURRENT PASSWORD</span>
          {pwErr.current && <span className="field-err">{pwErr.current}</span>}
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
          {pwErr.next && <span className="field-err">{pwErr.next}</span>}
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
          {pwErr.confirm && <span className="field-err">{pwErr.confirm}</span>}
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
  );
}
