"use client";

import { useState } from "react";
import Image from "next/image";
import Placeholder from "@/components/shared/ui/Placeholder";
import { imageUrl } from "@/lib/api";

interface ThumbImgProps {
  imageKey: string | null | undefined;
  className?: string;
  imgClassName?: string;
  alt?: string;
  sizes?: string;
}

export default function ThumbImg({ imageKey, className, imgClassName, alt = "", sizes = "88px" }: ThumbImgProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className}>
      <Placeholder />
      {imageKey && !failed && (
        <Image
          src={imageUrl(imageKey)}
          alt={alt}
          fill
          sizes={sizes}
          className={imgClassName}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
