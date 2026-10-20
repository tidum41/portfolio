import { dialogueRasterSizeForPublicPath } from "@/lib/caseStudies/dialogue";

export type CanvasAssetStatus = "final" | "candidate";

export type DialogueCanvasAsset = {
  id: string;
  sectionId: string;
  status: CanvasAssetStatus;
  visualNote: string;
  pngSrc: string | null;
  exportRoute: string;
  staticExportSrc: string | null;
  rasterWidth: number | null;
  rasterHeight: number | null;
};

function staticExportSrcForRoute(exportRoute: string): string | null {
  if (exportRoute === "section-imperfect" || exportRoute === "section-share") return null;
  const file = exportRoute === "hero" ? "hero.html" : `${exportRoute}.html`;
  return `/dev/dialogue-static/export/${file}`;
}

function rasterDims(pngSrc: string | null): { rasterWidth: number | null; rasterHeight: number | null } {
  if (!pngSrc) return { rasterWidth: null, rasterHeight: null };
  const { width, height } = dialogueRasterSizeForPublicPath(pngSrc);
  return { rasterWidth: width, rasterHeight: height };
}

const RAW_ASSETS: Omit<DialogueCanvasAsset, "staticExportSrc" | "rasterWidth" | "rasterHeight">[] = [
  {
    id: "D-01",
    sectionId: "hero",
    status: "final",
    visualNote: "Hero: structured answer with summary and funnel chart (round-34 section-6).",
    pngSrc: "/dialogue/section-6.png",
    exportRoute: "hero",
  },
  {
    id: "D-02",
    sectionId: "problem",
    status: "final",
    visualNote: "Problem frame: dense paragraphs without sources (section-1).",
    pngSrc: "/dialogue/section-1.png",
    exportRoute: "section-1",
  },
  {
    id: "D-03",
    sectionId: "problem",
    status: "final",
    visualNote: "Solution frame: paired column (section-1).",
    pngSrc: "/dialogue/section-1.png",
    exportRoute: "section-1",
  },
  {
    id: "D-04",
    sectionId: "problem",
    status: "candidate",
    visualNote: "DecisionBlock option: paragraphs format (section-1).",
    pngSrc: "/dialogue/section-1.png",
    exportRoute: "section-1",
  },
  {
    id: "D-05",
    sectionId: "problem",
    status: "candidate",
    visualNote: "DecisionBlock option: quote list (section-2).",
    pngSrc: "/dialogue/section-2.png",
    exportRoute: "section-2",
  },
  {
    id: "D-06",
    sectionId: "problem",
    status: "final",
    visualNote: "DecisionBlock chosen: structured answer (section-4).",
    pngSrc: "/dialogue/section-4.png",
    exportRoute: "section-4",
  },
  {
    id: "D-07",
    sectionId: "problem",
    status: "final",
    visualNote: "Bar selection filters clips (section-4).",
    pngSrc: "/dialogue/section-4.png",
    exportRoute: "section-4",
  },
  {
    id: "D-08",
    sectionId: "one-structure",
    status: "final",
    visualNote: "Fixed answer anatomy (section-3).",
    pngSrc: "/dialogue/section-3.png",
    exportRoute: "section-3",
  },
  {
    id: "D-09",
    sectionId: "fitted-charts",
    status: "final",
    visualNote: "Four question types, four chart shapes (section-2).",
    pngSrc: "/dialogue/section-2.png",
    exportRoute: "section-2",
  },
  {
    id: "D-10",
    sectionId: "clips",
    status: "final",
    visualNote: "Clip opens at timestamp with highlighted speaker (section-5).",
    pngSrc: "/dialogue/section-5.png",
    exportRoute: "section-5",
  },
  {
    id: "D-11",
    sectionId: "imperfect-evidence",
    status: "candidate",
    visualNote: "Visual pending: counter-evidence, low coverage, zero match.",
    pngSrc: null,
    exportRoute: "section-imperfect",
  },
  {
    id: "D-12",
    sectionId: "share-finding",
    status: "candidate",
    visualNote: "Visual pending: copy as card export.",
    pngSrc: null,
    exportRoute: "section-share",
  },
  {
    id: "D-13",
    sectionId: "placement",
    status: "final",
    visualNote: "Docked sidebar exploration (section-6b).",
    pngSrc: "/dialogue/section-6b.png",
    exportRoute: "section-6b",
  },
  {
    id: "D-14",
    sectionId: "placement",
    status: "final",
    visualNote: "Floating bubble pattern (section-6).",
    pngSrc: "/dialogue/section-6.png",
    exportRoute: "section-6",
  },
  {
    id: "D-15",
    sectionId: "full-answer",
    status: "final",
    visualNote: "Full answer with clips drawer (section-7).",
    pngSrc: "/dialogue/section-7.png",
    exportRoute: "section-7",
  },
];

export const DIALOGUE_CANVAS_ASSETS: DialogueCanvasAsset[] = RAW_ASSETS.map((asset) => {
  const dims = rasterDims(asset.pngSrc);
  return {
    ...asset,
    staticExportSrc: staticExportSrcForRoute(asset.exportRoute),
    ...dims,
  };
});

export const DIALOGUE_CANVAS_BY_ID: Record<string, DialogueCanvasAsset> = Object.fromEntries(
  DIALOGUE_CANVAS_ASSETS.map((a) => [a.id, a]),
);

export const DIALOGUE_STATIC_EXPORT_ROOT = "/dev/dialogue-static";
