import type { DialogueArchiveManifest } from "./dialogueArchiveTypes";

/** Bottom toolbar height (must match DialogueArchiveCanvas toolbar padding). */
export const ARCHIVE_TOOLBAR_H = 52;

export const ARCHIVE_LAYOUT = {
  CONTENT_PAD: 64,
  TILE_GAP: 48,
  ROW_GAP: 120,
  ROW_LABEL_H: 36,
  LABEL_GAP: 12,
  CAPTION_H: 48,
  PLACEMENT_MAX_PER_ROW: 8,
  LIVE_W: 4200,
  LIVE_H: 2400,
} as const;

export type ArchiveTileKind = "image" | "routes" | "live" | "chat-icons" | "row-label";

export type ArchiveLayoutTile = {
  id: string;
  kind: ArchiveTileKind;
  x: number;
  y: number;
  w: number;
  h: number;
  item?: DialogueArchiveManifest["items"][0];
  icon?: DialogueArchiveManifest["chatIconHistory"][0];
  label?: string;
};

export type ArchiveLayout = {
  tiles: ArchiveLayoutTile[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  worldW: number;
  worldH: number;
};

function addBounds(
  b: { minX: number; minY: number; maxX: number; maxY: number },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  b.minX = Math.min(b.minX, x);
  b.minY = Math.min(b.minY, y);
  b.maxX = Math.max(b.maxX, x + w);
  b.maxY = Math.max(b.maxY, y + h);
}

export function computeDialogueArchiveLayout(manifest: DialogueArchiveManifest): ArchiveLayout {
  const {
    CONTENT_PAD,
    TILE_GAP,
    ROW_GAP,
    ROW_LABEL_H,
    LABEL_GAP,
    CAPTION_H,
    PLACEMENT_MAX_PER_ROW,
    LIVE_W,
    LIVE_H,
  } = ARCHIVE_LAYOUT;

  const tiles: ArchiveLayoutTile[] = [];
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let y: number = CONTENT_PAD;
  let maxRight: number = CONTENT_PAD;

  const bumpRight = (x: number, w: number) => {
    maxRight = Math.max(maxRight, x + w);
  };

  const routesH = 80 + manifest.exportRoutes.length * 18;
  tiles.push({
    id: "routes",
    kind: "routes",
    x: CONTENT_PAD,
    y,
    w: 900,
    h: routesH,
    label: "Dev export routes",
  });
  addBounds(bounds, CONTENT_PAD, y, 900, routesH);
  bumpRight(CONTENT_PAD, 900);
  y += routesH + ROW_GAP;

  const groupOrder = manifest.groups.filter((g) => g.count > 0);

  const chunkRow = (items: DialogueArchiveManifest["items"], maxPerRow: number) => {
    const rows: DialogueArchiveManifest["items"][] = [];
    for (let i = 0; i < items.length; i += maxPerRow) {
      rows.push(items.slice(i, i + maxPerRow));
    }
    return rows;
  };

  for (const group of groupOrder) {
    const groupItems = manifest.items.filter((i) => i.group === group.id);
    if (groupItems.length === 0) continue;

    const labelText = `${group.label} (${group.count})`;
    const labelW = Math.max(400, maxRight - CONTENT_PAD);
    tiles.push({
      id: `label-${group.id}`,
      kind: "row-label",
      x: CONTENT_PAD,
      y,
      w: labelW,
      h: ROW_LABEL_H,
      label: labelText,
    });
    addBounds(bounds, CONTENT_PAD, y, labelW, ROW_LABEL_H);
    y += ROW_LABEL_H + LABEL_GAP;

    const maxPerRow = group.id === "placement" ? PLACEMENT_MAX_PER_ROW : groupItems.length;
    const rows = chunkRow(groupItems, maxPerRow);

    for (let ri = 0; ri < rows.length; ri++) {
      let x = CONTENT_PAD;
      let rowH = 0;
      for (const item of rows[ri]) {
        const w = item.width || 400;
        const h = item.height || 300;
        const tileH = CAPTION_H + h;
        tiles.push({
          id: item.id,
          kind: "image",
          x,
          y,
          w,
          h: tileH,
          item,
        });
        addBounds(bounds, x, y, w, tileH);
        rowH = Math.max(rowH, tileH);
        bumpRight(x, w);
        x += w + TILE_GAP;
      }
      y += rowH;
      if (ri < rows.length - 1) y += ROW_GAP;
    }
    y += ROW_GAP;
  }

  const iconHistory = manifest.chatIconHistory ?? [];
  if (iconHistory.length > 0) {
    const labelW = Math.max(400, maxRight - CONTENT_PAD);
    tiles.push({
      id: "label-chat-icons",
      kind: "row-label",
      x: CONTENT_PAD,
      y,
      w: labelW,
      h: ROW_LABEL_H,
      label: `Chat icon history (${iconHistory.length})`,
    });
    addBounds(bounds, CONTENT_PAD, y, labelW, ROW_LABEL_H);
    y += ROW_LABEL_H + LABEL_GAP;

    let x = CONTENT_PAD;
    let rowH = 0;
    for (const icon of iconHistory) {
      const w = Math.max(icon.width || 320, 120);
      const h = (icon.height || 120) + CAPTION_H;
      tiles.push({
        id: `icon-${icon.sha}`,
        kind: "chat-icons",
        x,
        y,
        w,
        h,
        icon,
      });
      addBounds(bounds, x, y, w, h);
      rowH = Math.max(rowH, h);
      bumpRight(x, w);
      x += w + TILE_GAP;
    }
    y += rowH + ROW_GAP;
  }

  const liveW = Math.max(LIVE_W, maxRight - CONTENT_PAD + CONTENT_PAD);
  const liveLabelH = ROW_LABEL_H + 16;
  tiles.push({
    id: "label-live",
    kind: "row-label",
    x: CONTENT_PAD,
    y,
    w: liveW,
    h: ROW_LABEL_H,
    label: `Live components (${manifest.liveComponentCount})`,
  });
  addBounds(bounds, CONTENT_PAD, y, liveW, ROW_LABEL_H);
  y += liveLabelH;

  tiles.push({
    id: "live",
    kind: "live",
    x: CONTENT_PAD,
    y,
    w: liveW,
    h: LIVE_H,
    label: `Live components (${manifest.liveComponentCount})`,
  });
  addBounds(bounds, CONTENT_PAD, y, liveW, LIVE_H);
  y += LIVE_H + CONTENT_PAD;

  const worldW = Math.max(bounds.maxX + CONTENT_PAD, maxRight + CONTENT_PAD);
  const worldH = y;

  if (!Number.isFinite(bounds.minX)) {
    bounds.minX = CONTENT_PAD;
    bounds.minY = CONTENT_PAD;
    bounds.maxX = worldW;
    bounds.maxY = worldH;
  }

  return { tiles, bounds, worldW, worldH };
}

export type FitCameraInput = {
  viewportW: number;
  viewportH: number;
  bounds: ArchiveLayout["bounds"];
  pad: number;
};

export function computeFitCamera({ viewportW, viewportH, bounds, pad }: FitCameraInput): {
  x: number;
  y: number;
  z: number;
} {
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
