"use client";

import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({ value, onChange, onBlur, invalid, autoFocus }: OtpInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`otp ${invalid ? "invalid" : ""}`} onClick={() => ref.current?.focus()}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={`otp-box ${i === value.length ? "active" : ""}`}>
          {value[i] ?? ""}
        </div>
      ))}
      <input
        ref={ref}
        className="otp-field"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="6-digit verification code"
        maxLength={6}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        onBlur={onBlur}
        onSelect={(e) => {
          const end = e.currentTarget.value.length;
          e.currentTarget.setSelectionRange(end, end);
        }}
      />
    </div>
  );
}
