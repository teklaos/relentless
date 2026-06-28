"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/api";

interface AvatarImgProps {
  imageKey: string | null | undefined;
  name: string;
  size: number;
  radius?: number | string;
  style?: CSSProperties;
  fallback?: ReactNode;
}

export default function AvatarImg({
  imageKey,
  name,
  size,
  radius = "50%",
  style,
  fallback = null,
}: AvatarImgProps) {
  const [failed, setFailed] = useState(false);

  if (!imageKey || failed) return <>{fallback}</>;

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
