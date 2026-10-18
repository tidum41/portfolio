/**
 * JOOLA B2B case study — local draft only.
 * Do not publish this to the production Sanity dataset. Mudit reviews the
 * prose in design/briefs/case-study-copy.md before any of it is treated as final.
 *
 * Sentences in [brackets] are gaps, not facts.
 */

export const JOOLA_HERO_SRC = "/images/joola/hero-ruth-2.png";

/** Homepage card film. Native frame is 4:3 (see JOOLA_B2B_PROJECT). */
export const JOOLA_MUX_PLAYBACK_ID =
  "gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00";

export type CaseStudyMeta = { label: string; value: string };

export type CaseStudyDecision = { title: string; body: string };

export type CaseStudyBlock = {
  id: string;
  label: string;
  heading: string;
  paragraphs: string[];
  decisions?: CaseStudyDecision[];
  /** Mux film rendered under the prose. */
  film?: { playbackId: string; caption: string };
};

export type ProductCaseStudyContent = {
  title: string;
  description: string;
  summary: string;
  hero: { src: string; alt: string; width: number; height: number };
  meta: CaseStudyMeta[];
  sections: CaseStudyBlock[];
};

export const JOOLA_CASE_STUDY: ProductCaseStudyContent = {
  title: "JOOLA B2B",
  description:
    "Draft case study: a coded prototype of a JOOLA wholesale ordering portal for retailers and clubs.",
  summary:
    "A coded prototype of a wholesale ordering portal for JOOLA retailers and clubs.",
  hero: {
    src: JOOLA_HERO_SRC,
    alt: "Quick order screen from the JOOLA wholesale prototype, with tier pricing, a saved order, Net 30 credit, and an order marked ship date pending.",
    width: 2400,
    height: 1600,
  },
  meta: [
    { label: "Role", value: "Product design intern" },
    { label: "Team", value: "[Team is not documented]" },
    { label: "Timeline", value: "Summer 2026" },
    { label: "Tools", value: "[Tools are not documented]" },
  ],
  sections: [
    {
      id: "problem",
      label: "Problem",
      heading: "Wholesale ordering for retailers and clubs.",
      paragraphs: [
        "JOOLA is the world's #1 pickleball brand. During a 2026 internship I designed and prototyped a B2B wholesale ordering portal for retailers and clubs.",
        "[How those retailers and clubs order today, and what is failing about it, is not documented in this draft.]",
      ],
    },
    {
      id: "process",
      label: "Process",
      heading: "A few ordering decisions, then a coded prototype.",
      paragraphs: [
        "The work included a content design and copy audit, and details aligned with NetSuite.",
        "[Who reviewed the work, and which options were rejected, is not documented here.]",
      ],
      decisions: [
        {
          title: "Quick order with tier pricing",
          body: "Quick order is the main surface. Unit price changes by quantity tier.",
        },
        {
          title: "Saved orders",
          body: "An order can be saved and brought back instead of rebuilt line by line.",
        },
        {
          title: "Net 30 credit",
          body: "The order can sit on Net 30 credit.",
        },
        {
          title: "Ship date pending",
          body: "Place order, and the order shows \"Ship date pending\" until a rep confirms the ship date.",
        },
      ],
    },
    {
      id: "solution",
      label: "Solution",
      heading: "The prototype, playing.",
      paragraphs: [
        "The result is a coded prototype of that portal: quick order, tier pricing, saved orders, Net 30 credit, and the pending ship date.",
      ],
      film: {
        playbackId: JOOLA_MUX_PLAYBACK_ID,
        caption: "Coded prototype.",
      },
    },
    {
      id: "outcome",
      label: "Outcome",
      heading: "[No outcome is documented yet.]",
      paragraphs: [
        "The deliverable in this draft is the coded prototype.",
        "[No adoption, orders placed, or time-saved numbers are documented.]",
      ],
    },
    {
      id: "next",
      label: "What I'd do next",
      heading: "[A next step, not a result.]",
      paragraphs: [
        "[I would watch retailers and clubs place a quick order, and watch a rep confirm a ship date, before treating the pending state as finished. That test has not been run.]",
      ],
    },
  ],
};
