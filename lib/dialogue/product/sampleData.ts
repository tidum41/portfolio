export const LEAD_COMPARE_QUESTION = "How many participants dropped off at shipping address in checkout?";
/** Mobile-only funnel, as shown in the full answer figure. */
export const MOBILE_FUNNEL_STEPS = [
  { label: "Cart", pct: 100 },
  { label: "Address", pct: 48 },
  { label: "Delivery", pct: 41 },
  { label: "Payment", pct: 33 },
] as const;

export const CHECKOUT_QUESTION = "Where did people drop off in checkout?";

export const STUDY_SUBTITLE = "Checkout usability, 24 interviews";

/** Problem figure: short wall of text (2 sentences). */
export const PARAGRAPH_ANSWER_BRIEF = [
  "Most participants hesitated at shipping address, delivery, and payment.",
  "Nothing in the thread linked quotes back to footage or funnel steps.",
];

/** Lead option: full paragraph wall for comparison. */
export const PARAGRAPH_ANSWER = [
  "Across the 24 interviews in this Northline checkout study, participants most often hesitated at shipping address, delivery options, and payment confirmation. Several described re-reading fields, backing out to check the cart, or pausing when error copy felt vague. Mobile sessions amplified autocomplete issues and international format confusion.",
  "Desktop participants cited unexpected fees and delivery dates that read like extra charges. A few mentioned trust on payment retry, saved wallets buried below the fold, and confirmation screens that felt abrupt. Quotes live in separate docs; charts are rebuilt in slides.",
  "Follow-ups still mean exporting transcripts, hunting timestamps, and losing which quote belongs to which funnel step. Synthesis time stacks because nothing in the thread links numbers back to footage.",
];

export const CHECKOUT_FUNNEL = {
  summary: "Shipping address loses 38 points, the largest single-step drop in checkout.",
  emphasis: "loses 38 points",
  steps: [
    { label: "Cart", pct: 100 },
    { label: "Address", pct: 62, focal: true, drop: 38 },
    { label: "Delivery", pct: 54, drop: 8 },
    { label: "Payment", pct: 42, drop: 12 },
    { label: "Confirm", pct: 36, drop: 6 },
  ],
};

export const SOURCES = [
  { participant: "Jordan M.", topic: "checkout", time: "14:03" },
  { participant: "Marcus W.", topic: "payment", time: "21:08" },
  { participant: "Priya K.", topic: "address", time: "15:47" },
  { participant: "Hannah L.", topic: "payment", time: "22:41" },
];

export const FOLLOW_UPS = ["Address step only", "Compare to round 1"];

export const CLIPS = [
  {
    id: "ship-1",
    participant: "Jordan M.",
    segment: "14:03–14:19",
    transcript: "The apartment field kept clearing when I picked autocomplete, and I almost closed the tab.",
    highlight: "almost closed the tab",
  },
  {
    id: "ship-2",
    participant: "Priya K.",
    segment: "15:47–16:04",
    transcript: "International format wasn't obvious; I typed the whole address twice before it stuck.",
    highlight: "typed the whole address twice",
  },
  {
    id: "mobile-intl",
    participant: "Priya K.",
    segment: "16:02–16:18",
    transcript: "On my phone the country switch reset everything, so I had to start the address over.",
    highlight: "start the address over",
  },
];

export const SENTIMENT_LINE = {
  title: "Sentiment climbs after autocomplete ships in round two.",
  points: [
    { label: "Round 1", value: 2.4 },
    { label: "Round 2", value: 3.1 },
    { label: "Round 3", value: 3.6 },
  ],
  question: "How did sentiment shift across the 3 prototype rounds?",
};

/** Segment comparison: same metric across participant groups (not a funnel). */
export const SEGMENT_ADDRESS = {
  question: "Which segment struggled with address validation?",
  summary: "Mobile participants reported autocomplete resets about twice as often.",
  title: "Autocomplete resets by segment",
  caption: "Share of participants who hit a reset on address",
  rows: [
    { label: "Mobile", pct: 64, focal: true },
    { label: "Desktop", pct: 31 },
    { label: "Tablet", pct: 22 },
  ],
};

/** Coverage callout: how many interviews support the finding. */
export const COVERAGE_ADDRESS = {
  question: "How widely did address friction show up?",
  headline: "18 of 24 interviews mention address friction",
  detail: "Most of the support sits on the shipping step",
  title: "Interviews that support this finding",
  rows: [
    { label: "Mentioned it", count: 18, focal: true },
    { label: "Did not", count: 6 },
  ],
};

/** Full-answer section: the address step follow-up, filtered from the checkout answer. */
export const ADDRESS_FOLLOWUP = {
  question: "Address step only",
  summary: "At the address step, the apartment field clearing on autocomplete was the sharpest complaint.",
  drawerSub: "Clips from 18 interviews at the address step",
  clips: [
    {
      id: "addr-1",
      participant: "Jordan M.",
      segment: "14:03–14:19",
      transcript:
        "The apartment field kept clearing when I picked autocomplete, and I almost closed the tab.",
      highlight: "almost closed the tab",
    },
    {
      id: "addr-2",
      participant: "Priya K.",
      segment: "16:02–16:18",
      transcript:
        "On my phone the country switch reset everything, so I had to start the address over.",
      highlight: "start the address over",
    },
    {
      id: "addr-3",
      participant: "Sam R.",
      segment: "11:22–11:40",
      transcript: "I gave up on saved address and typed it again with my thumbs.",
      highlight: "gave up on saved address",
    },
  ],
};

export const QUOTE_LIST = [
  { participant: "Jordan M.", quote: "I almost closed the tab when autocomplete cleared the apartment field." },
  { participant: "Priya K.", quote: "International format wasn't obvious on mobile." },
  { participant: "Sam R.", quote: "Fees showed up late enough that I double-checked the cart." },
];

export const ANATOMY_LABELS = [
  "Summary",
  "Sources",
  "Chart",
  "Clips",
  "Follow-ups",
];

/** Matches `data-anatomy-part` on anatomy figure targets (D-08 crop at ≤480px). */
export const ANATOMY_PART_IDS = [
  "summary",
  "sources",
  "chart",
  "clips",
  "followups",
] as const;
