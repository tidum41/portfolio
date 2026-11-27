"use client";

import { useState, type CSSProperties, ReactNode } from "react";
import Image from "next/image";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";
import { CASE_STUDY_MEDIA_SIZES } from "@/lib/caseStudyLayout";

/** Ring box in the 1050x996 crop, already 4px outside the element. */
export type CropRing = { x: number; y: number; w: number; h: number; r: number };

const CROP = { w: 1050, h: 996 };

const VERSIONS = [
  {
    id: "v1",
    label: "V1",
    src: "/images/joola/v19/import-v1.png",
    alt: "Review after the first import. The four imported lines are in the order summary. Ship to is the account default, Customer PO and the date fields are empty, and Notes for JOOLA shows only a placeholder.",
    tag: "Header not read",
    line: "The lines were added. The ship-to, PO, dates, and comments on the sheet were not.",
    // Ship to, Customer PO, requested ship date, and cancel date, 4px outside, in the 220,0 crop.
    ring: { x: 24, y: 116, w: 616, h: 160, r: 12 },
  },
  {
    id: "v2",
    label: "V2",
    src: "/images/joola/v19/import-v2.png",
    alt: "Import preview after upload. The file is joola-order-form.csv. Rows 16 to 22 are listed, and row 22 is marked SKU not found and skipped. The form header is not shown.",
    tag: "Preview first",
    line: "The rows are checked first, so a bad SKU is visible before the order changes.",
    ring: { x: 55, y: 495.5, w: 712, h: 208, r: 12 },
  },
  {
    id: "final",
    label: "Final",
    src: "/images/joola/v19/import-final.png",
    alt: "Final import preview. An Autofilled from import block lists ship-to, PO, dates, and comments from the sheet. Row 18 shows Usually 36 with Change to 36 and Keep 360. Row 22 is skipped as a SKU not found.",
    tag: "Header read",
    line: "The header is read in, and a quantity well above the usual waits for a decision.",
    // Autofilled from import block, 4px outside, in the 220,0 crop.
    ring: { x: 55, y: 262.5, w: 720, h: 278, r: 12 },
  },
] as const;

function ringStyle(ring: CropRing): CSSProperties {
  return {
    left: `${(ring.x / CROP.w) * 100}%`,
    top: `${(ring.y / CROP.h) * 100}%`,
    width: `${(ring.w / CROP.w) * 100}%`,
    height: `${(ring.h / CROP.h) * 100}%`,
    borderRadius: ring.r,
  };
}

function tagVars(ring: CropRing): CSSProperties {
  const cy = ((ring.y + ring.h / 2) / CROP.h) * 100;
  const right = ((ring.x + ring.w) / CROP.w) * 100;
  return {
    ["--jp-tag-cy" as string]: `${cy}%`,
    ["--jp-ring-right" as string]: `${right}%`,
  };
}

function VersionBeat({
  label,
  src,
  alt,
  tag,
  line,
  ring,
}: {
  label: string;
  src: string;
  alt: string;
  tag: string;
  line: string;
  ring: CropRing;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="jp-beat jp-beat--version">
      <p className="jp-beat__label">{label}</p>
      <p className="jp-beat__line">{line}</p>
      <div className="jp-frame jp-frame--version">
        <div className="jp-still" style={tagVars(ring)}>
          <button type="button" className="jp-still__zoom" onClick={() => setOpen(true)} aria-label={`Enlarge: ${alt}`}>
            <Image
              src={src}
              alt={alt}
              width={1050}
              height={996}
              sizes={CASE_STUDY_MEDIA_SIZES}
            />
          </button>
          <span className="jp-ring" style={ringStyle(ring)} aria-hidden="true" />
          <span className="jp-leader" aria-hidden="true" />
          <span className="jp-tag">{tag}</span>
        </div>
      </div>
      <p className="jp-zoom-hint">Tap to see the full screen</p>
      <CaseStudyLightbox src={src} alt={alt} open={open} onClose={() => setOpen(false)} aspectRatio={1050 / 996} />
    </div>
  );
}

export default function ImportBeats({ heading }: { heading: ReactNode }) {
  const [startOpen, setStartOpen] = useState(false);
  return (
    <div className="jp-beats">
      <div className="jp-beat jp-beat--start">
        <p className="jp-kicker">Importing orders</p>
        {heading}
        <p className="jp-beat__label">Start</p>
        <div className="jp-frame jp-frame--start">
          <div className="jp-still jp-still--start">
            <button type="button" className="jp-still__zoom" onClick={() => setStartOpen(true)} aria-label="Enlarge: Import order form dialog">
              <Image
                src="/images/joola/v19/import-start.png"
                alt="Import order form dialog. A file-up icon sits next to Add your order form, the format line is on one line, and a Use a sample form link sits under the drop zone."
                width={1520}
                height={832}
                sizes={CASE_STUDY_MEDIA_SIZES}
              />
            </button>
          </div>
          <CaseStudyLightbox
            src="/images/joola/v19/import-start.png"
            alt="Import order form dialog. A file-up icon sits next to Add your order form, the format line is on one line, and a Use a sample form link sits under the drop zone."
            open={startOpen}
            onClose={() => setStartOpen(false)}
            aspectRatio={1520 / 832}
          />
        <p className="jp-zoom-hint">Tap to see the full screen</p>
        </div>
      </div>
      {VERSIONS.map((v) => (
        <VersionBeat key={v.id} {...v} />
      ))}
      <p className="jp-actions">
        <a href="/images/joola/v17/sample-import-v2.mp4">Watch the walkthrough</a>
      </p>
    </div>
  );
}
