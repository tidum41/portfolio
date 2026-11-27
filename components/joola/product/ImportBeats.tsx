"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";
import OrderFormSlice from "@/components/joola/product/OrderFormSlice";
import { CASE_STUDY_MEDIA_SIZES } from "@/lib/caseStudyLayout";

type StillSpec = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
};

type SingleVersionBeat = {
  readonly id: "v1" | "v2";
  readonly label: string;
  readonly line: string;
  readonly still: StillSpec;
};

type FinalSubFrame = {
  readonly id: "final-a" | "final-b";
  readonly line: string;
  readonly still: StillSpec;
};

const START_LINE = "Every sheet carries shipping details above the product rows.";

const START_STILL: StillSpec = {
  src: "/images/joola/v20/import-start.png",
  width: 1520,
  height: 776,
  alt: "Import order form dialog. A file-up icon sits next to Add your order form, with Drag and drop it here, or choose a file. CSV or Excel (.xlsx). and a Choose file button.",
};

const SINGLE_VERSIONS: readonly SingleVersionBeat[] = [
  {
    id: "v1",
    label: "V1",
    line: "The lines came in. The header didn't, so a rep still retyped ship-to, PO, and dates.",
    still: {
      src: "/images/joola/v20/import-v1.png",
      width: 2100,
      height: 724,
      alt: "Review and place order after a V1 import. The four imported lines appear in the order summary on the right ($98,580.78 total), while Ship to stays on the account default and Customer PO, Requested ship date, and Cancel if not shipped by remain empty.",
    },
  },
  {
    id: "v2",
    label: "V2",
    line: "Rows are checked at upload, so a dead SKU shows up while the sheet is still open.",
    still: {
      src: "/images/joola/v20/import-v2.png",
      width: 1520,
      height: 964,
      alt: "V2 Import order form dialog showing joola-order-form.csv. Rows 16, 17, 18, and 20 are marked Ready, while row 22 (Compact Pickleball Practice Net) is marked SKU not found (skipped).",
    },
  },
];

const FINAL_FRAMES: readonly FinalSubFrame[] = [
  {
    id: "final-a",
    line: "The header is read in too.",
    still: {
      src: "/images/joola/v20/import-final-a.png",
      width: 1512,
      height: 756,
      alt: "Final import preview header block. Autofilled from import shows Ship to West distribution center, PO DSG-31807, Requested ship date Nov 24, 2026, Cancel date Dec 12, 2026, email, and comments, above From your account details.",
    },
  },
  {
    id: "final-b",
    line: "A quantity well above the usual waits for a decision before checkout.",
    still: {
      src: "/images/joola/v20/import-final-b.png",
      width: 1512,
      height: 748,
      alt: "Final import preview rows. Row 18 for 360 Scorpeus paddles has a 2px amber left rule, Usually 36 beside the product name, a tinted qty cell, and Change to 36 and Keep 360 buttons. The footer reads Flag quantities above 5x your usual and Add 3 ready lines.",
    },
  },
];

function ZoomableStill({
  still,
  className,
}: {
  still: StillSpec;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={className} style={{ aspectRatio: `${still.width} / ${still.height}` }}>
        <button
          type="button"
          className="jp-still__zoom"
          onClick={() => setOpen(true)}
          aria-label={`Enlarge: ${still.alt}`}
        >
          <Image
            src={still.src}
            alt={still.alt}
            width={still.width}
            height={still.height}
            sizes={CASE_STUDY_MEDIA_SIZES}
          />
        </button>
      </div>
      <CaseStudyLightbox
        src={still.src}
        alt={still.alt}
        open={open}
        onClose={() => setOpen(false)}
        aspectRatio={still.width / still.height}
      />
    </>
  );
}

function VersionBeat({ id, label, line, still }: SingleVersionBeat) {
  return (
    <div className={`jp-beat jp-beat--version jp-beat--${id}`}>
      <p className="jp-beat__label">{label}</p>
      <p className="jp-beat__line">{line}</p>
      <div className="jp-frame jp-frame--version">
        <ZoomableStill still={still} className={`jp-still jp-still--${id}`} />
      </div>
      <p className="jp-zoom-hint">Tap to see the full screen</p>
    </div>
  );
}

function FinalBeat() {
  return (
    <div className="jp-beat jp-beat--final">
      <p className="jp-beat__label">Final</p>
      <div className="jp-final-split">
        {FINAL_FRAMES.map((frame) => (
          <div key={frame.id} className="jp-final-sub">
            <p className="jp-beat__line">{frame.line}</p>
            <div className="jp-frame jp-frame--final">
              <ZoomableStill still={frame.still} className={`jp-still jp-still--${frame.id}`} />
            </div>
          </div>
        ))}
      </div>
      <p className="jp-zoom-hint">Tap either frame to see it larger</p>
    </div>
  );
}

export default function ImportBeats({ heading }: { heading: ReactNode }) {
  return (
    <div className="jp-beats">
      <div className="jp-beat jp-beat--start">
        <p className="jp-kicker">Importing orders</p>
        {heading}
        <p className="jp-beat__label">Start</p>
        <p className="jp-beat__line">{START_LINE}</p>
        <div className="jp-frame jp-frame--start">
          <div className="jp-start-pair">
            <OrderFormSlice className="jp-start-pair__sheet" />
            <div className="jp-start-pair__upload">
              <ZoomableStill still={START_STILL} className="jp-still jp-still--start" />
            </div>
          </div>
        </div>
        <p className="jp-zoom-hint">Tap to see the full screen</p>
      </div>
      {SINGLE_VERSIONS.map((v) => (
        <VersionBeat key={v.id} {...v} />
      ))}
      <FinalBeat />
      <p className="jp-actions">
        <a href="/images/joola/v17/sample-import-v2.mp4">Watch the walkthrough</a>
      </p>
    </div>
  );
}
