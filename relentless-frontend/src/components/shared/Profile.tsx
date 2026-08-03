"use client";

import "./Profile.css";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking, User } from "@/lib/types";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import Modal from "@/components/shared/ui/Modal";
import DatePicker from "@/components/shared/ui/DatePicker";
import { useApp } from "@/context/AppContext";
import { uploadImage } from "@/lib/api";
import { Edit2, ArrowRight, Camera, LogOut } from "lucide-react";

interface ProfileProps {
  user: User | null;
  bookings: Booking[];
  savedIds: Set<number>;
  onSignOut: () => void;
}

export default function Profile({ user, bookings, onSignOut }: ProfileProps) {
  const router = useRouter();
  const { onUpdateProfile, showToast } = useApp();
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    dateOfBirth: "",
    profileImageKey: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    iban: ""
  });
  const avatarInput = useRef<HTMLInputElement | null>(null);

  const startEdit = () => {
    if (!user) return;
    setForm({
      username: user.username,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      profileImageKey: user.profileImageKey ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      iban: user.iban ?? ""
    });
    setEditing(true);
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("PICK AN IMAGE FILE");
      return;
    }
    setUploading(true);
    try {
      const key = await uploadImage(file);
      setForm((f) => ({ ...f, profileImageKey: key }));
    } catch {
      showToast("PHOTO UPLOAD FAILED");
    } finally {
      setUploading(false);
    }
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadAvatar(file);
  };

  const onDropAvatar = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        username: form.username,
        email: form.email,
        dateOfBirth: form.dateOfBirth,
        ...(form.profileImageKey ? { profileImageKey: form.profileImageKey } : {}),
        ...(user?.role === "HOST"
          ? {
              firstName: form.firstName,
              lastName: form.lastName,
              phoneNumber: form.phoneNumber,
              iban: form.iban
            }
          : {})
      });
      setEditing(false);
    } catch {
      showToast("COULD NOT UPDATE PROFILE");
    } finally {
      setSaving(false);
    }
  };
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalSpent = bookings.filter((b) => b.status === "COMPLETED").reduce((a, b) => a + b.totalPrice, 0);
  const hoursBooked = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((a, b) => {
      const ms = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      return a + ms / 3600000;
    }, 0);

  if (!user) return null;
  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Account @{user.username}.</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-head">
            <div className="profile-avatar">
              <AvatarImg imageKey={user.profileImageKey} name={user.username} size={88} radius="inherit" />
            </div>
            <h2 className="profile-name">{user.username}</h2>
          </div>
          <div className="profile-kv">
            <div className="k">USERNAME</div>
            <div className="v">{user.username}</div>
            <div className="k">EMAIL</div>
            <div className="v">{user.email}</div>
            <div className="k">DOB</div>
            <div className="v">{user.dateOfBirth}</div>
            <div className="k">JOINED</div>
            <div className="v">{user.dateJoined}</div>
            {user.role === "HOST" && (
              <>
                <div className="k">NAME</div>
                <div className="v">
                  {user.firstName} {user.lastName}
                </div>
                <div className="k">PHONE</div>
                <div className="v">{user.phoneNumber}</div>
                <div className="k">IBAN</div>
                <div className="v">{user.iban}</div>
              </>
            )}
          </div>
          <button className="btn block" style={{ marginTop: 24 }} onClick={startEdit}>
            <Edit2 size={13} /> EDIT DETAILS
          </button>
        </div>

        <div>
          {user.role === "USER" && (
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="num">{completed}</div>
                <div className="lbl">COMPLETED BOOKINGS</div>
              </div>
              <div className="profile-stat">
                <div className="num">{hoursBooked.toFixed(1).replace(/\.0$/, "")}H</div>
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
            {!isAdmin && (
              <div className="setting" onClick={() => setNotifications((v) => !v)} style={{ cursor: "pointer" }}>
                <div className="setting-l">
                  <span className="setting-t">Notifications</span>
                  <span className="setting-d">Receive email notifications</span>
                </div>
                <button className={`toggle ${notifications ? "on" : ""}`} aria-pressed={notifications}>
                  <span className="toggle-thumb" />
                </button>
              </div>
            )}

            <div className="setting" onClick={() => setTwoFactor((v) => !v)} style={{ cursor: "pointer" }}>
              <div className="setting-l">
                <span className="setting-t">Two-factor authentication</span>
                <span className="setting-d">Adds an extra step at sign-in</span>
              </div>
              <button className={`toggle ${twoFactor ? "on" : ""}`} aria-pressed={twoFactor}>
                <span className="toggle-thumb" />
              </button>
            </div>

            {!isAdmin && (
              <div className="setting" onClick={() => router.push("/profile/privacy")} style={{ cursor: "pointer" }}>
                <div className="setting-l">
                  <span className="setting-t">Data & privacy</span>
                  <span className="setting-d">Manage your personal data</span>
                </div>
                <span className="setting-v">
                  <ArrowRight size={12} />
                </span>
              </div>
            )}

            <div className="setting" onClick={onSignOut} style={{ cursor: "pointer" }}>
              <div className="setting-l">
                <span className="setting-t field-err">Sign out</span>
                <span className="setting-d">End session on this device</span>
              </div>
              <span className="setting-v field-err">
                <LogOut size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <Modal
          title="Edit details"
          subtitle={`@${user.username}`}
          onClose={() => !saving && setEditing(false)}
          footer={
            <>
              <button className="btn" disabled={saving} onClick={() => setEditing(false)}>
                CANCEL
              </button>
              <button className="btn primary" disabled={saving || uploading} onClick={saveEdit}>
                {saving ? "SAVING…" : "SAVE"}
              </button>
            </>
          }
        >
          <div className="profile-edit-form">
            <button
              type="button"
              className={`profile-avatar-edit ${dragging ? "dragging" : ""}`}
              onClick={() => avatarInput.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDropAvatar}
            >
              <span className="profile-avatar-btn">
                <AvatarImg
                  imageKey={form.profileImageKey || null}
                  name={form.username || user.username}
                  size={72}
                  radius="inherit"
                />
                <span className="profile-avatar-overlay">
                  <Camera size={16} />
                </span>
              </span>
              <span className="profile-avatar-hint">{uploading ? "UPLOADING…" : "DROP IMAGE OR CLICK"}</span>
              <input ref={avatarInput} type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </button>
            <label className="k">USERNAME</label>
            <input
              className="profile-input"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
            <label className="k">EMAIL</label>
            <input
              className="profile-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <label className="k">DOB</label>
            <DatePicker value={form.dateOfBirth} onChange={(iso) => setForm((f) => ({ ...f, dateOfBirth: iso }))} />
            {user.role === "HOST" && (
              <>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="k">FIRST NAME</label>
                    <input
                      className="profile-input"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="k">LAST NAME</label>
                    <input
                      className="profile-input"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="k">PHONE</label>
                <input
                  className="profile-input"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
                <label className="k">IBAN</label>
                <input
                  className="profile-input"
                  value={form.iban}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, iban: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))
                  }
                />
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
