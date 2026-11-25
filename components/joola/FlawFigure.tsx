"use client";

import { useState } from "react";
import Image from "next/image";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";

/**
 * A real capture with one flaw marked on it: an outline around the area and a short
 * label. On phones the frame shows the left part of the capture at a readable size,
 * and the outline stays aligned because it is placed in the image's own percentages.
 */

export type FlawBox = { left: number; top: number; width: number; height: number };

type Props = {
  src: string;
  width: number;
  height: number;
  alt: string;
  flaw: FlawBox;
  label: string;
  caption?: string;
  /** On phones, how much of the capture's width to show (0 to 1, from the left). */
  phoneCrop?: number;
};

export default function FlawFigure({ src, width, height, alt, flaw, label, caption, phoneCrop = 1 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="cs-figure jo-flaw" style={{ "--jo-flaw-crop": phoneCrop } as React.CSSProperties}>
      <button type="button" className="cs-figure-zoom-trigger jo-flaw__frame" onClick={() => setOpen(true)} aria-label={`Enlarge: ${alt}`}>
        <span className="jo-flaw__inner">
          <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 767px) 200vw, 720px" style={{ width: "100%", height: "auto", display: "block" }} />
          <span
            className="jo-flaw__box"
            aria-hidden="true"
            style={{ left: `${flaw.left}%`, top: `${flaw.top}%`, width: `${flaw.width}%`, height: `${flaw.height}%` }}
          />
        </span>
      </button>
      <p className="jo-flaw__label"><span className="jo-flaw__dot" aria-hidden="true" />{label}</p>
      {phoneCrop < 1 ? <p className="cs-figure-hint" aria-hidden="true">Tap to see the full screen</p> : null}
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
      <CaseStudyLightbox src={src} alt={alt} open={open} onClose={() => setOpen(false)} aspectRatio={width / height} caption={caption} />
    </figure>
  );
}
