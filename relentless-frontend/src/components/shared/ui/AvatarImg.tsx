"use client";

import "./AvatarImg.css";
import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/api";
import { initials } from "@/data/format";

interface AvatarImgProps {
  imageKey: string | null | undefined;
  name: string;
  size: number;
  radius?: number | string;
  style?: CSSProperties;
  fallback?: ReactNode;
}

export default function AvatarImg({ imageKey, name, size, radius = "50%", style, fallback }: AvatarImgProps) {
  const [failed, setFailed] = useState(false);

  if (!imageKey || failed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div
        className="mono avatar-fallback"
        style={{ width: size, height: size, fontSize: Math.round(size / 3), borderRadius: radius, ...style }}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl(imageKey)}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ objectFit: "cover", borderRadius: radius, ...style }}
    />
  );
}
