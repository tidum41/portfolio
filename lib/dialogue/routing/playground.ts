/**
 * Playground r2 option A. Hearthside illustrative counts only (case study numbers).
 */

import type { RoutingTemplate } from "@/lib/dialogue/routing/constants";
import type {
  CountSplitResolved,
  SegmentResolved,
  ThinResolved,
} from "@/lib/dialogue/routing/sampleDataset";
import { QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";

export const PLAYGROUND_PRESETS = [
  "How do shoppers read 'Arrives by Friday'?",
  "Do new and repeat shoppers read it the same way?",
  "What did shoppers ask for after checkout?",
  "Which delivery badge most changed confidence to add to cart?",
  "Did anyone miss a delivery over 'Arrives by Friday'?",
] as const;

const HEARTH_TOTAL = 300;

export type RankedResolved = {
  finding: string;
  whyChart: string;
  max: number;
  rows: { label: string; value: number; display: string; focal?: boolean; pct?: string }[];
};

export type BadgeResolved = {
  finding: string;
  whyChart: string;
  max: number;
  rows: { label: string; value: number; display: string; focal?: boolean; pct?: string }[];
};

export type PlaygroundAnswer =
  | { template: "count_split"; data: CountSplitResolved & { whyChart: string } }
  | { template: "segment_comparison"; data: SegmentResolved & { whyChart: string } }
  | { template: "ranked_list"; data: RankedResolved }
  | { template: "badge_list"; data: BadgeResolved }
  | { template: "thin_data"; data: ThinResolved & { whyChart: string } };

function norm(q: string) {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}

export function matchPlaygroundTemplate(question: string): RoutingTemplate | null {
  const q = norm(question);
  if (
    q.includes("arrives by friday") &&
    (q.startsWith("how do") || q.includes("how shoppers read") || q.includes("read "))
  ) {
    return "count_split";
  }
  if ((q.includes("new and repeat") || q.includes("first-time")) && q.includes("same way")) {
    return "segment_comparison";
  }
  if (q.includes("ask for") && q.includes("checkout")) return "ranked_list";
  if (q.includes("badge") && (q.includes("confidence") || q.includes("cart"))) return "badge_list";
  if (q.includes("miss") && q.includes("delivery")) return "thin_data";
  if (q.includes("repeat shoppers") && q.includes("read")) return "segment_comparison";
  return null;
}

export function resolvePlayground(question: string): PlaygroundAnswer | null {
  const template = matchPlaygroundTemplate(question);
  if (!template) return null;
  switch (template) {
    case "count_split":
      return { template, data: resolveFridayCount() };
    case "segment_comparison":
      return { template, data: resolveFridayByShopperType() };
    case "ranked_list":
      return { template, data: resolveRankedAsks() };
    case "badge_list":
      return { template, data: resolveBadgePreference() };
    case "thin_data":
      return { template, data: resolveThinMissedDelivery() };
    default:
      return null;
  }
}

function resolveFridayCount(): CountSplitResolved & { whyChart: string } {
  return {
    finding:
      "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.",
    total: HEARTH_TOTAL,
    whyChart: "Two short groups fit one bar. Each side shows its count out of 300.",
    groups: [
      {
        id: "this_friday",
        label: "Read it as this Friday",
        value: 225,
        focal: true,
        people: QUOTE_LIST_FRIDAY.slice(0, 2).map((q) => ({
          name: q.participant,
          time: q.time,
          quote: q.quote,
        })),
      },
      {
        id: "unsure",
        label: "Unsure",
        value: 75,
        people: [
          {
            name: "Mei",
            time: "18:27\u201318:49",
            quote: "Friday which week?",
          },
          {
            name: "Sam",
            time: "11:22\u201311:40",
            quote: "I gave up guessing and looked for a real date.",
          },
        ],
      },
    ],
  };
}

function resolveFridayByShopperType(): SegmentResolved & { whyChart: string } {
  return {
    finding:
      "9 of 14 new shoppers and 88 of 125 repeat shoppers read \u2018Arrives by Friday\u2019 as this Friday.",
    max: 1,
    whyChart: "Each row counts people out of its own group, not out of 300.",
    rows: [
      {
        label: "New shoppers",
        value: 9 / 14,
        display: "9 of 14",
        pct: "64%",
        focal: true,
        people: [],
      },
      {
        label: "Repeat shoppers",
        value: 88 / 125,
        display: "88 of 125",
        pct: "70%",
        people: [],
      },
    ],
  };
}

function resolveRankedAsks(): RankedResolved {
  const rows = [
    { label: "Show an exact calendar date", value: 41 },
    { label: "Say which Friday it means", value: 28 },
    { label: "Warn when Friday slips", value: 17 },
    { label: "Offer a pickup option", value: 11 },
    { label: "Email the day before", value: 8 },
  ];
  const max = rows[0].value;
  return {
    finding: "What shoppers asked for after checkout, top five.",
    whyChart: "Bars scale to the top ask. Each count is out of 300.",
    max,
    rows: rows.map((row, i) => ({
      label: row.label,
      value: row.value,
      display: `${row.value} of ${HEARTH_TOTAL}`,
      focal: i === 0,
      pct: `${Math.round((row.value / HEARTH_TOTAL) * 100)}%`,
    })),
  };
}

function resolveBadgePreference(): BadgeResolved {
  const rows = [
    { label: "A \u2018Arrives by Friday\u2019", value: 118, focal: true },
    { label: "B \u2018Free delivery over $50\u2019", value: 72 },
    { label: "C \u2018Free returns for 30 days\u2019", value: 110 },
  ];
  return {
    finding: "Which delivery badge most changed confidence to add to cart.",
    whyChart: "Three badges, each counted out of the same 300 shoppers.",
    max: HEARTH_TOTAL,
    rows: rows.map((row) => ({
      label: row.label,
      value: row.value,
      display: `${row.value} of ${HEARTH_TOTAL}`,
      focal: row.focal,
      pct: `${Math.round((row.value / HEARTH_TOTAL) * 100)}%`,
    })),
  };
}

function resolveThinMissedDelivery(): ThinResolved & { whyChart: string } {
  return {
    finding: "Two of 300 shoppers said they missed a delivery over \u2018Arrives by Friday\u2019.",
    count: 2,
    of: HEARTH_TOTAL,
    group: "shoppers in this study",
    whyChart: "Under three people, so the answer is a flag, not a bar chart.",
    quotes: [
      {
        name: "Luis",
        time: "22:40\u201322:52",
        quote: "It showed up the week after the Friday I expected.",
      },
      {
        name: "Eli",
        time: "17:44\u201317:58",
        quote: "I almost asked support which Friday they meant.",
      },
    ],
    planPrompt:
      "Follow up on missed deliveries tied to the Friday label. Only 2 of 300 mentioned it in this study.",
    repeatSplit: {
      finding: "Among repeat shoppers, 88 of 125 read it as this Friday and 37 were unsure.",
      total: 125,
      groups: [
        { id: "repeat_yes", label: "Read it as this Friday", value: 88, focal: true },
        { id: "repeat_unsure", label: "Unsure", value: 37 },
      ],
    },
  };
}

export type PlaygroundThinResolved = ThinResolved & {
  whyChart: string;
  repeatSplit?: {
    finding: string;
    total: number;
    groups: { id: string; label: string; value: number; focal?: boolean }[];
  };
};
