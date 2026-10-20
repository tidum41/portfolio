import type { DialogueReviewManifest, ReviewTileStatus } from "./dialogueReviewTypes";

export const REVIEW_TOOLBAR_H = 52;
export const REVIEW_LAYOUT = {
  CONTENT_PAD: 64,
  TILE_GAP: 48,
  ROW_GAP: 96,
  ROW_LABEL_H: 48,
  LABEL_GAP: 32,
  CAPTION_GAP: 8,
  CAPTION_BLOCK_H: 44,
  MAX_PER_ROW: 10,
} as const;

export type ReviewLayoutTile = {
  id: string;
  status: ReviewTileStatus;
  kind: "image" | "row-label";
  x: number;
  y: number;
  w: number;
  h: number;
  tile: DialogueReviewManifest["tiles"][0];
  label?: string;
};

export type ReviewLayout = {
  tiles: ReviewLayoutTile[];
  fitBounds: { minX: number; minY: number; maxX: number; maxY: number };
  worldW: number;
  worldH: number;
};

const STATUS_ORDER: ReviewTileStatus[] = ["final", "candidate"];
const STATUS_LABEL: Record<ReviewTileStatus, string> = {
  final: "Final",
  candidate: "Candidate",
};

export function computeDialogueReviewLayout(manifest: DialogueReviewManifest): ReviewLayout {
  const { CONTENT_PAD, TILE_GAP, ROW_GAP, ROW_LABEL_H, LABEL_GAP, CAPTION_GAP, CAPTION_BLOCK_H, MAX_PER_ROW } =
    REVIEW_LAYOUT;

  const layoutTiles: ReviewLayoutTile[] = [];
  let y: number = CONTENT_PAD;
  let maxRight: number = CONTENT_PAD;

  const bumpRight = (x: number, w: number) => {
    maxRight = Math.max(maxRight, x + w);
  };

  for (const status of STATUS_ORDER) {
    const group = manifest.tiles.filter((t) => t.status === status);
    if (group.length === 0) continue;

    const labelW = Math.max(400, maxRight - CONTENT_PAD);
    layoutTiles.push({
      id: `label-${status}`,
      status,
      kind: "row-label",
      x: CONTENT_PAD,
      y,
      w: labelW,
      h: ROW_LABEL_H,
      tile: group[0],
      label: `${STATUS_LABEL[status]} (${group.length})`,
    });
    y += ROW_LABEL_H + LABEL_GAP;

    for (let i = 0; i < group.length; i += MAX_PER_ROW) {
      const row = group.slice(i, i + MAX_PER_ROW);
      let x = CONTENT_PAD;
      let rowH = 0;
      for (const tile of row) {
        const mediaW = tile.width || 400;
        const mediaH = tile.height || 300;
        const w = Math.max(mediaW, 120);
        const h = CAPTION_BLOCK_H + CAPTION_GAP + mediaH;
        layoutTiles.push({
          id: tile.id,
          status,
          kind: tile.kind,
          x,
          y,
          w,
          h,
          tile,
        });
        bumpRight(x, w);
        rowH = Math.max(rowH, h);
        x += w + TILE_GAP;
      }
      y += rowH + ROW_GAP;
    }
    y += ROW_GAP / 2;
  }

  y += CONTENT_PAD;
  const fitBounds = {
    minX: CONTENT_PAD,
    minY: CONTENT_PAD,
    maxX: maxRight + CONTENT_PAD,
    maxY: y,
  };

  return {
    tiles: layoutTiles,
    fitBounds,
    worldW: fitBounds.maxX + CONTENT_PAD,
    worldH: y,
  };
}

export function computeReviewFitCamera({
  viewportW,
  viewportH,
  bounds,
  pad,
}: {
  viewportW: number;
  viewportH: number;
  bounds: ReviewLayout["fitBounds"];
  pad: number;
}) {
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const availW = Math.max(1, viewportW - pad * 2);
  const availH = Math.max(1, viewportH - pad * 2);
  const z = Math.min(availW / bw, availH / bh);
  const clampedZ = Math.min(2, Math.max(0.02, z));
  const x = (viewportW - bw * clampedZ) / 2 - bounds.minX * clampedZ;
  const y = (viewportH - bh * clampedZ) / 2 - bounds.minY * clampedZ;
  return { x, y, z: clampedZ };
}

export const ROW_LABEL_WORLD_PX = 13;
export const ROW_LABEL_MIN_SCREEN_PX = 12;

export function rowLabelScreenPx(z: number): number {
  const scaled = ROW_LABEL_WORLD_PX * z;
  if (scaled >= ROW_LABEL_MIN_SCREEN_PX) return scaled;
  return ROW_LABEL_MIN_SCREEN_PX;
}

export function rowLabelToTileScreenGap(z: number): number {
  const { ROW_LABEL_H, LABEL_GAP } = REVIEW_LAYOUT;
  return z * (ROW_LABEL_H + LABEL_GAP) - rowLabelScreenPx(z);
}
