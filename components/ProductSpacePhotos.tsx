"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { PRODUCT_SPACE_PHOTOS } from "@/lib/about";

type Variant = "inline" | "editorial" | "scrapbook" | "lookbook";

interface ProductSpacePhotosProps {
  /**
   * `scrapbook` / `inline` / `editorial` — polaroid collage for `/about`
   * `lookbook` — flush editorial diptych for `/about/v2` (archive quiet)
   */
  variant?: Variant;
  style?: CSSProperties;
  className?: string;
}

/**
 * UCLA Product Space community photos. Shared by `/about` and `/about/v2`
 * so both layouts stay in sync when assets change.
 */
export default function ProductSpacePhotos({
  variant = "scrapbook",
  style,
  className,
}: ProductSpacePhotosProps) {
  if (variant === "lookbook") {
    return (
      <div
        className={`ps-lookbook${className ? ` ${className}` : ""}`}
        style={style}
        aria-label="Product Space photos"
      >
        {PRODUCT_SPACE_PHOTOS.map((photo, i) => (
          <figure
            key={photo.src}
            className={`ps-lookbook-item ps-lookbook-item--${i === 0 ? "a" : "b"}`}
          >
            <div className="ps-lookbook-frame">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 70vw, 280px"
                style={{ objectFit: "cover" }}
              />
            </div>
            {"caption" in photo && photo.caption ? (
              <figcaption className="ps-lookbook-cap">{photo.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    );
  }

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
