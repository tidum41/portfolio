"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

const DECISION_CROP_H = 468;
const DESKTOP_MAX_SCALE = 0.58;

type Option = {
  id: string;
  title: string;
  label: string;
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
  stacked,
}: {
  option: Option;
  isChosen: boolean;
  annotateRaster?: RasterAnnotator;
  stacked: boolean;
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
    <ScaledChatViewport
      cropHeight={DECISION_CROP_H}
      maxScale={stacked ? undefined : DESKTOP_MAX_SCALE}
      fade
    >
      {body}
    </ScaledChatViewport>
  );
  const wrapped =
    option.rasterAssetId && annotateRaster
      ? annotateRaster(option.rasterAssetId, figure)
      : figure;

  return (
    <div
      className={[
        "dialogue-lead-answer__panel",
        isChosen ? "dialogue-lead-answer__panel--chosen" : "dialogue-lead-answer__panel--dimmed",
      ].join(" ")}
    >
      <p className="dialogue-lead-answer__panel-label">{option.label}</p>
      <DialogueRachelFrame tone={panelSurfaceTone(option.id)} className="dialogue-lead-answer__frame">
        <div className="dialogue-product-block dialogue-product-block--static" aria-hidden inert>
          {wrapped}
        </div>
      </DialogueRachelFrame>
      <p className="dialogue-lead-answer__panel-title">{option.title}</p>
      {isChosen && option.selectionNote ? (
        <p className="dialogue-lead-answer__panel-line">{option.selectionNote}</p>
      ) : null}
      {option.priorityLine ? (
        <p className="dialogue-lead-answer__panel-line">{option.priorityLine}</p>
      ) : null}
      {option.howeverLine ? (
        <p className="dialogue-lead-answer__panel-line">{option.howeverLine}</p>
      ) : null}
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
  const rowRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 599px)");
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
        ref={rowRef}
        className={[
          "dialogue-lead-answer__row",
          stacked ? "dialogue-lead-answer__row--stack" : "",
        ].join(" ")}
      >
        {options.map((option) => (
          <OptionPanel
            key={option.id}
            option={option}
            isChosen={option.id === chosenId}
            annotateRaster={annotateRaster}
            stacked={stacked}
          />
        ))}
      </div>
    </div>
  );
}
