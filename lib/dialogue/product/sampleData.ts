export const CHECKOUT_QUESTION = "Where did people drop off in checkout?";

export const STUDY_SUBTITLE = "Checkout usability, 24 interviews";

export const PARAGRAPH_ANSWER = [
  "Across the 24 interviews in this Northline checkout study, participants most often hesitated at shipping address, delivery options, and payment confirmation. Several described re-reading fields, backing out to check the cart, or pausing when error copy felt vague. Mobile sessions amplified autocomplete issues and international format confusion.",
  "Desktop participants cited unexpected fees and delivery dates that read like extra charges. A few mentioned trust on payment retry, saved wallets buried below the fold, and confirmation screens that felt abrupt. Quotes live in separate docs; charts are rebuilt in slides.",
  "Follow-ups still mean exporting transcripts, hunting timestamps, and losing which quote belongs to which funnel step. Synthesis time stacks because nothing in the thread links numbers back to footage.",
];

export const CHECKOUT_FUNNEL = {
  summary: "Shipping address loses 38% of participants, the largest single-step drop in checkout.",
  emphasis: "loses 38% of participants",
  steps: [
    { label: "Cart", pct: 100, barColor: "#D6D3D1" },
    { label: "Address", pct: 62, focal: true, drop: 38, barColor: "#B43F7F" },
    { label: "Delivery", pct: 54, drop: 8, barColor: "#57534D" },
    { label: "Payment", pct: 42, drop: 12, barColor: "#A8A29E" },
    { label: "Confirm", pct: 36, drop: 6, barColor: "#D6D3D1" },
  ],
};

export const SOURCES = [
  { participant: "Jordan M.", topic: "checkout", time: "14:03" },
  { participant: "Marcus W.", topic: "payment", time: "21:08" },
  { participant: "Priya K.", topic: "address", time: "15:47" },
  { participant: "Hannah L.", topic: "payment", time: "22:41" },
];

export const FOLLOW_UPS = ["Show mobile only", "Compare to round 1"];

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

export const QUOTE_LIST = [
  { participant: "Jordan M.", quote: "I almost closed the tab when autocomplete cleared the apartment field." },
  { participant: "Priya K.", quote: "International format wasn't obvious on mobile." },
  { participant: "Sam R.", quote: "Fees showed up late enough that I double-checked the cart." },
];

export const ANATOMY_LABELS = [
  "Sources",
  "Summary",
  "Chart",
  "Clips",
  "Follow-ups",
];
