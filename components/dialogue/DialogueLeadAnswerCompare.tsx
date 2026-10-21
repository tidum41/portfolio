"use client";

import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import type { DialogueProductScenario as Scenario } from "@/components/dialogue/product/DialogueProductScenario";
import DialogueRachelFrame, {
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import type { RasterAnnotator } from "@/components/dialogue/DialogueCaseStudyContent";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

function panelSurfaceTone(optionId: string): DialogueFrameTone {
  return optionId === "structured" ? "solution" : "problem";
}

/** Tall enough for the answer body once the shared question is shown above. */
const ROW_CROP_H = 420;

type Option = {
  id: string;
  title: string;
  label: string;
  /** One real cost for this option. */
  costLine?: string;
  /** @deprecated use costLine */
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
  /** Shared question shown once above the three answer rows. */
  question?: string;
};

function OptionRow({
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
    <ScaledChatViewport cropHeight={ROW_CROP_H} fade>
      {body}
    </ScaledChatViewport>
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
  question = CHECKOUT_QUESTION,
}: Props) {
  return (
    <div className="dialogue-lead-answer">
      <h3 className="dialogue-lead-answer__heading">{heading}</h3>
      <p className="dialogue-lead-answer__subheading">{subheading}</p>
      <p className="dialogue-lead-answer__question">
        <span className="dialogue-lead-answer__question-label">Question</span>
        {question}
      </p>
      <div className="dialogue-lead-answer__row dialogue-lead-answer__row--stack">
        {options.map((option) => (
          <OptionRow
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
