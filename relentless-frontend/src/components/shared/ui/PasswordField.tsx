"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
}

export default function PasswordField({
  value,
  onChange,
  onBlur,
  placeholder = "••••••••",
  autoComplete
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="field-input">
      <Lock size={15} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="pw-toggle"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
