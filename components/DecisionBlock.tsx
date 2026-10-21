"use client";

import type { ReactNode } from "react";
import CaseStudyFigure from "@/components/CaseStudyFigure";
import CaseStudyNumberedMarker from "@/components/CaseStudyNumberedMarker";
import DialogueLiveFigure from "@/components/dialogue/DialogueLiveFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_TRIO_CANONICAL_FRAME } from "@/lib/caseStudies/dialogueFigureTiers";

export type RasterAnnotator = (assetId: string, children: ReactNode) => ReactNode;

export type DecisionBlockOption = {
  id: string;
  title: string;
  /** One-line loss reason for options that were not chosen */
  lossReason?: string;
  /** Rachel-style priority line, e.g. "the priority is clarity over evidence" */
  priorityLine?: string;
  /** Rachel-style rejection, e.g. "However, the problem with this approach was…" */
  howeverLine?: string;
  /** Short reason labels for the chosen option (rendered with numbered markers) */
  reasonLines?: string[];
  /** Muted line under the title when this option is chosen */
  selectionNote?: string;
  imageSrc?: string;
  imageAlt?: string;
  liveExport?: { exportRoute: string; title: string };
  rasterAssetId?: string;
  imageNaturalSize?: { width: number; height: number };
};

export type DecisionBlockProps = {
  heading: string;
  subheading: string;
  options: DecisionBlockOption[];
  chosenId: string;
  annotateRaster?: RasterAnnotator;
  /** When set, option images use intrinsic aspect ratio (no letterboxing). */
  imageNaturalSize?: { width: number; height: number };
};

function OptionCaption({ option, isChosen }: { option: DecisionBlockOption; isChosen: boolean }) {
  return (
    <div className="decision-block__caption">
      <p className="decision-block__caption-title">{option.title}</p>
      {isChosen && option.selectionNote ? (
        <p className="decision-block__caption-line">{option.selectionNote}</p>
      ) : null}
      {option.priorityLine ? (
        <p className="decision-block__caption-line">{option.priorityLine}</p>
      ) : null}
      {option.howeverLine ? (
        <p className="decision-block__caption-line">{option.howeverLine}</p>
      ) : null}
      {!option.howeverLine && option.lossReason ? (
        <p className="decision-block__caption-line">{option.lossReason}</p>
      ) : null}
      {option.reasonLines?.map((line, i) => (
        <CaseStudyNumberedMarker key={line} n={i + 1} className="decision-block__caption-line">
          {line}
        </CaseStudyNumberedMarker>
      ))}
    </div>
  );
}

function OptionCard({
  option,
  isChosen,
  annotateRaster,
  imageNaturalSize,
}: {
  option: DecisionBlockOption;
  isChosen: boolean;
  annotateRaster?: RasterAnnotator;
  imageNaturalSize?: { width: number; height: number };
}) {
  const size = option.imageNaturalSize ?? imageNaturalSize;
  const figure = option.liveExport ? (
    <DialogueRachelFrame tone="neutral">
      <DialogueLiveFigure
        exportRoute={option.liveExport.exportRoute}
        title={option.liveExport.title}
        tier="trio"
        canonicalFrame={DIALOGUE_TRIO_CANONICAL_FRAME}
        assetId={option.rasterAssetId}
      />
    </DialogueRachelFrame>
  ) : size && option.imageSrc && option.imageAlt ? (
    <CaseStudyFigure
      src={option.imageSrc}
      alt={option.imageAlt}
      width={size.width}
      height={size.height}
      sizes="(max-width: 767px) calc(50vw - 30px), 240px"
      zoomable
    />
  ) : option.imageSrc && option.imageAlt ? (
    <CaseStudyFigure
      src={option.imageSrc}
      alt={option.imageAlt}
      fill
      aspectRatio="696 / 936"
      sizes="(max-width: 767px) calc(50vw - 30px), 240px"
      zoomable
    />
  ) : null;
  const media =
    option.rasterAssetId && annotateRaster
      ? annotateRaster(option.rasterAssetId, figure)
      : figure;
  return (
    <div
      className={[
        "decision-block__option",
        isChosen ? "decision-block__option--chosen" : "decision-block__option--dimmed",
      ].join(" ")}
    >
      {media}
      <OptionCaption option={option} isChosen={isChosen} />
    </div>
  );
}

export default function DecisionBlock({
  heading,
  subheading,
  options,
  chosenId,
  annotateRaster,
  imageNaturalSize,
}: DecisionBlockProps) {
  const chosen = options.find((o) => o.id === chosenId);
  const others = options.filter((o) => o.id !== chosenId);

  return (
    <div className="decision-block">
      <h3 className="decision-block__heading">{heading}</h3>
      <p className="decision-block__subheading">{subheading}</p>

      <div className="decision-block__grid decision-block__grid--desktop">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isChosen={option.id === chosenId}
            annotateRaster={annotateRaster}
            imageNaturalSize={imageNaturalSize}
          />
        ))}
      </div>

      <div className="decision-block__grid decision-block__grid--mobile">
        {chosen ? (
          <OptionCard
            option={chosen}
            isChosen
            annotateRaster={annotateRaster}
            imageNaturalSize={imageNaturalSize}
          />
        ) : null}
        <p className="decision-block__also-explored">Also explored</p>
        {others.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isChosen={false}
            annotateRaster={annotateRaster}
            imageNaturalSize={imageNaturalSize}
          />
        ))}
      </div>
    </div>
  );
}
