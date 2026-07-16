"use client";

import Image from "next/image";
import { useDialKit } from "dialkit";
import type { CSSProperties } from "react";

interface BentoImage {
  src: string;
  alt: string;
}

interface BentoHeroProps {
  featured: BentoImage;
  top: BentoImage;
  bottom: BentoImage;
  style?: CSSProperties;
}

// Adapted from a Framer "BentoHero" component: featured portrait left, two
// stacked images right, whole shape driven by one container aspect-ratio so
// the left cell's height always equals the right stack's combined height —
// no fixed pixel heights anywhere. Crop/layout knobs are tunable live via
// the "BentoHero" DialKit panel instead of Framer's property controls.
export default function BentoHero({ featured, top, bottom, style }: BentoHeroProps) {
  const dk = useDialKit("BentoHero", {
    leftRatio:     [50,   20,  80],
    aspectRatio:   [1.25, 0.6, 3],
    gap:           [14,   0,   60],
    borderRadius:  [4,    0,   40],
    featuredCropX: [55,   0,   100],
    featuredCropY: [0,    0,   100],
    featuredZoom:  [1.3,  1,   2.5],
    topCropX:      [50,   0,   100],
    topCropY:      [50,   0,   100],
    topZoom:       [1,    1,   2.5],
    bottomCropX:   [32,   0,   100],
    bottomCropY:   [50,   0,   100],
    bottomZoom:    [1,    1,   2.5],
  });

  const cell = (borderRadius: number): CSSProperties => ({
    position: "relative",
    overflow: "hidden",
    background: "var(--color-placeholder)",
    borderRadius,
  });

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
          priority
          sizes="(max-width: 767px) 50vw, 220px"
          style={{ objectFit: "cover", objectPosition: `${dk.featuredCropX}% ${dk.featuredCropY}%`, transform: `scale(${dk.featuredZoom})` }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: dk.gap }}>
        <div style={{ flex: 1, minHeight: 0, ...cell(dk.borderRadius) }}>
          <Image
            src={top.src}
            alt={top.alt}
            fill
            sizes="(max-width: 767px) 50vw, 220px"
            style={{ objectFit: "cover", objectPosition: `${dk.topCropX}% ${dk.topCropY}%`, transform: `scale(${dk.topZoom})` }}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0, ...cell(dk.borderRadius) }}>
          <Image
            src={bottom.src}
            alt={bottom.alt}
            fill
            sizes="(max-width: 767px) 50vw, 220px"
            style={{ objectFit: "cover", objectPosition: `${dk.bottomCropX}% ${dk.bottomCropY}%`, transform: `scale(${dk.bottomZoom})` }}
          />
        </div>
      </div>
    </div>
  );
}
