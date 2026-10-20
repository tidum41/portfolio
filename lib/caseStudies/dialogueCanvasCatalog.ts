export type CanvasAssetStatus = "final" | "candidate";

export type DialogueCanvasAsset = {
  id: string;
  src: string;
  status: CanvasAssetStatus;
  visualNote: string;
  exportRoute: string;
};

const ASSETS: DialogueCanvasAsset[] = [
  {
    id: "D-01",
    src: "/dialogue/section-6.png",
    status: "final",
    visualNote:
      "Hero frame: study page with the assistant open and a structured answer in context.",
    exportRoute: "hero",
  },
  {
    id: "D-02",
    src: "/dialogue/section-1.png",
    status: "final",
    visualNote:
      "Compares a dense text-only study chat answer with a structured answer for the same question.",
    exportRoute: "section-1",
  },
  {
    id: "D-03",
    src: "/dialogue/section-2.png",
    status: "final",
    visualNote: "Four study chat questions, each with a different chart and clip layout.",
    exportRoute: "section-2",
  },
  {
    id: "D-04",
    src: "/dialogue/section-3.png",
    status: "final",
    visualNote: "Annotated answer: sources, summary, chart, clips, and follow-ups in order.",
    exportRoute: "section-3",
  },
  {
    id: "D-05",
    src: "/dialogue/section-4.png",
    status: "final",
    visualNote: "Chart selection filtering the timestamped clip list below.",
    exportRoute: "section-4",
  },
  {
    id: "D-06",
    src: "/dialogue/section-5.png",
    status: "final",
    visualNote: "Clip player with recording, synced transcript, and highlighted speaker row.",
    exportRoute: "section-5",
  },
  {
    id: "D-07",
    src: "/dialogue/section-6b.png",
    status: "final",
    visualNote: "Docked sidebar exploration along the right edge of the study page.",
    exportRoute: "section-6b",
  },
  {
    id: "D-08",
    src: "/dialogue/section-6a.png",
    status: "final",
    visualNote: "Empty assistant panel titled Research assistant before any question.",
    exportRoute: "section-6a",
  },
  {
    id: "D-09",
    src: "/dialogue/section-6.png",
    status: "final",
    visualNote: "Pop-up research assistant over the study page (in-product pattern).",
    exportRoute: "section-6",
  },
  {
    id: "D-10",
    src: "/dialogue/section-7.png",
    status: "final",
    visualNote: "Full structured answer with every supporting clip in one drawer.",
    exportRoute: "section-7",
  },
];

export const DIALOGUE_CANVAS_ASSETS = ASSETS;

export const DIALOGUE_CANVAS_BY_ID: Record<string, DialogueCanvasAsset> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a]),
);

export const PRIVATE_EXPORT_REPO =
  "https://origin.cursor.com/git/muditm/tmp-2a0ae96295f1ba40.git";
export const PRIVATE_EXPORT_COMMIT = "483274f";
