"use client";

import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import type { DialogueProductScenario as Scenario } from "@/components/dialogue/product/DialogueProductScenario";
import DialogueRachelFrame, { DialogueCaption } from "@/components/dialogue/DialogueRachelFrame";
import type { RasterAnnotator } from "@/components/dialogue/DialogueCaseStudyContent";

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

function AnswerFocus({ scenario }: { scenario: Scenario }) {
  if (scenario === "decision-paragraphs") {
    return (
      <div className="dialogue-lead-answer__prose dp-text-prose-sm">
        <ParagraphAnswerFigure focus="answer" />
      </div>
    );
  }
  if (scenario === "decision-quotes") {
    return <QuoteListFigure focus="answer" />;
  }
  if (scenario === "decision-structured") {
    return <StructuredAnswerFigure compact showClips />;
  }
  return null;
}

function OptionPanel({
  option,
  isChosen,
  annotateRaster,
}: {
  option: Option;
  isChosen: boolean;
  annotateRaster?: RasterAnnotator;
}) {
  const structured = option.productScenario === "decision-structured";
  const figure = structured ? (
    <div
      className={`dialogue-lead-answer__answer dialogue-lead-answer__answer--structured dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <AnswerFocus scenario={option.productScenario} />
    </div>
  ) : (
    <div
      className={`dialogue-lead-answer__answer dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <div className="dp-study-chat dp-study-chat--compact dialogue-lead-answer__chat">
        <div className="dp-study-chat__scroll">
          <div className="dp-study-chat__body">
            <AnswerFocus scenario={option.productScenario} />
          </div>
        </div>
      </div>
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
        isChosen ? "dialogue-lead-answer__panel--chosen dialogue-lead-answer__panel--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <DialogueRachelFrame tone="system" className="dialogue-lead-answer__frame">
        {isChosen ? <span className="dialogue-lead-answer__chosen-badge">Chosen</span> : null}
        <div className="dialogue-product-block dialogue-product-block--static" aria-hidden inert>
          {wrapped}
        </div>
      </DialogueRachelFrame>
      <DialogueCaption label={option.label} sentence={cost} />
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
  return (
    <div className="dialogue-lead-answer">
      <p className="dialogue-caption dialogue-caption--block">
        <span className="dialogue-caption__label">{heading}</span>
        <span className="dialogue-caption__sentence">{subheading}</span>
      </p>
      <div className="dialogue-lead-answer__row dialogue-lead-answer__row--trio">
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
