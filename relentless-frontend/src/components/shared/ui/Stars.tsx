import { Star } from "lucide-react";

export default function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rating;
        return (
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
