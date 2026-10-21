"use client";

import { useLayoutEffect, useState } from "react";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import type { DialogueProductScenario as Scenario } from "@/components/dialogue/product/DialogueProductScenario";
import DialogueRachelFrame, {
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import type { RasterAnnotator } from "@/components/dialogue/DialogueCaseStudyContent";

function panelSurfaceTone(optionId: string): DialogueFrameTone {
  return optionId === "structured" ? "solution" : "problem";
}

/** Live chat width; scaled as a unit to fill each trio column (no TOC breakout). */
const CHAT_W = 448;
/** Same crop for all three so charts are not cut mid-bar; soft fade at bottom. */
const OPTION_CROP_H = 500;

type Option = {
  id: string;
  title: string;
  label: string;
  costLine?: string;
  priorityLine?: string;
  howeverLine?: string;
  selectionNote?: string;
  reasonLines?: string[];
  productScenario: Scenario;
  rasterAssetId?: string;
};

type Props = {
  heading: string;
  subheading: string;
  options: Option[];
  chosenId: string;
  annotateRaster?: RasterAnnotator;
};

function OptionPanel({
  option,
  isChosen,
  annotateRaster,
}: {
  option: Option;
  isChosen: boolean;
  annotateRaster?: RasterAnnotator;
}) {
  const body =
    option.productScenario === "decision-paragraphs" ? (
      <ParagraphAnswerFigure />
    ) : option.productScenario === "decision-quotes" ? (
      <QuoteListFigure />
    ) : (
      <StructuredAnswerFigure compact showClips />
    );

  const figure = (
    <div className="dialogue-lead-answer__viewport">
      <ScaledChatViewport
        innerWidth={CHAT_W}
        cropHeight={OPTION_CROP_H}
        fade
      >
        {body}
      </ScaledChatViewport>
    </div>
  );
  const wrapped =
    option.rasterAssetId && annotateRaster
      ? annotateRaster(option.rasterAssetId, figure)
      : figure;

  const cost = option.costLine ?? option.priorityLine;

  return (
    <div
      className={[
        "dialogue-lead-answer__panel",
        isChosen ? "dialogue-lead-answer__panel--chosen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="dialogue-lead-answer__panel-head">
        <p className="dialogue-lead-answer__panel-label">{option.label}</p>
        {isChosen ? <span className="dialogue-lead-answer__chosen">Chosen</span> : null}
      </div>
      <DialogueRachelFrame tone={panelSurfaceTone(option.id)} className="dialogue-lead-answer__frame">
        <div className="dialogue-product-block dialogue-product-block--static" aria-hidden inert>
          {wrapped}
        </div>
      </DialogueRachelFrame>
      {cost ? <p className="dialogue-lead-answer__panel-line">{cost}</p> : null}
    </div>
  );
}

export default function DialogueLeadAnswerCompare({
  heading,
  subheading,
  options,
  chosenId,
  annotateRaster,
}: Props) {
  const [stacked, setStacked] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 390px)");
    const on = () => setStacked(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div className="dialogue-lead-answer">
      <h3 className="dialogue-lead-answer__heading">{heading}</h3>
      <p className="dialogue-lead-answer__subheading">{subheading}</p>
      <div
        className={[
          "dialogue-lead-answer__row",
          stacked ? "dialogue-lead-answer__row--stack" : "dialogue-lead-answer__row--trio",
        ].join(" ")}
      >
        {options.map((option) => (
          <OptionPanel
            key={option.id}
            option={option}
            isChosen={option.id === chosenId}
            annotateRaster={annotateRaster}
          />
        ))}
      </div>
    </div>
  );
}
