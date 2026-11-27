"use client";

import { useState, type CSSProperties } from "react";
import Image, { getImageProps } from "next/image";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";
import { CASE_STUDY_BLUR_DATA_URL } from "@/lib/caseStudyBlur";
import { CASE_STUDY_MEDIA_SIZES } from "@/lib/caseStudyLayout";

type Base = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  sizes?: string;
  zoomable?: boolean;
  placeholder?: "blur" | "empty";
  /**
   * Phone-only art direction (max-width 767px): a tighter crop of the detail the
   * claim is about, shown full bleed so product text stays readable. Tapping still
   * opens `src`, the full screen, in the lightbox.
   */
  detail?: FigureDetail;
  /** Extra class on the <figure>, for strips. */
  className?: string;
};

export type FigureDetail = {
  src: string;
  width: number;
  height: number;
  /** What the crop shows, for the hint and alt text. */
  alt?: string;
};

const PHONE_QUERY = "(max-width: 767px)";

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

/** "16 / 10" or "1.6" to a number; falls back to 16:10. */
function ratioFromCss(value: string): number {
  const [w, h = "1"] = value.split("/").map((part) => part.trim());
  const ratio = Number(w) / Number(h);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1.6;
}

export default function CaseStudyFigure(props: Fixed | Fill) {
  const {
    src,
    alt,
    caption,
    priority = false,
    sizes = CASE_STUDY_MEDIA_SIZES,
    zoomable = true,
    placeholder = "blur",
    detail,
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const aspectRatio = props.fill ? ratioFromCss(props.aspectRatio ?? "16 / 10") : props.width / props.height;
  const blurProps =
    placeholder === "blur" ? { placeholder: "blur" as const, blurDataURL: CASE_STUDY_BLUR_DATA_URL } : {};

  const pictured =
    detail && !props.fill ? <DetailPicture src={src} alt={alt} width={props.width} height={props.height} sizes={sizes} priority={priority} detail={detail} /> : null;

  const media = pictured ? (
    <div className="cs-figure-media" style={{ "--cs-detail-ar": `${detail!.width} / ${detail!.height}` } as CSSProperties}>
      {pictured}
    </div>
  ) : props.fill ? (
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
    <figure className={["cs-figure", detail ? "cs-figure--detail" : "", className ?? ""].filter(Boolean).join(" ")}>
      {inner}
      {detail ? <p className="cs-figure-hint" aria-hidden="true">Tap to see the full screen</p> : null}
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
      {zoomable && (
        <CaseStudyLightbox src={src} alt={alt} open={open} onClose={() => setOpen(false)} aspectRatio={aspectRatio} caption={caption} />
      )}
    </figure>
  );
}

/** <picture> with a phone crop and the full desktop frame, both through next/image. */
function DetailPicture({
  src,
  alt,
  width,
  height,
  sizes,
  priority,
  detail,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority: boolean;
  detail: FigureDetail;
}) {
  const common = { alt, priority };
  const desktop = getImageProps({ ...common, src, width, height, sizes }).props;
  const phone = getImageProps({ ...common, src: detail.src, width: detail.width, height: detail.height, sizes: "100vw" }).props;
  return (
    <picture>
      <source media={PHONE_QUERY} srcSet={phone.srcSet} sizes="100vw" />
      <source srcSet={desktop.srcSet} sizes={sizes} />
      <img {...desktop} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
    </picture>
  );
}
