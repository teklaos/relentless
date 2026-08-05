"use client";

import "./Host.css";
import "./CreateListing.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useHost } from "@/context/HostContext";
import { imageUrl } from "@/lib/api";
import Placeholder from "@/components/shared/ui/Placeholder";
import { Dropdown } from "@/components/shared/ui/Dropdown";
import { HOST_KEEP_RATE, fmtPrice, net } from "@/lib/format";

const STEP_LABELS = ["Basics", "Location", "Pricing", "Working hours", "Amenities", "Photos", "Review"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmtMin = (m: number) => {
  const x = m % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};

const OPEN_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const t = fmtMin(i * 30);
  return { value: t, label: t };
});
const closeOptions = (open: string) => {
  const start = toMin(open) + 30;
  return Array.from({ length: (1440 - start) / 30 + 1 }, (_, i) => {
    const t = fmtMin(start + i * 30);
    return { value: t, label: t };
  });
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mono h-field-label">{label}</label>
      {children}
    </div>
  );
}

export default function CreateListing() {
  const host = useHost();
  const router = useRouter();
  const d = host.draft;
  const step = host.step;
  const priceNum = Number(d.price) || 0;
  const isLast = step === 6;
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const stepRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [step]);

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) await host.addPhoto(f);
    e.target.value = "";
  };

  let canContinue = true;
  if (step === 0) canContinue = d.name.trim().length > 0;
  else if (step === 1) canContinue = d.city.trim().length > 0;
  else if (step === 2) canContinue = priceNum > 0;
  else if (step === 3) canContinue = d.hours.some((h) => h.on);
  else if (step === 5) canContinue = d.photos.length >= 1;

  const amenSummary = d.amenities.length ? d.amenities.join(" - ") : "None selected";
  const addrSummary = ((d.street || "—") + " " + (d.streetNumber || "")).trim() + ", " + (d.city || "—");
  const pvName = d.name.trim() || "Your space name";
  const pvCity = [
    `${d.street.trim() || "Street"} ${d.streetNumber.trim()}`.trim(),
    d.city.trim() || "City",
    d.country.trim() || "Country"
  ]
    .join(" - ")
    .toUpperCase();
  const pvPrice = fmtPrice(priceNum);
  const openDays = d.hours.filter((h) => h.on);
  const sameHours = openDays.every((h) => h.open === openDays[0]?.open && h.close === openDays[0]?.close);
  const hoursSummary =
    openDays.length === 0
      ? "Closed"
      : sameHours
        ? `${openDays.length} days - ${openDays[0].open}–${openDays[0].close}`
        : `${openDays.length} days - custom`;

  const cancel = () => router.push(host.editingId ? "/listings" : "/dashboard");
  const onPrimary = async () => {
    if (!isLast) {
      host.nextStep();
      return;
    }
    if (publishing) return;
    setPublishing(true);
    const ok = await host.publishDraft();
    if (ok) router.push("/listings");
    else setPublishing(false);
  };

  return (
    <div>
      <div className="page-header host-head">
        <h1 className="page-title">{host.editingId ? "Edit listing." : "New listing."}</h1>
        <button onClick={cancel} className="btn mono h-cancel">
          Cancel <X size={12} />
        </button>
      </div>

      <div className="h-stepper">
        {STEP_LABELS.map((label, i) => {
          const active = i === step;
          const canJump = host.editingId != null || i <= step;
          const numState = active ? "active" : canJump ? "done" : "";
          return (
            <div key={label} className="h-step">
              {i > 0 && <div className={`h-step-line ${canJump ? "active" : ""}`} />}
              <button
                ref={active ? stepRef : undefined}
                onClick={() => (canJump ? host.setStep(i) : undefined)}
                disabled={!canJump}
                className="h-step-btn"
              >
                <span className={`mono h-step-num ${numState}`}>{i + 1}</span>
                <span className={`h-step-label ${canJump ? "on" : ""}`}>{label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className={`h-create-grid ${isLast ? "last" : ""}`}>
        <div className="card h-create-card">
          {step === 0 && (
            <div className="h-form-stack" style={{ gap: 20 }}>
              <Field label="Space name">
                <input
                  className="h-input"
                  value={d.name}
                  onChange={(e) => host.setDraft("name", e.target.value)}
                  placeholder="e.g. MOVE DANCE STUDIO"
                />
              </Field>
              <Field label="Category">
                <div className="h-chip-wrap">
                  {host.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => host.setDraft("category", c.name)}
                      className={`h-chip-sel ${d.category === c.name ? "active" : ""}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Description">
                <textarea
                  className="h-input h-textarea"
                  value={d.description}
                  onChange={(e) => host.setDraft("description", e.target.value)}
                  placeholder="A spacious studio with…"
                  rows={3}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="h-form-stack" style={{ gap: 18 }}>
              <div className="h-addr-street">
                <Field label="Street">
                  <input
                    className="h-input"
                    value={d.street}
                    onChange={(e) => host.setDraft("street", e.target.value)}
                    placeholder="Main St."
                  />
                </Field>
                <Field label="No.">
                  <input
                    className="h-input"
                    value={d.streetNumber}
                    onChange={(e) => host.setDraft("streetNumber", e.target.value)}
                    placeholder="67"
                  />
                </Field>
              </div>
              <div className="h-grid-2">
                <Field label="City">
                  <input
                    className="h-input"
                    value={d.city}
                    onChange={(e) => host.setDraft("city", e.target.value)}
                    placeholder="Warsaw"
                  />
                </Field>
                <Field label="Postal code">
                  <input
                    className="h-input"
                    value={d.postalCode}
                    onChange={(e) => host.setDraft("postalCode", e.target.value)}
                    placeholder="00-120"
                  />
                </Field>
              </div>
              <Field label="Country">
                <input
                  className="h-input"
                  value={d.country}
                  onChange={(e) => host.setDraft("country", e.target.value)}
                  placeholder="Poland"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="h-form-stack" style={{ gap: 22 }}>
              <Field label="Price per hour">
                <div className="h-price">
                  <span className="mono h-price-aff">€</span>
                  <input
                    className="mono h-price-input"
                    value={d.price}
                    onChange={(e) => host.setDraft("price", e.target.value.replace(/[^0-9.]/g, ""))}
                    inputMode="decimal"
                    placeholder="50"
                  />
                  <span className="mono h-price-suf">/ HR</span>
                </div>
              </Field>
              <div className="h-breakdown">
                <div className="mono h-field-label" style={{ marginBottom: 14 }}>
                  Per booked hour
                </div>
                <div className="h-breakdown-row">
                  <span className="h-bd-k">Guest pays</span>
                  <span className="mono h-bd-v">{fmtPrice(priceNum)}</span>
                </div>
                <div className="h-breakdown-row div">
                  <span className="h-bd-k muted">Platform fee</span>
                  <span className="mono h-bd-v muted">−{fmtPrice(priceNum * (1 - HOST_KEEP_RATE))}</span>
                </div>
                <div className="h-breakdown-row">
                  <span className="h-bd-k strong">You keep</span>
                  <span className="mono h-bd-keep">{fmtPrice(net(priceNum))}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="h-form-stack" style={{ gap: 16 }}>
              <div className="h-sched-head">
                <label className="mono h-field-label" style={{ marginBottom: 0 }}>
                  Working hours
                </label>
                <button type="button" onClick={() => host.copyDayToAll(0)} className="btn mono h-cancel">
                  Copy Monday to all
                </button>
              </div>
              <div className="h-sched">
                {d.hours.map((h, i) => (
                  <div key={h.dayOfWeek} className={`h-sched-row ${h.on ? "on" : ""}`}>
                    <button
                      type="button"
                      onClick={() => host.toggleDay(i)}
                      aria-pressed={h.on}
                      className={`h-sched-day ${h.on ? "active" : ""}`}
                    >
                      <span className="h-switch" aria-hidden="true">
                        <span className="h-switch-knob" />
                      </span>
                      <span className="mono h-sched-day-lbl">{h.dayOfWeek.slice(0, 3)}</span>
                    </button>
                    {h.on ? (
                      <div className="h-sched-times">
                        <Dropdown
                          value={h.open}
                          options={OPEN_OPTIONS}
                          onChange={(v) => host.setDayHour(i, "open", v)}
                        />
                        <span className="h-sched-dash">–</span>
                        <Dropdown
                          value={h.close}
                          options={closeOptions(h.open)}
                          onChange={(v) => host.setDayHour(i, "close", v)}
                        />
                      </div>
                    ) : (
                      <span className="mono h-sched-closed">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="mono h-field-label" style={{ marginBottom: 14 }}>
                Amenities - select all that apply
              </label>
              <div className="h-chip-wrap">
                {host.amenities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => host.toggleAmenity(a.name)}
                    className={`h-chip-sel ${d.amenities.includes(a.name) ? "active" : ""}`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="mono h-field-label" style={{ marginBottom: 14 }}>
                Photos - add at least one
              </label>
              <div className="h-photos">
                {d.photos.map((id, i) => {
                  const showDrop = dropIdx === i && dragIdx !== null && dragIdx !== i;
                  const dropSide = showDrop ? (dragIdx < i ? "drop-after" : "drop-before") : "";
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dropIdx !== i) setDropIdx(i);
                      }}
                      onDrop={() => {
                        if (dragIdx !== null) host.movePhoto(dragIdx, i);
                        setDragIdx(null);
                        setDropIdx(null);
                      }}
                      onDragEnd={() => {
                        setDragIdx(null);
                        setDropIdx(null);
                      }}
                      className={`h-photo ${dropSide}`}
                      style={{
                        backgroundImage: `url(${imageUrl(id)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    >
                      <button
                        onClick={() => host.removePhotoAt(i)}
                        aria-label={`Remove photo ${i + 1}`}
                        className="h-photo-x"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
                {d.photos.length < 6 && (
                  <>
                    <button onClick={() => fileInput.current?.click()} className="h-add-photo">
                      <Plus size={16} />
                      <span className="mono h-add-photo-t">ADD PHOTO</span>
                    </button>
                    <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
                  </>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="h-review">
              <div className="mono h-field-label" style={{ marginBottom: 16 }}>
                Review &amp; publish
              </div>
              {(
                [
                  ["Name", pvName, false],
                  ["Category", d.category, false],
                  ["Location", addrSummary, false],
                  ["Price", `${pvPrice}/HR`, true],
                  ["Hours", hoursSummary, true],
                  ["Amenities", amenSummary, false],
                  ["Photos", `${d.photos.length} added`, true]
                ] as [string, string, boolean][]
              ).map(([label, val, mono]) => (
                <div key={label} className="h-review-row">
                  <span className="h-review-k">{label}</span>
                  <span className={`h-review-v ${mono ? "mono" : ""}`}>{val}</span>
                </div>
              ))}
            </div>
          )}

          <div className="h-form-foot">
            {step > 0 ? (
              <button onClick={host.prevStep} className="h-btn-outline h-foot-btn">
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button onClick={onPrimary} disabled={!canContinue || publishing} className="h-btn-dark h-foot-btn">
              {isLast ? (publishing ? "Publishing…" : "Publish listing") : "Continue"}
            </button>
          </div>
        </div>

        <div className={`h-preview ${isLast ? "on-last" : ""}`}>
          <div className="mono h-preview-eyebrow">Live preview</div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              className="h-preview-media"
              style={
                d.photos[0]
                  ? {
                      backgroundImage: `url(${imageUrl(d.photos[0])})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }
                  : undefined
              }
            >
              {!d.photos[0] && <Placeholder />}
              <span className="mono h-list-tag h-list-cat">{d.category}</span>
            </div>
            <div className="h-preview-body">
              <div className="h-list-title-row">
                <span className="h-list-name">{pvName}</span>
                <span className="mono h-list-price">
                  {pvPrice}
                  <span className="h-list-price-u">/HR</span>
                </span>
              </div>
              <div className="mono h-preview-loc">{pvCity}</div>
            </div>
          </div>
          <div className="h-preview-note">This is how guests will see your space in search.</div>
        </div>
      </div>
    </div>
  );
}
