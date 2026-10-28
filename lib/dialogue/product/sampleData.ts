export const LEAD_COMPARE_QUESTION = "How did shoppers read \u2018Arrives by Friday\u2019?";
/** Mobile-only funnel, as shown in the full answer figure. */
export const MOBILE_FUNNEL_STEPS = [
  { label: "Cart", pct: 100 },
  { label: "Address", pct: 48 },
  { label: "Delivery", pct: 41 },
  { label: "Payment", pct: 33 },
] as const;

export const CHECKOUT_QUESTION = "How did shoppers read 'Arrives by Friday'?";

export const STUDY_SUBTITLE = "Checkout signals, 300 interviews";

/** Problem figure: short wall of text (2 sentences). */
export const PARAGRAPH_ANSWER_BRIEF = [
  "Shoppers talked about the delivery date and fees at the cart.",
  "Many found \u2018Arrives by Friday\u2019 unclear, and some checked the date before ordering.",
];

/** P7 problem figure: the prose answer at study scale, vague quantifiers and no path to a person. */
export const PARAGRAPH_ANSWER_WALL = [
  "Across the study, shoppers talked most about the delivery date and fees at the cart. Many found \u2018Arrives by Friday\u2019 unclear, and several said they checked the date before ordering. Some read Friday as this week, while others assumed the Friday after their order shipped.",
  "Repeat shoppers raised it less often than first-time shoppers. A few tied the confusion to free returns, and a handful said it made them hesitate at payment.",
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
  { participant: "Mei L.", topic: "delivery date", time: "18:27" },
  { participant: "Owen P.", topic: "delivery date", time: "07:12" },
  { participant: "Aisha K.", topic: "price at cart", time: "15:40" },
  { participant: "Tomas R.", topic: "returns", time: "12:04" },
  { participant: "Hannah L.", topic: "delivery date", time: "09:18" },
];

export const FOLLOW_UPS = ["Address step only", "Compare to the first study"];

export const CLIPS = [
  {
    id: "friday-1",
    participant: "Mei",
    segment: "18:27\u201318:49",
    transcript: "Friday which week?",
    highlight: "Friday which week?",
  },
];

export const SENTIMENT_LINE = {
  title: "Sentiment climbs after autocomplete ships.",
  points: [
    { label: "Round 1", value: 2.4 },
    { label: "Round 2", value: 3.1 },
    { label: "Round 3", value: 3.6 },
  ],
  question: "How did sentiment shift across the study?",
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

/** Full-answer section: follow-up filter, not the hero checkout funnel. */
export const MOBILE_FOLLOWUP = {
  question: "Show mobile only",
  summary: "On mobile, the apartment field clearing was the sharpest address complaint.",
  drawerSub: "6 moments from mobile sessions",
  clips: [
    {
      id: "mob-1",
      participant: "Jordan M.",
      segment: "14:03–14:19",
      transcript:
        "The apartment field kept clearing when I picked autocomplete, and I almost closed the tab.",
      highlight: "almost closed the tab",
    },
    {
      id: "mob-2",
      participant: "Priya K.",
      segment: "16:02–16:18",
      transcript:
        "On my phone the country switch reset everything, so I had to start the address over.",
      highlight: "start the address over",
    },
    {
      id: "mob-3",
      participant: "Sam R.",
      segment: "11:22–11:40",
      transcript: "I gave up on saved address and typed it again with my thumbs.",
      highlight: "gave up on saved address",
    },
  ],
};

export const QUOTE_LIST = [
  { participant: "Mei", time: "18:27\u201318:49", quote: "Friday which week?" },
  { participant: "Owen", time: "07:12\u201307:30", quote: "I'd assume Friday after I order, so I checked the date." },
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
