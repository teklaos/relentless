"use client";

import "./Auth.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import DatePicker from "@/components/shared/ui/DatePicker";
import AuthBrandPanel from "@/components/shared/ui/AuthBrandPanel";
import { User, Mail, ArrowRight, Check } from "lucide-react";
import PasswordField from "@/components/shared/ui/PasswordField";
import OtpInput from "@/components/shared/ui/OtpInput";
import { EMAIL_RE, PASSWORD_RE, PASSWORD_HINT, TENANT_MIN_AGE, maxDobIso } from "@/lib/format";

interface AuthProps {
  mode: "login" | "register";
}

export default function Auth({ mode }: AuthProps) {
  const router = useRouter();
  const { signIn, signUp, verifySignUp, resendSignUpOtp } = useApp();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dob: ""
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fieldErr = (k: string): string => {
    if (k === "username" && mode === "register") {
      if (!form.username) return "required";
      if (form.username.length < 3) return "min 3 chars";
    }
    if (k === "email") {
      if (!form.email) return "required";
      if (!EMAIL_RE.test(form.email)) return "invalid email";
    }
    if (k === "password") {
      if (!form.password) return "required";
      if (mode === "register" && !PASSWORD_RE.test(form.password)) return PASSWORD_HINT;
    }
    if (k === "dob" && mode === "register" && !form.dob) return "required";
    return "";
  };

  const blur = (k: string) => setErr((e) => ({ ...e, [k]: fieldErr(k) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = mode === "register" ? ["username", "email", "password", "dob"] : ["email", "password"];
    const errs: Record<string, string> = {};
    for (const k of keys) {
      const msg = fieldErr(k);
      if (msg) errs[k] = msg;
    }
    setErr(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(form.email, form.password);
      } else {
        await signUp({
          username: form.username,
          email: form.email,
          password: form.password,
          dateOfBirth: form.dob
        });
        setOtpStep(true);
        setLoading(false);
      }
    } catch (e) {
      setErr({
        form:
          mode === "login"
            ? "Invalid email or password"
            : e instanceof Error && e.message
              ? e.message
              : "Could not create account"
      });
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setErr({ otp: "6 digits" });
      return;
    }
    setErr({});
    setLoading(true);
    try {
      await verifySignUp(form.email, otp);
    } catch {
      setErr({ otp: "Invalid or expired code" });
      setOtp("");
      setLoading(false);
    }
  };

  const resend = async () => {
    setErr({});
    setOtp("");
    try {
      await resendSignUpOtp(form.email);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch {
      setErr({ otp: "Could not resend code" });
    }
  };

  return (
    <div className="auth-wrap">
      <AuthBrandPanel />

      <div className="auth-right">
        <form className="auth-form" onSubmit={otpStep ? verify : submit} noValidate>
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => router.push("/login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => router.push("/register")}
            >
              Sign up
            </button>
          </div>

          <h2 className="auth-h">
            {otpStep ? "Check your inbox." : mode === "login" ? "Welcome back." : "Make an account."}
          </h2>
          <div className="auth-sub">
            {otpStep ? (
              <>
                Enter the 6-digit code we sent to <b>{form.email}</b>.
              </>
            ) : mode === "login" ? (
              "Continue to your bookings."
            ) : (
              "Takes under a minute. No card required."
            )}
          </div>

          {otpStep && (
            <div className="field">
              <div className="field-label">
                <span>Verification code</span>
                {err.otp && <span className="field-err">{err.otp}</span>}
              </div>
              <OtpInput value={otp} onChange={setOtp} autoFocus />
            </div>
          )}

          {!otpStep && mode === "register" && (
            <div className="field">
              <div className="field-label">
                <span>Username</span>
                {err.username && <span className="field-err">{err.username}</span>}
              </div>
              <div className="field-input">
                <User size={15} />
                <input
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  onBlur={() => blur("username")}
                  placeholder="your.handle"
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          {!otpStep && (
            <div className="field">
              <div className="field-label">
                <span>Email</span>
                {err.email && <span className="field-err">{err.email}</span>}
              </div>
              <div className="field-input">
                <Mail size={15} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => blur("email")}
                  placeholder="you@studio.com"
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {!otpStep && (
            <div className="field">
              <div className="field-label">
                <span>Password</span>
                {err.password && <span className="field-err">{err.password}</span>}
              </div>
              <PasswordField
                value={form.password}
                onChange={(v) => set("password", v)}
                onBlur={() => blur("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}

          {!otpStep && mode === "register" && (
            <div className="field">
              <div className="field-label">
                <span>Date of birth</span>
                {err.dob && <span className="field-err">{err.dob}</span>}
              </div>
              <DatePicker
                value={form.dob}
                onChange={(iso) => set("dob", iso)}
                placeholder="Date of birth"
                maxDate={maxDobIso(TENANT_MIN_AGE)}
              />
            </div>
          )}

          {err.form && (
            <div className="field-err" style={{ fontSize: 12, marginTop: 16 }}>
              {err.form}
            </div>
          )}

          <button type="submit" className="btn primary block lg" disabled={loading} style={{ marginTop: 22 }}>
            <span>
              {loading
                ? otpStep
                  ? "VERIFYING…"
                  : "AUTHENTICATING…"
                : otpStep
                  ? "VERIFY"
                  : mode === "login"
                    ? "ENTER"
                    : "CREATE ACCOUNT"}
            </span>
            {!loading && <ArrowRight size={15} />}
          </button>

          <div className="auth-host-row">
            {otpStep ? (
              <button
                type="button"
                className={`auth-link ${sent ? "sent" : ""}`}
                onClick={resend}
                disabled={loading || sent}
              >
                {sent ? (
                  <>
                    <Check size={12} /> <b>New code sent</b>
                  </>
                ) : (
                  <>
                    Didn&apos;t get it? <b>Resend code</b>
                  </>
                )}
              </button>
            ) : (
              <button type="button" className="auth-link" onClick={() => router.push("/register/host")}>
                Own a space? <b>Become a host</b> <ArrowRight size={12} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
