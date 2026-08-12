"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

/** Defaults mirrored from BentoHero DialKit — first-paint path with no DialKit. */
export const BENTO_HERO_STATIC = {
  leftRatio: 50,
  aspectRatio: 1.25,
  gap: 14,
  borderRadius: 4,
  featuredCropX: 55,
  featuredCropY: 0,
  featuredZoom: 1.3,
  topCropX: 50,
  topCropY: 50,
  topZoom: 1,
  bottomCropX: 32,
  bottomCropY: 50,
  bottomZoom: 1,
} as const;

interface BentoImage {
  src: string;
  alt: string;
}

interface BentoHeroStaticProps {
  featured: BentoImage;
  top: BentoImage;
  bottom: BentoImage;
  style?: CSSProperties;
  priority?: boolean;
}

/**
 * DialKit-free bento for soft-nav first About paint. Same layout numbers as
 * live BentoHero defaults so the upgrade later doesn't reflow.
 */
export default function BentoHeroStatic({
  featured,
  top,
  bottom,
  style,
  priority = true,
}: BentoHeroStaticProps) {
  const dk = BENTO_HERO_STATIC;
  const cell = (borderRadius: number): CSSProperties => ({
    position: "relative",
    overflow: "hidden",
    background: "var(--color-placeholder)",
    borderRadius,
  });
  // Soft/About first paint: request less decode work than the DialKit live
  // hero (900/480). Column is ~320px; 640/320 @2x is enough for sharpness.
  const sideSizes = "(max-width: 767px) 50vw, 320px";
  const featuredSizes = "(max-width: 767px) 100vw, 640px";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(dk.aspectRatio),
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gap: dk.gap,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ width: `${dk.leftRatio}%`, flexShrink: 0, ...cell(dk.borderRadius) }}>
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          priority={priority}
          quality={82}
          sizes={featuredSizes}
          style={{
            objectFit: "cover",
            objectPosition: `${dk.featuredCropX}% ${dk.featuredCropY}%`,
            transform: `scale(${dk.featuredZoom})`,
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: dk.gap }}>
        <div style={{ flex: 1, minHeight: 0, ...cell(dk.borderRadius) }}>
          <Image
            src={top.src}
            alt={top.alt}
            fill
            quality={78}
            sizes={sideSizes}
            style={{
              objectFit: "cover",
              objectPosition: `${dk.topCropX}% ${dk.topCropY}%`,
              transform: `scale(${dk.topZoom})`,
            }}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0, ...cell(dk.borderRadius) }}>
          <Image
            src={bottom.src}
            alt={bottom.alt}
            fill
            quality={78}
            sizes={sideSizes}
            style={{
              objectFit: "cover",
              objectPosition: `${dk.bottomCropX}% ${dk.bottomCropY}%`,
              transform: `scale(${dk.bottomZoom})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
