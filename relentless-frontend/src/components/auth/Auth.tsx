"use client";

import "./Auth.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { User, Mail, Lock, Calendar, ArrowRight } from "lucide-react";

interface AuthProps {
  mode: "login" | "register";
}

export default function Auth({ mode }: AuthProps) {
  const router = useRouter();
  const { signIn, signUp } = useApp();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dob: "",
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "register" && (!form.username || form.username.length < 3))
      errs.username = "min 3 chars";
    if (!form.email || !/.+@.+\..+/.test(form.email))
      errs.email = "invalid email";
    if (!form.password || form.password.length < 4) errs.password = "required";
    if (mode === "register" && !form.dob) errs.dob = "required";
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
          dateOfBirth: form.dob,
        });
      }
    } catch {
      setErr({
        form:
          mode === "login"
            ? "Invalid email or password"
            : "Could not create account",
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-mark">
            <div className="auth-mark-text">
              RELENT<span style={{ color: "var(--accent)" }}>LESS</span>
            </div>
          </div>
        </div>

        <div className="auth-pitch">
          <h1 className="auth-pitch-h">
            Book the space
            <br />
            <em>Make the work</em>
          </h1>
          <p className="auth-pitch-p">
            Studios, courts and halls — one to five hours. No membership.
          </p>
        </div>

        <div className="auth-stats">
          <div className="auth-stat">
            <div className="num">1,247</div>
            <div className="lbl">SPACES / 18 CITIES</div>
          </div>
          <div className="auth-stat">
            <div className="num">$28</div>
            <div className="lbl">AVG / HOUR</div>
          </div>
          <div className="auth-stat">
            <div className="num">4.92</div>
            <div className="lbl">MEDIAN RATING</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => router.push("/register")}
            >
              Register
            </button>
          </div>

          <h2 className="auth-h">
            {mode === "login" ? "Welcome back." : "Make an account."}
          </h2>
          <div className="auth-sub">
            {mode === "login"
              ? "Continue to your bookings."
              : "Takes under a minute. No card required."}
          </div>

          {mode === "register" && (
            <div className="field">
              <div className="field-label">
                <span>Username</span>
                {err.username && (
                  <span style={{ color: "var(--danger)" }}>{err.username}</span>
                )}
              </div>
              <div className="field-input">
                <User size={15} />
                <input
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  placeholder="your.handle"
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          <div className="field">
            <div className="field-label">
              <span>Email</span>
              {err.email && (
                <span style={{ color: "var(--danger)" }}>{err.email}</span>
              )}
            </div>
            <div className="field-input">
              <Mail size={15} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@studio.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <div className="field-label">
              <span>Password</span>
              {err.password && (
                <span style={{ color: "var(--danger)" }}>{err.password}</span>
              )}
            </div>
            <div className="field-input">
              <Lock size={15} />
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="field">
              <div className="field-label">
                <span>Date of birth</span>
                {err.dob && (
                  <span style={{ color: "var(--danger)" }}>{err.dob}</span>
                )}
              </div>
              <div className="field-input">
                <Calendar size={15} />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </div>
            </div>
          )}

          {err.form && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: 12,
                marginTop: 16,
              }}
            >
              {err.form}
            </div>
          )}

          <button
            type="submit"
            className="btn primary block lg"
            disabled={loading}
            style={{ marginTop: 22 }}
          >
            <span>
              {loading
                ? "AUTHENTICATING…"
                : mode === "login"
                  ? "ENTER"
                  : "CREATE ACCOUNT"}
            </span>
            {!loading && <ArrowRight size={15} />}
          </button>

          <div className="auth-meta auth-host">
            <div className="auth-host-l">
              <span className="auth-host-eyebrow">For hosts</span>
              <span className="auth-host-line">
                Own a studio, court or hall?
              </span>
            </div>
            <button
              type="button"
              className="auth-host-cta"
              onClick={() => alert("Host onboarding — coming soon.")}
            >
              BECOME A HOST <ArrowRight size={12} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
