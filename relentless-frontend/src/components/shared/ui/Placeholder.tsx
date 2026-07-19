"use client";

export default function Placeholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "repeating-linear-gradient(135deg, var(--bg-sunken), var(--bg-sunken) 9px, #efeee9 9px, #efeee9 18px)"
      }}
    ></div>
  );
}
