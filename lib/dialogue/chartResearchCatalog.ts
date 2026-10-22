/** UX research viz habits + Dialogue chart library (round 3). */

import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";
import type { IterationAlt } from "@/components/dialogue/product/scenarios/ChartIterationAltFigure";

export type ChartResearchItem = {
  id: string;
  question: string;
  chart: string;
  status: "chosen" | "ruled-out" | "research";
  reason?: string;
  variant?: GalleryVariant;
  iteration?: string;
  iterationBefore?: IterationAlt;
  iterationAfter?: GalleryVariant;
};

export const RESEARCH_INSIGHT =
  "Teams reach for bar comparisons, funnels, and trend lines first. Word clouds and radar charts rarely survived a second review.";

export const CHART_RESEARCH_GRID: ChartResearchItem[] = [
  {
    id: "funnel",
    question: "Where do people drop?",
    chart: "Drop-off by step",
    status: "chosen",
    variant: "funnel",
    reason: "Checkout studies always asked for step loss.",
    iteration: "Started as a plain table, then step bars with the largest drop called out.",
    iterationBefore: "plain-table",
    iterationAfter: "funnel",
  },
  {
    id: "segment",
    question: "How do segments differ?",
    chart: "Segment comparison",
    status: "chosen",
    variant: "segment",
    reason: "Mobile vs desktop was the repeat question.",
    iteration: "Tried a radar chart first, then paired bars so gaps read in chat.",
    iterationBefore: "radar",
    iterationAfter: "segment",
  },
  {
    id: "trend",
    question: "How did sentiment change?",
    chart: "Trend over rounds",
    status: "chosen",
    variant: "trend",
    reason: "Prototype rounds needed a simple line read.",
    iteration: "Heatmap felt busy; one line with round labels won in review.",
    iterationBefore: "heatmap",
    iterationAfter: "trend",
  },
  {
    id: "coverage",
    question: "How many interviews agree?",
    chart: "Coverage callout",
    status: "chosen",
    variant: "coverage",
    reason: "Thin evidence had to be visible, not buried.",
    iteration: "Percent-only felt vague until interview counts sat beside the bar.",
    iterationBefore: "percent-row",
    iterationAfter: "coverage",
  },
  {
    id: "theme",
    question: "What themes come up most?",
    chart: "Theme ranking",
    status: "ruled-out",
    variant: "theme",
    reason: "Tag clouds felt pretty but not actionable in chat.",
  },
  {
    id: "frequency",
    question: "How often was X mentioned?",
    chart: "Quote frequency",
    status: "ruled-out",
    variant: "quote-freq",
    reason: "Researchers wanted clips, not mention counts alone.",
  },
  {
    id: "timeline",
    question: "When in the session?",
    chart: "Timeline of moments",
    status: "ruled-out",
    variant: "timeline",
    reason: "Useful for one study, too niche for default library.",
  },
  {
    id: "distribution",
    question: "How is the spread?",
    chart: "Distribution",
    status: "ruled-out",
    variant: "distribution",
    reason: "Kept as a backup when segments overlap.",
  },
];
