"use client";

import "./Auth.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import DatePicker from "@/components/shared/ui/DatePicker";
import AuthBrandPanel from "@/components/shared/ui/AuthBrandPanel";
import { User, Mail, Phone, Landmark, ArrowRight, ArrowLeft, Check } from "lucide-react";
import PasswordField from "@/components/shared/ui/PasswordField";
import OtpInput from "@/components/shared/ui/OtpInput";
import { EMAIL_RE, PHONE_RE, IBAN_RE, PASSWORD_RE, PASSWORD_HINT, HOST_MIN_AGE, maxDobIso } from "@/lib/format";

const STEP_LABELS = ["Account", "Identity", "Payout", "Review", "Verify"];
const STEP_FIELDS: string[][] = [
  ["username", "email", "password", "dob"],
  ["firstName", "lastName"],
  ["phoneNumber", "iban"],
  ["acceptedTerms"],
  ["otp"]
];
const LAST_STEP = STEP_LABELS.length - 1;

export default function HostRegister() {
  const router = useRouter();
  const { signUpHost, verifySignUpHost, resendSignUpOtp } = useApp();
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    iban: "",
    acceptedTerms: false
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const revealStepErrors = (s: number) =>
    setTouched((t) => ({ ...t, ...Object.fromEntries(STEP_FIELDS[s].map((k) => [k, true])) }));

  const stepValid = (s: number): boolean => {
    if (s === 0)
      return form.username.length >= 3 && EMAIL_RE.test(form.email) && PASSWORD_RE.test(form.password) && !!form.dob;
    if (s === 1) return form.firstName.trim().length >= 2 && form.lastName.trim().length >= 2;
    if (s === 2) return PHONE_RE.test(form.phoneNumber) && IBAN_RE.test(form.iban);
    if (s === 3) return form.acceptedTerms;
    if (s === 4) return /^\d{6}$/.test(otp);
    return true;
  };

  const next = () => {
    if (!stepValid(step)) {
      revealStepErrors(step);
      return;
    }
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };
  const back = () => (step === 0 ? router.push("/register") : setStep((s) => s - 1));

  const submit = async () => {
    if (!stepValid(3)) {
      revealStepErrors(3);
      return;
    }
    setLoading(true);
    setErr({});
    try {
      await signUpHost({
        username: form.username,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dob,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        iban: form.iban,
        acceptedTerms: form.acceptedTerms
      });
      setStep(4);
    } catch (e) {
      setErr({
        form: e instanceof Error && e.message ? e.message : "Could not create host account"
      });
    }
    setLoading(false);
  };

  const verify = async () => {
    if (!stepValid(4)) {
      revealStepErrors(4);
      return;
    }
    setLoading(true);
    setErr({});
    try {
      await verifySignUpHost(form.email, otp);
    } catch {
      setErr({ form: "Invalid or expired code" });
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
      setErr({ form: "Could not resend code" });
    }
  };

  return (
    <div className="auth-wrap">
      <AuthBrandPanel />

      <div className="auth-right">
        <form
          className="auth-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 3) submit();
            else if (step === 4) verify();
            else next();
          }}
        >
          <div className="auth-alt">
            <span className="auth-eyebrow-accent">For hosts</span>
          </div>

          <h2 className="auth-h">Host sign-up.</h2>
          <div className="auth-sub">
            Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
          </div>
          <div className="host-progress" aria-hidden="true">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={i <= step ? "on" : ""} />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="field">
                <div className="field-label">
                  <span>Username</span>
                  {touched.username && form.username.length < 3 && <span className="field-err">min 3 chars</span>}
                </div>
                <div className="field-input">
                  <User size={15} />
                  <input
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    onBlur={() => blur("username")}
                    placeholder="your.handle"
                  />
                </div>
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Email</span>
                  {touched.email && !EMAIL_RE.test(form.email) && <span className="field-err">invalid email</span>}
                </div>
                <div className="field-input">
                  <Mail size={15} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => blur("email")}
                    placeholder="you@studio.com"
                  />
                </div>
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Password</span>
                  {touched.password && !PASSWORD_RE.test(form.password) && (
                    <span className="field-err">{PASSWORD_HINT}</span>
                  )}
                </div>
                <PasswordField
                  value={form.password}
                  onChange={(v) => set("password", v)}
                  onBlur={() => blur("password")}
                  autoComplete="new-password"
                />
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Date of birth</span>
                  {touched.dob && !form.dob && <span className="field-err">required</span>}
                </div>
                <DatePicker
                  value={form.dob}
                  onChange={(iso) => set("dob", iso)}
                  placeholder="Date of birth"
                  maxDate={maxDobIso(HOST_MIN_AGE)}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="field">
                <div className="field-label">
                  <span>First name</span>
                  {touched.firstName && form.firstName.trim().length < 2 && (
                    <span className="field-err">min 2 chars</span>
                  )}
                </div>
                <div className="field-input">
                  <User size={15} />
                  <input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    onBlur={() => blur("firstName")}
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Last name</span>
                  {touched.lastName && form.lastName.trim().length < 2 && (
                    <span className="field-err">min 2 chars</span>
                  )}
                </div>
                <div className="field-input">
                  <User size={15} />
                  <input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    onBlur={() => blur("lastName")}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="field">
                <div className="field-label">
                  <span>Mobile phone</span>
                  {touched.phoneNumber && !PHONE_RE.test(form.phoneNumber) && (
                    <span className="field-err">+ and 7–15 digits</span>
                  )}
                </div>
                <div className="field-input">
                  <Phone size={15} />
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => set("phoneNumber", e.target.value.replace(/[^\d+]/g, ""))}
                    onBlur={() => blur("phoneNumber")}
                    placeholder="+48555123456"
                  />
                </div>
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Payout IBAN</span>
                  {touched.iban && !IBAN_RE.test(form.iban) && <span className="field-err">invalid IBAN</span>}
                </div>
                <div className="field-input">
                  <Landmark size={15} />
                  <input
                    value={form.iban}
                    onChange={(e) => set("iban", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    onBlur={() => blur("iban")}
                    placeholder="DE89370400440532013000"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="field">
                {(
                  [
                    ["Username", form.username],
                    ["Email", form.email],
                    ["Name", `${form.firstName} ${form.lastName}`],
                    ["Phone", form.phoneNumber],
                    ["IBAN", form.iban]
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div
                    key={k}
                    style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}
                  >
                    <span style={{ opacity: 0.6 }}>{k}</span>
                    <span>{v || "—"}</span>
                  </div>
                ))}
              </div>
              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 13,
                  marginTop: 8,
                  cursor: "pointer"
                }}
              >
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => set("acceptedTerms", e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>I agree to the host terms and confirm I am authorised to receive payouts to this account.</span>
              </label>
              {touched.acceptedTerms && !form.acceptedTerms && (
                <div className="field-err" style={{ fontSize: 12, marginTop: 8 }}>
                  You must accept the host terms.
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div className="auth-sub" style={{ marginBottom: 18 }}>
                Enter the 6-digit code we sent to <b>{form.email}</b>.
              </div>
              <div className="field">
                <div className="field-label">
                  <span>Verification code</span>
                  {touched.otp && !/^\d{6}$/.test(otp) && <span className="field-err">6 digits</span>}
                </div>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  onBlur={() => blur("otp")}
                  invalid={touched.otp && !/^\d{6}$/.test(otp)}
                  autoFocus
                />
              </div>
            </>
          )}

          {err.form && (
            <div className="field-err" style={{ fontSize: 12, marginTop: 16 }}>
              {err.form}
            </div>
          )}

          <div className="host-foot">
            <button type="button" className="btn lg host-back" onClick={back} disabled={loading}>
              <ArrowLeft size={15} />
              <span>BACK</span>
            </button>
            <button type="submit" className="btn primary lg host-next" disabled={loading}>
              <span>
                {loading
                  ? step === 4
                    ? "VERIFYING…"
                    : "CREATING…"
                  : step === 4
                    ? "VERIFY"
                    : step === 3
                      ? "CREATE ACCOUNT"
                      : "CONTINUE"}
              </span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </div>

          <div className="auth-host-row">
            {step === 4 ? (
              <button
                type="button"
                className={`auth-link ${sent ? "sent" : ""}`}
                onClick={resend}
                disabled={loading || sent}
              >
                {sent ? (
                  <span>
                    <Check size={12} /> <b>New code sent</b>
                  </span>
                ) : (
                  <>
                    Didn&apos;t get it? <b>Resend code</b>
                  </>
                )}
              </button>
            ) : (
              <button type="button" className="auth-link" onClick={() => router.push("/login")}>
                Log in <ArrowRight size={12} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
