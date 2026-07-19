"use client";

import { useRef } from "react";
import "./CreateListing.css";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useHost } from "@/context/HostContext";
import Placeholder from "@/components/shared/ui/Placeholder";
import { HOST_KEEP_RATE, fmtPrice, net } from "@/data/format";

const STEP_LABELS = ["Basics", "Location", "Pricing", "Amenities", "Photos", "Review"];

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
  const isLast = step === 5;
  const dragIdx = useRef<number | null>(null);

  let canContinue = true;
  if (step === 0) canContinue = d.name.trim().length > 0;
  else if (step === 1) canContinue = d.city.trim().length > 0;
  else if (step === 2) canContinue = priceNum > 0;
  else if (step === 4) canContinue = d.photos.length >= 1;

  const amenSummary = d.amenities.length ? d.amenities.join(" · ") : "None selected";
  const addrSummary = ((d.street || "—") + " " + (d.streetNumber || "")).trim() + ", " + (d.city || "—");
  const pvName = d.name.trim() || "Your space name";
  const pvCity = [
    `${d.street.trim() || "Street"} ${d.streetNumber.trim()}`.trim(),
    d.city.trim() || "City",
    d.country.trim() || "Country"
  ]
    .join(" · ")
    .toUpperCase();
  const pvPrice = fmtPrice(priceNum);

  const cancel = () => router.push(host.editingId ? "/listings" : "/dashboard");
  const onPrimary = () => {
    if (isLast) {
      host.publishDraft();
      router.push("/listings");
    } else {
      host.nextStep();
    }
  };

  return (
    <div>
      <div className="page-header host-head">
        <h1 className="page-title">{host.editingId ? "Edit listing." : "New listing."}</h1>
        <button onClick={cancel} className="mono h-link h-cancel">
          Cancel ✕
        </button>
      </div>

      <div className="h-stepper">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          const numState = done ? "done" : active ? "active" : "";
          return (
            <div key={label} className="h-step">
              {i > 0 && <div className={`h-step-line ${i <= step ? "active" : ""}`} />}
              <button onClick={() => (i <= step ? host.setStep(i) : undefined)} className="h-step-btn">
                <span className={`mono h-step-num ${numState}`}>{i + 1}</span>
                <span className={`h-step-label ${done || active ? "on" : ""}`}>{label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="h-create-grid">
        <div className="h-card h-create-card">
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
              <div className="h-grid-2" style={{ maxWidth: 320 }}>
                <Field label="Opens at">
                  <input
                    type="time"
                    className="h-input"
                    value={d.openTime}
                    onChange={(e) => host.setDraft("openTime", e.target.value)}
                  />
                </Field>
                <Field label="Closes at">
                  <input
                    type="time"
                    className="h-input"
                    value={d.closeTime}
                    onChange={(e) => host.setDraft("closeTime", e.target.value)}
                  />
                </Field>
              </div>
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
            <div>
              <label className="mono h-field-label" style={{ marginBottom: 14 }}>
                Amenities · select all that apply
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

          {step === 4 && (
            <div>
              <label className="mono h-field-label" style={{ marginBottom: 14 }}>
                Photos · add at least one
              </label>
              <div className="h-photos">
                {d.photos.map((id, i) => (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => (dragIdx.current = i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx.current !== null) host.movePhoto(dragIdx.current, i);
                      dragIdx.current = null;
                    }}
                    className="h-hatch h-photo"
                  >
                    <span className="mono h-photo-label">PHOTO {i + 1}</span>
                    <button
                      onClick={() => host.removePhotoAt(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="h-photo-x"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {d.photos.length < 6 && (
                  <button onClick={host.addPhoto} className="h-add-photo">
                    <Plus size={16} />
                    <span className="mono h-add-photo-t">ADD PHOTO</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
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
                  ["Hours", `${d.openTime}–${d.closeTime}`, true],
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
            <button onClick={onPrimary} disabled={!canContinue} className="h-btn-dark h-foot-btn">
              {isLast ? "Publish listing" : "Continue"}
            </button>
          </div>
        </div>

        <div className="h-preview">
          <div className="mono h-preview-eyebrow">Live preview</div>
          <div className="h-card" style={{ overflow: "hidden" }}>
            <div className="h-preview-media">
              <Placeholder />
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
