/**
 * Hearthside, a fictional online home goods store. All data in this file is
 * invented mock data for the case study figures (round P). The only numbers
 * allowed in the figures are the ones recorded here: the 24-interview study,
 * its segment sizes (9, 10, 5), the finding counts (18 of 24, 6 of 24,
 * 6 of 9, 7 of 10, 9 of 24 with its 4/3/2 segment split, 2 of 5), and the
 * participants' real timecode ranges.
 */

export const HEARTHSIDE_STUDY_SUBTITLE = "Checkout signals, 24 interviews";

export const HEARTHSIDE_STUDY_NAME = "Checkout signals: what makes shoppers commit?";

export type HearthsideQuote = {
  name: string;
  range: string;
  text: string;
};

export const FRIDAY_QUESTION = "How did shoppers read 'Arrives by Friday'?";

export const FRIDAY_FINDING =
  "18 of 24 shoppers read 'Arrives by Friday' as this Friday, whatever day they ordered.";

export const FRIDAY_QUOTES: HearthsideQuote[] = [
  { name: "Mei", range: "18:27-18:49", text: "Friday which week?" },
  { name: "Owen", range: "07:12-07:30", text: "I'd assume Friday after I order, so I checked the date." },
];

export const PRICE_QUESTION = "Where did shoppers hesitate?";

export const PRICE_SPLIT = [
  { label: "First-time", value: 4 },
  { label: "Repeat", value: 3 },
  { label: "Lapsed", value: 2 },
] as const;

export const AISHA_QUOTE: HearthsideQuote = {
  name: "Aisha",
  range: "15:40-16:02",
  text: "That's where the price stopped being the price.",
};

export const COMPARISON_ROWS = [
  {
    segment: "First-time buyers",
    theme: "Free returns",
    count: "6 of 9",
    mentioned: 6,
    total: 9,
    quote: {
      name: "Tomas",
      range: "12:04-12:31",
      text: "If I can send it back I'll take the chance on a couch I haven't sat on.",
    },
    clipTime: "12:04",
    clipPhoto: "/dev/dialogue-static/clip-photos/clip-02.jpg",
  },
  {
    segment: "Repeat buyers",
    theme: "Arrives by Friday",
    count: "7 of 10",
    mentioned: 7,
    total: 10,
    quote: {
      name: "Hannah",
      range: "09:18-09:35",
      text: "I just want to know it's here before the weekend.",
    },
    clipTime: "09:18",
    clipPhoto: "/dev/dialogue-static/clip-photos/clip-03.jpg",
  },
] as const;

export const THIN_QUESTION = "What did lapsed buyers say about their first order?";

export const THIN_PROMPT = [
  "Plan the next study on lapsed buyers.",
  "In the last study, 2 of 5 lapsed buyers mentioned a damaged first order. The count is small, so treat it as a lead.",
  "Recruit more lapsed buyers and ask each about their first order.",
  "Report how many mention it and quote the moment they noticed.",
].join("\n\n");

/** The before chat's raw-text summary table (invented data, like the rest). */
export const BEFORE_TABLE = [
  { name: "Priya", theme: "Unclear Friday promise" },
  { name: "Tomas", theme: "Delivery fee at cart" },
  { name: "Aisha", theme: "Delivery fee at cart" },
  { name: "Marcus", theme: "Unclear Friday promise" },
  { name: "Jen", theme: "Delivery fee at cart" },
  { name: "Sofia", theme: "Unclear Friday promise" },
] as const;
