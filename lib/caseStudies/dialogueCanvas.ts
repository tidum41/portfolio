import { DIALOGUE_HERO_SRC, DIALOGUE_IMAGES, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

export type DialogueCanvasImage = {
  src: string;
  caption: string;
};

export type DialogueCanvasSection = {
  id: string;
  heading: string;
  images: DialogueCanvasImage[];
};

/** Image order and captions aligned with app/dialogue/page.tsx */
export const DIALOGUE_CANVAS_SECTIONS: DialogueCanvasSection[] = [
  {
    id: "hero",
    heading: DIALOGUE_TITLE,
    images: [{ src: DIALOGUE_HERO_SRC, caption: "Hero" }],
  },
  {
    id: "problem",
    heading: "Dialogue's study chat could answer anything… / …but you couldn't tell which interview said it",
    images: [
      { src: DIALOGUE_IMAGES.problemBefore, caption: "Problem: three paragraphs, no sources" },
      { src: DIALOGUE_IMAGES.problemAfter, caption: "Solution: one claim, one chart, linked moments" },
      { src: DIALOGUE_IMAGES.altParagraphs, caption: "Paragraphs — Weak: you can't see who said what, or how many." },
      { src: DIALOGUE_IMAGES.altQuoteList, caption: "Quote list — Weak: there's no answer. You still do the counting." },
      { src: DIALOGUE_IMAGES.altStructured, caption: "Structured answer — We went with this" },
      {
        src: DIALOGUE_IMAGES.proofSolution,
        caption: "Solution: selecting a bar filters the clips to the moments behind it",
      },
    ],
  },
  {
    id: "one-structure",
    heading: "Every answer gets one fixed structure",
    images: [
      {
        src: DIALOGUE_IMAGES.anatomy,
        caption: "Anatomy: Sources, Summary, Answer chart, Timestamped clips, Suggested next questions",
      },
    ],
  },
  {
    id: "fitted-charts",
    heading: "The chart fits the question",
    images: [{ src: DIALOGUE_IMAGES.answerShapes, caption: "Four question types, four chart shapes" }],
  },
  {
    id: "clips",
    heading: "A quote with no context",
    images: [
      {
        src: DIALOGUE_IMAGES.clipsSolution,
        caption: "Solution: the clip opens at 01:38 with the speaker row highlighted",
      },
    ],
  },
  {
    id: "imperfect-evidence",
    heading: "When the research doesn't settle it",
    images: [
      {
        src: DIALOGUE_IMAGES.imperfectEvidence,
        caption:
          "Counter-evidence shows who disagreed. Low coverage hides the chart and calls the answer a lead. With no match, the chat suggests a question the interviews did cover.",
      },
    ],
  },
  {
    id: "share-finding",
    heading: "A finding has to leave the chat",
    images: [
      {
        src: DIALOGUE_IMAGES.shareFinding,
        caption:
          "One action copies a ready-to-paste card. A thin finding keeps its low-coverage note, so it can't pass as solid.",
      },
    ],
  },
  {
    id: "placement",
    heading: "Instead of a docked sidebar, I kept the floating chat",
    images: [
      { src: DIALOGUE_IMAGES.dockedSidebar, caption: "Explored: docked sidebar" },
      { src: DIALOGUE_IMAGES.floatingBubble, caption: "Kept: floating chat" },
    ],
  },
  {
    id: "full-answer",
    heading: "One answer, start to finish",
    images: [
      {
        src: DIALOGUE_IMAGES.fullAnswer,
        caption: "Solution: question, chart, and every supporting clip in one drawer",
      },
    ],
  },
];

export const DIALOGUE_CANVAS_STORAGE_KEY = "dialogue-canvas-feedback-v1";

export type DialogueCanvasPin = {
  id: number;
  sectionId: string;
  sectionHeading: string;
  src: string;
  file: string;
  xPct: number;
  yPct: number;
  note: string;
};
