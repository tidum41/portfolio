"use client";

import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import type { DialogueProductScenario as Scenario } from "@/components/dialogue/product/DialogueProductScenario";
import DialogueRachelFrame, {
  DialogueCaption,
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import type { RasterAnnotator } from "@/components/dialogue/DialogueCaseStudyContent";

function panelSurfaceTone(optionId: string): DialogueFrameTone {
  return optionId === "structured" ? "solution" : "problem";
}

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
  if (scenario === "decision-paragraphs") return <ParagraphAnswerFigure focus="answer" />;
  if (scenario === "decision-quotes") return <QuoteListFigure focus="answer" />;
  return <FunnelChart showChart={false} showLargestDrop={false} vizCard={false} />;
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
  const figure = (
    <div
      className={`dialogue-lead-answer__answer dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <div className="dp-study-chat dp-study-chat--compact">
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
        isChosen ? "dialogue-lead-answer__panel--chosen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <DialogueRachelFrame tone={panelSurfaceTone(option.id)} className="dialogue-lead-answer__frame">
        <div className="dialogue-product-block dialogue-product-block--static" aria-hidden inert>
          {wrapped}
        </div>
      </DialogueRachelFrame>
      <DialogueCaption
        label={isChosen ? `${option.label} · Chosen` : option.label}
        sentence={cost}
      />
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
