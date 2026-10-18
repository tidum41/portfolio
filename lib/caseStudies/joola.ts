/**
 * JOOLA B2B case study — local draft only.
 * Bracketed gaps stay in design/briefs/case-study-copy.md and are not rendered.
 */

export const JOOLA_HERO_SRC = "/images/joola/hero-ruth-2.png";

/** Homepage card film. Native frame is 4:3. */
export const JOOLA_MUX_PLAYBACK_ID =
  "gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00";

export type CaseStudyMeta = { label: string; values: string[] };

export type CaseStudyBlock = {
  id: string;
  /** In-page label, BruinLease style ("The Problem", "Design Decision"). */
  label: string;
  /** TOC label. Unique, because the TOC keys its active state on the label. */
  toc: string;
  /** 30px section heading. Omit when the only candidate was a filler line. */
  heading?: string;
  paragraphs?: string[];
  film?: { playbackId: string };
};

export const JOOLA_TITLE = "B2B ordering for JOOLA";

/** Role and timeline are documented. Team, tools, and collaborators are not, so those columns are omitted. */
export const JOOLA_META: CaseStudyMeta[] = [
  { label: "Role", values: ["Product design intern"] },
  { label: "Timeline", values: ["Summer 2026"] },
];

export const JOOLA_SECTIONS: CaseStudyBlock[] = [
  {
    id: "problem",
    label: "The Problem",
    toc: "The Problem",
    heading:
      "JOOLA is the world's #1 pickleball brand. During a 2026 internship I designed and prototyped a B2B wholesale ordering portal for retailers and clubs.",
  },
  {
    id: "process",
    label: "Process",
    toc: "Process",
    heading:
      "The work included a content design and copy audit, and details aligned with NetSuite.",
  },
  {
    id: "decision-1",
    label: "Design Decision",
    toc: "Design Decision 1",
    heading: "Quick order with tier pricing",
    paragraphs: ["Quick order is the main surface. Unit price changes by quantity tier."],
  },
  {
    id: "decision-2",
    label: "Design Decision",
    toc: "Design Decision 2",
    heading: "Saved orders",
    paragraphs: ["An order can be saved and brought back instead of rebuilt line by line."],
  },
  {
    id: "decision-3",
    label: "Design Decision",
    toc: "Design Decision 3",
    heading: "Net 30 credit",
    paragraphs: ["The order can sit on Net 30 credit."],
  },
  {
    id: "decision-4",
    label: "Design Decision",
    toc: "Design Decision 4",
    heading: "Ship date pending",
    paragraphs: [
      "Place order, and the order shows \"Ship date pending\" until a rep confirms the ship date.",
    ],
  },
  {
    id: "solution",
    label: "Solution",
    toc: "Solution",
    heading:
      "The result is a coded prototype of that portal: quick order, tier pricing, saved orders, Net 30 credit, and the pending ship date.",
    film: { playbackId: JOOLA_MUX_PLAYBACK_ID },
  },
];
