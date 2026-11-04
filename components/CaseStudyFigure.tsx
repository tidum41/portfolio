"use client";

import { useState } from "react";
import Image from "next/image";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";
import { CASE_STUDY_BLUR_DATA_URL } from "@/lib/caseStudyBlur";

type Base = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  sizes?: string;
  zoomable?: boolean;
  placeholder?: "blur" | "empty";
};

type Fixed = Base & {
  width: number;
  height: number;
  fill?: false;
  aspectRatio?: never;
};

type Fill = Base & {
  fill: true;
  aspectRatio?: string;
  width?: never;
  height?: never;
};

export default function CaseStudyFigure(props: Fixed | Fill) {
  const {
    src,
    alt,
    caption,
    priority = false,
    sizes = "(max-width: 767px) calc(100vw - 48px), 750px",
    zoomable = true,
    placeholder = "blur",
  } = props;

  const [open, setOpen] = useState(false);
  const blurProps =
    placeholder === "blur" ? { placeholder: "blur" as const, blurDataURL: CASE_STUDY_BLUR_DATA_URL } : {};

  const media = props.fill ? (
    <div
      className="cs-figure-media cs-figure-media--fill"
      style={{ aspectRatio: props.aspectRatio ?? "16 / 10" }}
    >
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} style={{ objectFit: "contain" }} {...blurProps} />
    </div>
  ) : (
    <div className="cs-figure-media">
      <Image
        src={src}
        alt={alt}
        width={props.width}
        height={props.height}
        priority={priority}
        sizes={sizes}
        style={{ width: "100%", height: "auto", display: "block" }}
        {...blurProps}
      />
    </div>
  );

  const inner = zoomable ? (
    <button
      type="button"
      className="cs-figure-zoom-trigger"
      onClick={() => setOpen(true)}
      aria-label={`Enlarge: ${alt}`}
    >
      {media}
    </button>
  ) : (
    media
  );

  return (
    <figure className="cs-figure">
      {inner}
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
      {zoomable && (
        <CaseStudyLightbox src={src} alt={alt} open={open} onClose={() => setOpen(false)} />
      )}
    </figure>
  );
}
