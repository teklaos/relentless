"use client";

import "./Admin.css";
import "./Users.css";
import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import AvatarImg from "@/components/shared/ui/AvatarImg";
import { fetchAdminUsers } from "@/lib/api";
import { AdminUser } from "@/lib/types";
import { fmtDateShort } from "@/lib/format";

const ROLE_FILTERS = ["ALL", "USER", "HOST", "ADMIN"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const roleDot = (role: string) =>
  role === "HOST" ? "var(--accent)" : role === "ADMIN" ? "var(--ok-dot)" : "var(--ink-4)";

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("ALL");

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const counts = Object.fromEntries(
    ROLE_FILTERS.map((r) => [r, r === "ALL" ? users.length : users.filter((u) => u.role === r).length])
  ) as Record<RoleFilter, number>;
  const rows = users.filter((u) => filter === "ALL" || u.role === filter);
  const showContact = filter === "HOST";
  const single = filter !== "ALL";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users.</h1>
      </div>

      <div className="tabs a-tabs">
        {ROLE_FILTERS.map((key) => (
          <button key={key} onClick={() => setFilter(key)} className={`mono tab ${filter === key ? "active" : ""}`}>
            {key === "ALL" ? "All" : key.charAt(0) + key.slice(1).toLowerCase()}
            <span className="tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <UsersIcon size={20} />
          </div>
          <div className="empty-h">No users found</div>
          <div className="empty-p">Registered accounts show up here.</div>
        </div>
      ) : (
        <div>
          <div className={`mono a-usr-grid a-usr-head ${showContact ? "contact" : ""} ${single ? "single" : ""}`}>
            <span>User</span>
            {showContact && <span>Name</span>}
            {showContact && <span className="a-usr-phone">Phone</span>}
            <span className="a-usr-dob">DOB</span>
            <span className="a-usr-joined">Joined</span>
            <span className="a-usr-role-h">Role</span>
          </div>
          {rows.map((u) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
            return (
              <div
                key={u.id}
                className={`row a-usr-grid a-usr-row ${showContact ? "contact" : ""} ${single ? "single" : ""}`}
              >
                <div className="a-usr-cell">
                  <AvatarImg
                    imageKey={u.profileImageKey}
                    name={u.username}
                    size={32}
                    radius={3}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="a-usr-name truncate">{u.username}</div>
                    <div className="mono a-usr-email truncate">{u.email}</div>
                  </div>
                </div>
                {showContact && <span className="a-usr-field">{fullName || "—"}</span>}
                {showContact && <span className="mono a-usr-field a-usr-phone">{u.phoneNumber ?? "—"}</span>}
                <span className="mono a-usr-field a-usr-dob">{u.dateOfBirth ? fmtDateShort(u.dateOfBirth) : "—"}</span>
                <span className="mono a-usr-field a-usr-joined">{fmtDateShort(u.dateJoined)}</span>
                <span className="mono badge a-usr-role">
                  <span className="badge-dot" style={{ background: roleDot(u.role) }} />
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
