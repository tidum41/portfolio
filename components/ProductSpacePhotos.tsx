"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { PRODUCT_SPACE_PHOTOS } from "@/lib/about";

type Variant = "inline" | "editorial" | "scrapbook";

interface ProductSpacePhotosProps {
  /** `scrapbook` / `inline` / `editorial` — polaroid collage for `/about` */
  variant?: Variant;
  style?: CSSProperties;
  className?: string;
}

/** UCLA Product Space community photos on `/about`. */
export default function ProductSpacePhotos({
  variant = "scrapbook",
  style,
  className,
}: ProductSpacePhotosProps) {
  const density = variant === "inline" ? "compact" : "roomy";

  return (
    <div
      className={`ps-scrapbook ps-scrapbook--${density}${className ? ` ${className}` : ""}`}
      style={style}
      aria-label="Product Space photos"
    >
      {PRODUCT_SPACE_PHOTOS.map((photo, i) => (
        <figure
          key={photo.src}
          className={`ps-polaroid ps-polaroid--${i === 0 ? "a" : "b"}`}
        >
          <div className="ps-polaroid-frame">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 767px) 55vw, 240px"
              style={{ objectFit: "cover" }}
            />
          </div>
          {"caption" in photo && photo.caption ? (
            <figcaption className="ps-polaroid-cap">{photo.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
