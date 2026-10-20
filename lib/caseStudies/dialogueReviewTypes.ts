export type ReviewTileStatus = "final" | "candidate";

export type ReviewTile = {
  id: string;
  kind: "image";
  status: ReviewTileStatus;
  sha: string;
  shaShort: string;
  date: string;
  datePt: string;
  file: string;
  src: string;
  width: number;
  height: number;
};

export type DialogueReviewManifest = {
  builtAt: string;
  fccSha: string;
  cutoffBefore: string;
  counts: { final: number; candidate: number };
  tiles: ReviewTile[];
};
