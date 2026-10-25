/** Example data for dashboard draft specimens. Not study facts. */

export const MOCK_TAG = "Example data";

export const MOCK_THEME_COUNTS = [
  { theme: "Address friction", count: 18, total: 24 },
  { theme: "Unexpected fees", count: 13, total: 24 },
  { theme: "Payment retry", count: 10, total: 24 },
  { theme: "Delivery dates", count: 7, total: 24 },
] as const;

export const MOCK_PARTICIPANTS = ["Jordan M.", "Priya K.", "Sam R.", "Marcus W.", "Hannah L.", "Alex P."] as const;

export const MOCK_MATRIX_THEMES = ["Address", "Fees", "Payment", "Delivery"] as const;

/** 1 = raised the theme; 0 = did not. Rows are participants. */
export const MOCK_MATRIX: readonly (readonly number[])[] = [
  [1, 1, 0, 1],
  [1, 0, 1, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 1, 1],
  [0, 1, 0, 0],
];

export const MOCK_DIVERGING = [
  { label: "Felt stuck", value: -11 },
  { label: "Needed help", value: -7 },
  { label: "Neutral", value: 3 },
  { label: "Found a path", value: 8 },
  { label: "Finished easily", value: 14 },
] as const;

export const MOCK_EVIDENCE_BARS = [
  {
    theme: "Apartment field cleared",
    count: 9,
    total: 24,
    quotes: [
      { who: "Jordan M.", text: "The apartment field kept clearing when I picked autocomplete." },
      { who: "Priya K.", text: "On my phone the country switch reset everything." },
    ],
  },
  {
    theme: "Format was unclear",
    count: 6,
    total: 24,
    quotes: [
      { who: "Priya K.", text: "International format was not obvious; I typed the address twice." },
    ],
  },
  {
    theme: "Gave up on saved address",
    count: 3,
    total: 24,
    quotes: [{ who: "Sam R.", text: "I gave up on saved address and typed it again with my thumbs." }],
  },
] as const;

export const MOCK_ONBOARDING_THEMES = [
  { theme: "Could not find the invite link", participants: 13, total: 20 },
  { theme: "First task was unclear", participants: 9, total: 20 },
  { theme: "Settings hard to reach", participants: 6, total: 20 },
  { theme: "Wanted a starting template", participants: 4, total: 20 },
] as const;
