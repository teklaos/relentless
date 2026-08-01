import { Star } from "lucide-react";

interface StarsProps {
  rating: number;
  size?: number;
  variant?: "solid" | "outline";
}

export default function Stars({ rating, size = 13, variant = "solid" }: StarsProps) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rating;
        return variant === "outline" ? (
          <Star key={i} size={size} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.5} />
        ) : (
          <Star
            key={i}
            size={size}
            style={{
              fill: filled ? "var(--accent)" : "var(--hairline-strong)",
              stroke: "none",
              display: "block"
            }}
          />
        );
      })}
    </span>
  );
}
