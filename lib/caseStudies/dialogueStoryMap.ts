import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

export type StoryBeatStatus = "final" | "candidate";

export type DialogueStoryBeat = {
  id: string;
  beat: string;
  status: StoryBeatStatus;
  sectionLabel: string;
  heading: string;
  copy: string;
  caption: string;
  visualNote: string;
  pngSrc: string;
  alt: string;
};

/** fcc87a2-approved PNGs (pre–Oct 19 3:25 PM PT cutoff). */
function fccPng(file: string) {
  return `/dialogue/review/blobs/fcc87a2--${file}`;
}

/**
 * One row per case-study beat. Copy, headings, and captions from fcc87a2
 * `app/dialogue/page.tsx` and `lib/caseStudies/dialogue.ts`.
 */
export const DIALOGUE_STORY_BEATS: DialogueStoryBeat[] = [
  {
    id: "D-01",
    beat: "hero",
    status: "final",
    sectionLabel: "Hero",
    heading: DIALOGUE_TITLE,
    copy:
      "Dialogue case study on visualizing qualitative interview data so UX researchers can trust study chat answers down to the second.",
    caption: "Study page with the research assistant panel open, showing a structured answer.",
    visualNote:
      "Shows the hero frame: study page with the assistant open and a structured answer in context.",
    pngSrc: fccPng("section-6.png"),
    alt:
      "Dialogue study page with the research assistant panel open, showing a structured answer to a research question.",
  },
  {
    id: "D-02",
    beat: "section-1",
    status: "final",
    sectionLabel: "The problem",
    heading: "Answers came back as walls of text",
    copy:
      "Dialogue runs AI-moderated user interviews at scale for enterprise UX teams and startups. When a team asked the study chat a question, it got long paragraphs with no clear link to the interviews behind them.\n\nDialogue's mission is making research accessible to every team, turning conversations into insights in hours, not weeks. That promise breaks down when researchers cannot see where an answer came from.",
    caption: "Before and after, same question",
    visualNote:
      "Compares a dense text-only study chat answer with a structured answer (summary, chart, and clips) for the same question.",
    pngSrc: fccPng("section-1.png"),
    alt:
      "Side by side comparison of a dense text-only study chat answer and a structured answer with summary, chart, and clips.",
  },
  {
    id: "D-03",
    beat: "section-2",
    status: "final",
    sectionLabel: "Process",
    heading: "From question types to one answer pattern",
    copy:
      "Reviewed real questions teams asked the chat and grouped them by type. Matched each type to the answer shape that fits it best. Defined one structure every answer follows. Prototyped in Cursor and Paper, then reviewed the prototypes with the founders.",
    caption: "Four kinds of questions, four answer shapes",
    visualNote:
      "Shows four study chat questions, each paired with a different chart and clip layout.",
    pngSrc: fccPng("section-2.png"),
    alt: "Four study chat questions each paired with a different chart and clip layout.",
  },
  {
    id: "D-04",
    beat: "section-3",
    status: "final",
    sectionLabel: "Design decision",
    heading: "One structure for every answer",
    copy:
      "Each answer shows its sources, a summary, a chart built for the question, timestamped clips, and follow-ups. The chart changes, but the order never does.",
    caption: "Sources, summary, query chart, timestamped clips, follow-ups",
    visualNote:
      "Annotated answer highlighting the five parts researchers always see in the same order.",
    pngSrc: fccPng("section-3.png"),
    alt:
      "Annotated study chat answer highlighting sources, summary, query chart, clips, and follow-ups.",
  },
  {
    id: "D-05",
    beat: "section-4",
    status: "final",
    sectionLabel: "Design decision",
    heading: "Every number links to its evidence",
    copy:
      "Selecting a bar or data point filters the clips to the moments behind it, so a chart never floats on its own.",
    caption: "From a data point to the clips behind it",
    visualNote: "Shows chart selection filtering the timestamped clip list below.",
    pngSrc: fccPng("section-4.png"),
    alt: "Bar chart selection filtering the timestamped clip list below.",
  },
  {
    id: "D-06",
    beat: "section-5",
    status: "final",
    sectionLabel: "Design decision",
    heading: "Clips open at the exact second",
    copy:
      "Each clip opens the recording at its timestamp. The transcript scrolls with the video, and the speaker's row stays highlighted so the quote shows up in context.",
    caption: "Recording, synced transcript, highlighted speaker",
    visualNote:
      "Shows the clip player with recording, synced transcript, and highlighted speaker row.",
    pngSrc: fccPng("section-5.png"),
    alt: "Interview recording with synced transcript and highlighted speaker row.",
  },
  {
    id: "D-07",
    beat: "section-6",
    status: "final",
    sectionLabel: "Solution",
    heading: "Easy to trust and easy to use",
    copy:
      "Same place, same five parts every time, and one click from a claim to the moment that proves it. That is what visualizing qualitative data for UX researchers looked like in this exploration.",
    caption: "Pop-up chat, the pattern in the product today",
    visualNote:
      "Shows the pop-up research assistant over the study page—the pattern used in the product.",
    pngSrc: fccPng("section-6.png"),
    alt: "Pop-up research assistant chat over the study page, the pattern used in the product.",
  },
  {
    id: "D-08",
    beat: "section-7",
    status: "final",
    sectionLabel: "Solution",
    heading: "Easy to trust and easy to use",
    copy:
      "Same place, same five parts every time, and one click from a claim to the moment that proves it.",
    caption: "A full answer with every clip in one drawer",
    visualNote: "Shows a full structured answer with every supporting clip listed in one drawer.",
    pngSrc: fccPng("section-7.png"),
    alt: "Full structured answer with a drawer listing every supporting clip.",
  },
  {
    id: "D-09",
    beat: "section-6a",
    status: "final",
    sectionLabel: "Solution",
    heading: "Easy to trust and easy to use",
    copy:
      "The panel opens before a question is asked, with a default title so researchers know where to start.",
    caption: "The panel opens with Research assistant as its default title before any question",
    visualNote:
      "Shows the empty assistant panel titled Research assistant before any question is asked.",
    pngSrc: fccPng("section-6a.png"),
    alt:
      "Empty research assistant panel on a study page, titled Research assistant before a question is asked.",
  },
  {
    id: "D-10",
    beat: "section-6b",
    status: "final",
    sectionLabel: "Design decision",
    heading: "Bubble over sidebar",
    copy:
      "I explored a docked sidebar, but kept the bubble. It stays one tap away on any page and collapses out of the way when researchers are reading transcripts.",
    caption: "Docked sidebar exploration",
    visualNote: "Shows the docked sidebar exploration along the right edge of the study page.",
    pngSrc: fccPng("section-6b.png"),
    alt: "Study page with a docked research assistant sidebar along the right edge.",
  },
];
