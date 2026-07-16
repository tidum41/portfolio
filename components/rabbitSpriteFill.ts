// Derives a filled-silhouette variant of each hop-cycle frame from the
// existing outline-only pixel data (FRAME_RECTS), for a "solid body with
// the line art cut out as transparent gaps" look — a local experiment, not
// wired into the outline data itself.
//
// The outline rects are the enclosing boundary of the bunny; there's no
// separate "body fill" data to draw from. So each frame is rasterized onto
// an 11px grid (the pixel unit the sheet was authored at), flood-filled
// from the grid's border to find every cell reachable from outside the
// silhouette, and whatever's left over (non-outline cells the flood never
// reached) is the enclosed interior — the fill. The outline cells
// themselves are omitted from the output entirely, so they read as thin
// transparent cutouts within the solid shape.
//
// Some poses' outlines aren't a fully closed contour at this grid
// resolution (a 1-cell gap somewhere), which lets the flood fill leak from
// interior to exterior and leaves most of the body unfilled. To stay
// robust to that, the flood fill runs against the outline dilated by 1
// cell (a "wall" a gap can't slip through) rather than the raw outline —
// but only the *original*, undilated outline cells are excluded from the
// rendered fill, so the visible cutout stays the authentic stroke width.
//
// The dilated wall is dense enough (long ears, close-together strokes) that
// it can partition the background into several disconnected regions — one
// near each corner/edge of the padded grid, not all reachable from each
// other. Seeding the flood from a single corner only finds one of those
// regions; everything else defaults to "interior" and renders as a stray
// filled patch. So the flood seeds from every non-wall cell along all four
// edges of the padding ring, which (since the ring surrounds the whole
// shape) reaches every real background region.

import { FRAME_RECTS, type RabbitFrame } from "./rabbitSpriteData";

const GRID = 11;

type Rect = readonly [x: number, y: number, w: number, h: number];

function computeFilledFrame(rects: readonly Rect[]): Rect[] {
    const cols = rects.map(([x, , w]) => [Math.round(x / GRID), Math.round(w / GRID)] as const);
    const rowsY = rects.map(([, y]) => Math.round(y / GRID));

    const minCol = Math.min(...cols.map(([c]) => c));
    const maxCol = Math.max(...cols.map(([c, span]) => c + span));
    const minRow = Math.min(...rowsY);
    const maxRow = Math.max(...rowsY) + 1; // rects are 1 grid row tall

    // +2 padding (1 cell on each side) guarantees a ring of background cells
    // around the shape, so the border flood-fill always starts outside it.
    const width = maxCol - minCol + 2;
    const height = maxRow - minRow + 2;

    const isLine: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    for (const [x, y, w] of rects) {
        const r = Math.round(y / GRID) - minRow + 1;
        const c0 = Math.round(x / GRID) - minCol + 1;
        const span = Math.round(w / GRID);
        for (let c = c0; c < c0 + span; c++) isLine[r][c] = true;
    }

    // Dilate isLine by 1 cell (8-connected) into `wall` — used only to
    // decide what the border flood-fill can pass through, so a single-cell
    // gap in the outline no longer leaks the fill into the exterior.
    const wall: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (isLine[r][c]) { wall[r][c] = true; continue; }
            for (let dr = -1; dr <= 1 && !wall[r][c]; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
                    if (isLine[nr][nc]) { wall[r][c] = true; break; }
                }
            }
        }
    }

    const outside: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    const stack: [number, number][] = [];
    const seed = (r: number, c: number) => {
        if (wall[r][c] || outside[r][c]) return;
        outside[r][c] = true;
        stack.push([r, c]);
    };
    for (let c = 0; c < width; c++) {
        seed(0, c);
        seed(height - 1, c);
    }
    for (let r = 0; r < height; r++) {
        seed(r, 0);
        seed(r, width - 1);
    }
    while (stack.length) {
        const [r, c] = stack.pop()!;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
            if (outside[nr][nc] || wall[nr][nc]) continue;
            outside[nr][nc] = true;
            stack.push([nr, nc]);
        }
    }

    const filled: Rect[] = [];
    for (let r = 0; r < height; r++) {
        let c = 0;
        while (c < width) {
            if (!isLine[r][c] && !outside[r][c]) {
                const start = c;
                while (c < width && !isLine[r][c] && !outside[r][c]) c++;
                const x = (start - 1 + minCol) * GRID;
                const y = (r - 1 + minRow) * GRID;
                filled.push([x, y, (c - start) * GRID, GRID]);
            } else {
                c++;
            }
        }
    }
    return filled;
}

export const FILLED_FRAME_RECTS: readonly Rect[][] = FRAME_RECTS.map(computeFilledFrame);

export type { RabbitFrame };
