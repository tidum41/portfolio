export const DOCK_ANCHOR_GAP_PX = 8;
export const DOCK_VIEWPORT_MARGIN_PX = 8;
export const CURSOR_FOLLOW_OFFSET_X = 10;
export const CURSOR_FOLLOW_OFFSET_Y = 12;

export function snapPx(n: number): number {
  return Math.round(n);
}

type Size = { width: number; height: number };

/**
 * Position dock so caret tip sits on anchor top-centre, gap above the edge.
 * Returns portal top-left and horizontal caret shift from bubble centre.
 */
export function computeAnchoredDockPosition(
  anchor: DOMRect,
  dock: Size,
  viewport: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  },
): { x: number; y: number; caretShiftX: number; flipped: boolean } {
  const margin = DOCK_VIEWPORT_MARGIN_PX;
  const gap = DOCK_ANCHOR_GAP_PX;
  const anchorCenterX = anchor.left + anchor.width / 2;

  let flipped = false;
  let caretY = anchor.top - gap;
  let y = caretY - dock.height;

  if (y < margin) {
    flipped = true;
    const anchorBottom = anchor.bottom + gap;
    y = anchorBottom;
    caretY = anchorBottom + dock.height;
  }

  let x = anchorCenterX - dock.width / 2;
  const maxX = viewport.width - margin - dock.width;
  x = Math.min(Math.max(x, margin), Math.max(margin, maxX));

  const bubbleCenterX = x + dock.width / 2;
  const caretShiftX = anchorCenterX - bubbleCenterX;

  return {
    x: snapPx(x),
    y: snapPx(y),
    caretShiftX: snapPx(caretShiftX),
    flipped,
  };
}

/** Native-style tooltip: bottom-right of pointer with edge flip. */
export function computeCursorFollowDockPosition(
  clientX: number,
  clientY: number,
  dock: Size,
  viewport: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  },
): { x: number; y: number } {
  const margin = DOCK_VIEWPORT_MARGIN_PX;
  const offX = CURSOR_FOLLOW_OFFSET_X;
  const offY = CURSOR_FOLLOW_OFFSET_Y;

  let x = clientX + offX;
  let y = clientY + offY;

  if (x + dock.width > viewport.width - margin) {
    x = clientX - dock.width - offX;
  }
  if (y + dock.height > viewport.height - margin) {
    y = clientY - dock.height - offY;
  }

  x = Math.min(Math.max(x, margin), Math.max(margin, viewport.width - margin - dock.width));
  y = Math.min(Math.max(y, margin), Math.max(margin, viewport.height - margin - dock.height));

  return { x: snapPx(x), y: snapPx(y) };
}
