/**
 * Example data for the generative-UI routing demo.
 * Invented 24-participant checkout study. Labelled "Example data" in the UI.
 * Not real Dialogue research numbers.
 */

import {
  THIN_DATA_MIN_PARTICIPANTS,
  type CompareBy,
  type RoutingTopic,
} from "@/lib/dialogue/routing/constants";

export type Participant = {
  id: string;
  name: string;
  shopperType: "first_time" | "repeat";
  device: "mobile" | "desktop";
  fridayReading: "this_friday" | "unsure" | null;
  addressFriction: boolean;
  packagingDamage: boolean;
  returnsMention: boolean;
  quote?: { text: string; start: string; end: string };
  /** Said about returns. The shared quote can be about another topic. */
  returnsQuote?: string;
};

export const EXAMPLE_STUDY = {
  label: "Example data",
  title: "Checkout delivery promises",
  /** Same base as the case study figure (225 of 300). The named rows are a quoted extract. */
  participantCount: 300,
  quotedInterviews: 24,
  goal: "Understand how shoppers read delivery promises at checkout.",
} as const;

/** Case study Friday split. The named quotes below are a sample of this 300, not a second study. */
const FRIDAY_THIS = 225;
const FRIDAY_UNSURE = 75;
const FRIDAY_BASE = FRIDAY_THIS + FRIDAY_UNSURE;

/** 24 invented participants. Counts below are derived from this list only. */
export const PARTICIPANTS: Participant[] = [
  { id: "p01", name: "Ana", shopperType: "first_time", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "It says Friday, so I planned for this Friday.", start: "04:10", end: "04:24" } },
  { id: "p02", name: "Dev", shopperType: "repeat", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: true, quote: { text: "Friday means the closest one to me.", start: "11:02", end: "11:15" }, returnsQuote: "If the date slips I would start a return." },
  { id: "p03", name: "Mei", shopperType: "first_time", device: "mobile", fridayReading: "unsure", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "Friday which week?", start: "18:27", end: "18:49" } },
  { id: "p04", name: "Owen", shopperType: "repeat", device: "desktop", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "I checked the date to be sure.", start: "07:12", end: "07:30" } },
  { id: "p05", name: "Kai", shopperType: "first_time", device: "mobile", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "I am new here, so Friday meant this week to me.", start: "02:14", end: "02:28" } },
  { id: "p06", name: "Rae", shopperType: "first_time", device: "desktop", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "First order. I put Friday on my calendar as the nearest one.", start: "09:01", end: "09:16" } },
  { id: "p07", name: "Sam", shopperType: "repeat", device: "mobile", fridayReading: "unsure", addressFriction: true, packagingDamage: false, returnsMention: true, quote: { text: "I gave up guessing and looked for a real date.", start: "11:22", end: "11:40" }, returnsQuote: "I checked the return window before I paid." },
  { id: "p08", name: "Priya", shopperType: "first_time", device: "mobile", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "On my phone the country switch reset everything.", start: "16:02", end: "16:18" } },
  { id: "p09", name: "Jordan", shopperType: "repeat", device: "mobile", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "The apartment field kept clearing when I picked autocomplete.", start: "14:03", end: "14:19" } },
  { id: "p10", name: "Alex", shopperType: "repeat", device: "desktop", fridayReading: null, addressFriction: false, packagingDamage: true, returnsMention: true, quote: { text: "My first order showed up with the seal broken. I did not reorder.", start: "11:40", end: "11:55" }, returnsQuote: "I started a return when the seal was broken." },
  { id: "p11", name: "Tess", shopperType: "first_time", device: "desktop", fridayReading: "unsure", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "Friday felt like a guess, so I waited.", start: "05:18", end: "05:29" } },
  { id: "p12", name: "Luis", shopperType: "repeat", device: "desktop", fridayReading: "unsure", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "I looked for an actual date and didn't see one.", start: "22:40", end: "22:52" } },
  { id: "p13", name: "Ada", shopperType: "first_time", device: "mobile", fridayReading: "unsure", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "Is that this week or next?", start: "11:04", end: "11:15" } },
  { id: "p14", name: "Noor", shopperType: "repeat", device: "desktop", fridayReading: "this_friday", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "I treat Friday as this coming Friday unless it says otherwise.", start: "03:40", end: "03:52" } },
  { id: "p15", name: "Chris", shopperType: "first_time", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "Seemed clear enough. This Friday.", start: "08:11", end: "08:22" } },
  { id: "p16", name: "Ivy", shopperType: "repeat", device: "mobile", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: true, quote: { text: "I've ordered before, and Friday always meant this week.", start: "19:05", end: "19:18" }, returnsQuote: "Returns have been simple the times I used them." },
  { id: "p17", name: "Ben", shopperType: "first_time", device: "mobile", fridayReading: "unsure", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "I hovered on the label waiting for a tooltip.", start: "06:33", end: "06:45" } },
  { id: "p18", name: "Zoe", shopperType: "repeat", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "I planned dinner around that Friday.", start: "12:50", end: "13:02" } },
  { id: "p19", name: "Nate", shopperType: "first_time", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "I read it as a promise for this Friday.", start: "01:55", end: "02:08" } },
  { id: "p20", name: "Uma", shopperType: "repeat", device: "mobile", fridayReading: "unsure", addressFriction: true, packagingDamage: false, returnsMention: false, quote: { text: "Without a calendar date I wasn't sure.", start: "15:20", end: "15:34" } },
  { id: "p21", name: "Quinn", shopperType: "first_time", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "This Friday felt like the only reading.", start: "10:08", end: "10:19" } },
  { id: "p22", name: "Hiro", shopperType: "repeat", device: "desktop", fridayReading: "this_friday", addressFriction: false, packagingDamage: false, returnsMention: true, quote: { text: "Returns are easy, so the date mattered less.", start: "21:14", end: "21:28" }, returnsQuote: "Returns are easy, so the date mattered less." },
  { id: "p23", name: "Mina", shopperType: "first_time", device: "mobile", fridayReading: null, addressFriction: false, packagingDamage: true, returnsMention: false, quote: { text: "The box arrived crushed. I opened it and the bottle was cracked.", start: "04:12", end: "04:28" } },
  { id: "p24", name: "Eli", shopperType: "repeat", device: "desktop", fridayReading: "unsure", addressFriction: false, packagingDamage: false, returnsMention: false, quote: { text: "I almost asked support which Friday they meant.", start: "17:44", end: "17:58" } },
];

export type TopicMeta = {
  topic: RoutingTopic;
  label: string;
  questionHint: string;
  finding: (n: number, of: number) => string;
  /** Participants who support this finding (for thin-data checks). */
  supporters: (rows: Participant[]) => Participant[];
  hasCodedSegments: boolean;
  hasTimestamps: (rows: Participant[]) => boolean;
};

export const TOPICS: Record<RoutingTopic, TopicMeta> = {
  friday_reading: {
    topic: "friday_reading",
    label: "Arrives by Friday",
    questionHint: "How do shoppers read 'Arrives by Friday'?",
    finding: (n, of) =>
      `${n} of ${of} shoppers read 'Arrives by Friday' as this Friday.`,
    supporters: (rows) => rows.filter((p) => p.fridayReading !== null),
    hasCodedSegments: true,
    hasTimestamps: (rows) => rows.some((p) => p.fridayReading && p.quote),
  },
  address_friction: {
    topic: "address_friction",
    label: "Address friction",
    questionHint: "How widely did address friction show up?",
    finding: (n, of) =>
      `${n} of ${of} interviews mention address friction.`,
    supporters: (rows) => rows.filter((p) => p.addressFriction),
    hasCodedSegments: true,
    hasTimestamps: (rows) => rows.some((p) => p.addressFriction && p.quote),
  },
  packaging_damage: {
    topic: "packaging_damage",
    label: "Damaged first order",
    questionHint: "What did shoppers say about damaged packaging?",
    finding: (n, of) =>
      `${n} of ${of} shoppers mentioned a damaged first order.`,
    supporters: (rows) => rows.filter((p) => p.packagingDamage),
    hasCodedSegments: true,
    hasTimestamps: (rows) => rows.some((p) => p.packagingDamage && p.quote),
  },
  returns: {
    topic: "returns",
    label: "Returns",
    questionHint: "How often did returns come up?",
    finding: (n, of) => `${n} of ${of} shoppers mentioned returns.`,
    supporters: (rows) => rows.filter((p) => p.returnsMention),
    hasCodedSegments: true,
    hasTimestamps: (rows) => rows.some((p) => p.returnsMention && p.quote),
  },
};

export function topicSupportCount(topic: RoutingTopic): number {
  return TOPICS[topic].supporters(PARTICIPANTS).length;
}

export function isThinTopic(topic: RoutingTopic): boolean {
  return topicSupportCount(topic) < THIN_DATA_MIN_PARTICIPANTS;
}

export type CountSplitResolved = {
  finding: string;
  total: number;
  groups: { id: string; label: string; value: number; focal?: boolean; people: { name: string; time: string; quote: string }[] }[];
};

export function resolveCountSplit(topic: RoutingTopic): CountSplitResolved {
  const rows = PARTICIPANTS;
  if (topic === "friday_reading") {
    const friday = rows.filter((p) => p.fridayReading === "this_friday");
    const unsure = rows.filter((p) => p.fridayReading === "unsure");
    return {
      finding: `${FRIDAY_THIS} of ${FRIDAY_BASE} shoppers read 'Arrives by Friday' as this Friday, whatever day they ordered.`,
      total: FRIDAY_BASE,
      groups: [
        {
          id: "this_friday",
          label: "Read it as this Friday",
          value: FRIDAY_THIS,
          focal: true,
          people: friday.slice(0, 2).map((p) => toPerson(p, topic)),
        },
        {
          id: "unsure",
          label: "Unsure",
          value: FRIDAY_UNSURE,
          people: unsure.slice(0, 2).map((p) => toPerson(p, topic)),
        },
      ],
    };
  }
  const yes = TOPICS[topic].supporters(rows);
  const no = rows.filter((p) => !yes.includes(p));
  const quoted = rows.length;
  return {
    finding: `${yes.length} of ${quoted} quoted interviews mention ${TOPICS[topic].label.toLowerCase()}.`,
    total: quoted,
    groups: [
      {
        id: "mentioned",
        label: "Mentioned it",
        value: yes.length,
        focal: true,
        people: yes.slice(0, 2).map((p) => toPerson(p, topic)),
      },
      {
        id: "did_not",
        label: "Did not",
        value: no.length,
        people: no.slice(0, 2).map((p) => toPerson(p, topic)),
      },
    ],
  };
}

export type SegmentPerson = { name: string; time: string; quote: string };

export type SegmentResolved = {
  finding: string;
  rows: {
    label: string;
    value: number;
    display: string;
    pct: string;
    focal?: boolean;
    secondary?: boolean;
    people: SegmentPerson[];
  }[];
  /** Sum of the row values. The finding names this same count. */
  max: number;
};

export function resolveSegmentComparison(
  topic: RoutingTopic,
  compareBy: CompareBy = "shopper_type",
): SegmentResolved {
  const supporters = TOPICS[topic].supporters(PARTICIPANTS);
  const pair = (left: Participant[], right: Participant[], leftLabel: string, rightLabel: string, noun: string): SegmentResolved => {
    const sum = left.length + right.length;
    const share = (n: number) => (sum === 0 ? "0%" : `${Math.round((n / sum) * 100)}%`);
    return {
      finding: `${sum} quoted interviews mention ${TOPICS[topic].label.toLowerCase()}, split by ${noun}.`,
      max: Math.max(sum, 1),
      rows: [
        {
          label: leftLabel,
          value: left.length,
          display: String(left.length),
          pct: share(left.length),
          focal: true,
          people: left.slice(0, 2).map((p) => toPerson(p, topic)),
        },
        {
          label: rightLabel,
          value: right.length,
          display: String(right.length),
          pct: share(right.length),
          secondary: true,
          people: right.slice(0, 2).map((p) => toPerson(p, topic)),
        },
      ],
    };
  };
  if (compareBy === "device") {
    return pair(
      supporters.filter((p) => p.device === "mobile"),
      supporters.filter((p) => p.device === "desktop"),
      "Mobile",
      "Desktop",
      "device",
    );
  }
  return pair(
    supporters.filter((p) => p.shopperType === "first_time"),
    supporters.filter((p) => p.shopperType === "repeat"),
    "First-time",
    "Repeat",
    "shopper type",
  );
}

export type QuoteResolved = {
  finding: string;
  quotes: { name: string; time: string; quote: string }[];
};

export function resolveQuotes(topic: RoutingTopic, limit = 4): QuoteResolved {
  const people = TOPICS[topic]
    .supporters(PARTICIPANTS)
    .filter((p) => p.quote)
    .slice(0, limit)
    .map((p) => toPerson(p, topic));
  return {
    finding: findingLine(topic),
    quotes: people,
  };
}

export type ClipResolved = {
  finding: string;
  clips: { name: string; time: string; quote: string; start: string; end: string }[];
};

export function resolveClips(topic: RoutingTopic, limit = 3): ClipResolved {
  const clips = TOPICS[topic]
    .supporters(PARTICIPANTS)
    .filter((p) => p.quote)
    .slice(0, limit)
    .map((p) => ({
      name: p.name,
      time: `${p.quote!.start}\u2013${p.quote!.end}`,
      quote: spoken(p, topic),
      start: p.quote!.start,
      end: p.quote!.end,
    }));
  return {
    finding: findingLine(topic),
    clips,
  };
}

/** Shared finding line so count, quote and clip templates agree on the number. */
function findingLine(topic: RoutingTopic): string {
  if (topic === "friday_reading") {
    return `${FRIDAY_THIS} of ${FRIDAY_BASE} shoppers read 'Arrives by Friday' as this Friday, whatever day they ordered.`;
  }
  return `${topicSupportCount(topic)} of ${PARTICIPANTS.length} quoted interviews mention ${TOPICS[topic].label.toLowerCase()}.`;
}

export type ThinResolved = {
  finding: string;
  count: number;
  of: number;
  group: string;
  quotes: { name: string; time: string; quote: string }[];
  planPrompt: string;
  whyChart?: string;
  repeatSplit?: {
    finding: string;
    total: number;
    groups: { id: string; label: string; value: number; focal?: boolean }[];
  };
};

export function resolveThin(topic: RoutingTopic): ThinResolved {
  const supporters = TOPICS[topic].supporters(PARTICIPANTS);
  return {
    finding: TOPICS[topic].finding(supporters.length, PARTICIPANTS.length),
    count: supporters.length,
    of: PARTICIPANTS.length,
    group: "shoppers in this example study",
    quotes: supporters.filter((p) => p.quote).map((p) => toPerson(p, topic)),
    planPrompt: [
      `Follow up on ${TOPICS[topic].label.toLowerCase()}.`,
      `Only ${supporters.length} of ${PARTICIPANTS.length} shoppers mentioned it in the example study.`,
      "Ask about the first order, the packaging, and whether that changed a reorder.",
    ].join(" "),
  };
}

function spoken(p: Participant, topic?: RoutingTopic): string {
  if (topic === "returns" && p.returnsQuote) return p.returnsQuote;
  return p.quote?.text ?? "";
}

function toPerson(p: Participant, topic?: RoutingTopic) {
  return {
    name: p.name,
    time: p.quote ? `${p.quote.start}\u2013${p.quote.end}` : "",
    quote: spoken(p, topic),
  };
}
