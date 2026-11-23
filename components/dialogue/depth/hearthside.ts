/* Hearthside mock data for the depth explorations. Every value is copied from MOCK-DATA.md section 4 or
   DialogueChartLibrary.tsx (illustrative, labelled as such on the page). Nothing here is new. */
import type { DenominatorGroup } from "@/components/dialogue/depth/DenominatorReveal/DenominatorReveal";
import type { EvidenceSide, EvidenceSideData } from "@/components/dialogue/depth/EvidenceLayer/EvidenceLayer";

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
