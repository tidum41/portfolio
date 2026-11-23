/* Hearthside mock data for the depth explorations. Every value is copied from MOCK-DATA.md section 4 or
   DialogueChartLibrary.tsx (illustrative, labelled as such on the page). Nothing here is new. */
import type { DenominatorGroup } from "@/components/dialogue/depth/DenominatorReveal/DenominatorReveal";
import type { EvidenceSide, EvidenceSideData } from "@/components/dialogue/depth/EvidenceLayer/EvidenceLayer";
import type { ChosenStep } from "@/components/dialogue/depth/ChartChosen/ChartChosen";

export const FRIDAY_TOTAL = 300;
export const FRIDAY_QUESTION = "How do shoppers read \u2018Arrives by Friday\u2019?";
export const FRIDAY_FINDING = "225 of 300 shoppers read ‘Arrives by Friday’ as this Friday, whatever day they ordered.";
export const FRIDAY_SIDES: Readonly<Record<EvidenceSide, EvidenceSideData>> = {
  friday: {
    label: "Read it as this Friday",
    count: 225,
    people: [
      { name: "Ana", time: "04:10", end: "04:24", quote: "It says Friday, so I planned for this Friday." },
      { name: "Dev", time: "11:02", end: "11:15", quote: "Friday means the closest one to me." },
    ],
  },
  unsure: {
    label: "Unsure",
    count: 75,
    people: [
      { name: "Mei", time: "18:27", end: "18:49", quote: "Friday which week?" },
      { name: "Owen", time: "07:12", end: "07:30", quote: "I’d assume Friday after I order, so I checked the date." },
    ],
  },
};

/** The approved unequal-segments pair (DialogueChartLibrary SEGMENTS, Mudit Nov 9). */
export const BY_GROUP_TITLE = "Read ‘Arrives by Friday’ as this Friday, by group";
export const BY_GROUP: readonly [DenominatorGroup, DenominatorGroup] = [
  { label: "New shoppers", count: 9, of: 14, tone: "focal" },
  { label: "Repeat shoppers", count: 88, of: 125, tone: "mid" },
];

/** Exploration 3: the three Match the chart rows (DialogueChartLibrary ChartTemplatesPairs), same questions, titles and counts. */
export const CHOSEN_STEPS = [
  {
    question: "How many read it which way?",
    title: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday.",
    total: 300,
    modelPick: "split",
    groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }],
  },
  {
    question: "What did people ask for?",
    title: "What shoppers asked for after checkout, top five",
    total: 300,
    modelPick: "ranked",
    groups: [
      { label: "Show an exact calendar date", value: 41, focal: true },
      { label: "Say which Friday it means", value: 28 },
      { label: "Warn when Friday slips", value: 17 },
      { label: "Offer a pickup option", value: 11 },
      { label: "Email the day before", value: 8 },
    ],
  },
  {
    question: "Did anyone miss a delivery?",
    title: "Two of 300 shoppers said they missed a delivery.",
    total: 300,
    modelPick: "flag",
    groups: [{ label: "Missed a delivery", value: 2 }],
  },
] as const satisfies readonly ChosenStep[];
