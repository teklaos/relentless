"use client";

import "./Profile.css";
import { useState } from "react";
import { Booking, User } from "@/data/types";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { Edit2, ArrowRight } from "lucide-react";

interface ProfileProps {
  user: User | null;
  bookings: Booking[];
  savedIds: Set<number>;
  onSignOut: () => void;
}

export default function Profile({ user, bookings, onSignOut }: ProfileProps) {
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalSpent = bookings.filter((b) => b.status === "COMPLETED").reduce((a, b) => a + b.totalPrice, 0);
  const hoursBooked = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((a, b) => {
      const ms = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      return a + ms / 3600000;
    }, 0);

  if (!user) return null;

  const initials = user.username
    .split(".")
    .map((p: string) => p[0].toUpperCase())
    .join("");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Account @{user.username}.</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            <AvatarImg
              imageKey={user.profileImageKey}
              name={user.username}
              size={88}
              radius="inherit"
              fallback={initials}
            />
          </div>
          <h2 className="profile-name">{user.username}</h2>
          <div className="profile-kv">
            <div className="k">USERNAME</div>
            <div className="v">{user.username}</div>
            <div className="k">EMAIL</div>
            <div className="v">{user.email}</div>
            <div className="k">DOB</div>
            <div className="v">{user.dateOfBirth}</div>
            <div className="k">JOINED</div>
            <div className="v">{user.dateJoined}</div>
          </div>
          <button className="btn block" style={{ marginTop: 24 }}>
            <Edit2 size={13} /> EDIT DETAILS
          </button>
        </div>

        <div>
          {user.role !== "HOST" && (
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="num">{completed}</div>
                <div className="lbl">COMPLETED BOOKINGS</div>
              </div>
              <div className="profile-stat">
                <div className="num">{hoursBooked.toFixed(0)}H</div>
                <div className="lbl">HOURS BOOKED</div>
              </div>
              <div className="profile-stat">
                <div className="num">€{totalSpent.toFixed(0)}</div>
                <div className="lbl">LIFETIME SPEND</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              ACCOUNT
            </div>
          </div>

          <div className="settings-list">
            <div className="setting" onClick={() => setNotifications((v) => !v)} style={{ cursor: "pointer" }}>
              <div className="setting-l">
                <span className="setting-t">Notifications</span>
                <span className="setting-d">Receive email and in-app reminders</span>
              </div>
              <button className={`toggle ${notifications ? "on" : ""}`} aria-pressed={notifications}>
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="setting" onClick={() => setTwoFactor((v) => !v)} style={{ cursor: "pointer" }}>
              <div className="setting-l">
                <span className="setting-t">Two-factor authentication</span>
                <span className="setting-d">Adds an extra step at sign-in</span>
              </div>
              <button className={`toggle ${twoFactor ? "on" : ""}`} aria-pressed={twoFactor}>
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="setting">
              <div className="setting-l">
                <span className="setting-t">Data & privacy</span>
                <span className="setting-d">Download or delete your data</span>
              </div>
              <span className="setting-v">
                <ArrowRight size={12} />
              </span>
            </div>

            <div className="setting" onClick={onSignOut} style={{ cursor: "pointer" }}>
              <div className="setting-l">
                <span className="setting-t" style={{ color: "var(--danger)" }}>
                  Sign out
                </span>
                <span className="setting-d">End session on this device</span>
              </div>
              <span className="setting-v" style={{ color: "var(--danger)" }}>
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
