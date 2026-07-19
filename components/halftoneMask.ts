// Pure, React-free sampling logic for the per-dot halftone effect
// (HalftoneDotField.tsx). This module answers exactly one question, once per
// bake (not per animation frame): "given this text label or icon, where
// should dots sit and how big can each one grow?" It never renders anything
// itself — a shared offscreen canvas here is used purely as a scratchpad to
// rasterize the real glyph/icon shape and sample its alpha as a coverage
// field, then discarded.

export interface HalftoneDot {
  x: number;
  y: number;
  maxRadius: number;
  /** 0..1 — this dot's position in the shared stagger timeline, see dotLocalProgress. */
  phase: number;
}

export interface HalftoneMaskOptions {
  /** CSS-px spacing between candidate dot-grid cells. */
  pitch: number;
  /** Dot radius (CSS px) at coverage=1 and full activation. */
  maxRadius: number;
  /** Exponent applied to sampled coverage before the sqrt(coverage) radius curve. */
  coverageGamma: number;
  /** Cells with average alpha coverage below this are dropped entirely. */
  coverageThreshold: number;
  /** Phase offset (CSS px) of the sampling grid's origin. */
  offsetX: number;
  offsetY: number;
  /** 0 = phase purely by radial distance from centroid, 1 = purely a stable per-cell hash. */
  staggerJitter: number;
  /** true = dots bloom outward from the content's centroid, false = inward. */
  staggerOutward: boolean;
}

// Supersampling factor for the offscreen rasterization — gives each grid
// cell's coverage window dozens of sub-pixels to average instead of a single
// jaggy in/out sample. Fixed, not dial-tunable: this is sampling quality, not
// an artistic knob.
const SUPERSAMPLE = 8;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// One reused, never-appended-to-DOM canvas backs every bake. `willReadFrequently`
// hints the browser to keep this on a CPU-backed surface, since every bake
// does an immediate getImageData readback right after drawing.
let scratchCanvas: HTMLCanvasElement | null = null;
let scratchCtx: CanvasRenderingContext2D | null = null;
function getScratch(w: number, h: number): CanvasRenderingContext2D {
  if (!scratchCanvas) {
    scratchCanvas = document.createElement("canvas");
    scratchCtx = scratchCanvas.getContext("2d", { willReadFrequently: true });
  }
  // Resizing implicitly clears the canvas and resets its drawing state
  // (font, fillStyle, ...) — every caller re-sets what it needs immediately
  // after calling this, so that's never relied upon to persist.
  scratchCanvas.width = w;
  scratchCanvas.height = h;
  return scratchCtx!;
}

// Resolved once and reused — every hover before this resolves would otherwise
// bake dot positions off fallback-font glyph metrics, silently wrong forever
// after (nothing re-triggers a rebake once a result is cached).
let fontsReadyPromise: Promise<unknown> | null = null;
function fontsReady(): Promise<unknown> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!fontsReadyPromise) fontsReadyPromise = document.fonts.ready;
  return fontsReadyPromise;
}

/**
 * Walks a regular CSS-px grid over a rasterized alpha field, keeps cells
 * whose averaged local coverage clears the threshold, and assigns each
 * surviving dot a stable stagger phase blending radial position (from the
 * content's own centroid) with a deterministic per-cell hash — no
 * Math.random, so an identical mask always bakes identical phases.
 */
function sampleGrid(data: Uint8ClampedArray, w: number, h: number, opts: HalftoneMaskOptions): HalftoneDot[] {
  const cssW = w / SUPERSAMPLE;
  const cssH = h / SUPERSAMPLE;
  const halfWindow = Math.max(1, Math.round((opts.pitch * SUPERSAMPLE) / 2));

  const raw: { x: number; y: number; maxRadius: number; gx: number; gy: number }[] = [];

  let gx = 0;
  for (let xCss = opts.offsetX; xCss < cssW; xCss += opts.pitch, gx++) {
    let gy = 0;
    for (let yCss = opts.offsetY; yCss < cssH; yCss += opts.pitch, gy++) {
      const px = Math.round(xCss * SUPERSAMPLE);
      const py = Math.round(yCss * SUPERSAMPLE);
      let sum = 0;
      let count = 0;
      for (let dy = -halfWindow; dy <= halfWindow; dy++) {
        const sy = py + dy;
        if (sy < 0 || sy >= h) continue;
        const rowBase = sy * w;
        for (let dx = -halfWindow; dx <= halfWindow; dx++) {
          const sx = px + dx;
          if (sx < 0 || sx >= w) continue;
          sum += data[(rowBase + sx) * 4 + 3];
          count++;
        }
      }
      if (count === 0) continue;
      const coverage = sum / count / 255;
      if (coverage < opts.coverageThreshold) continue;
      const maxRadius = opts.maxRadius * Math.sqrt(Math.pow(coverage, opts.coverageGamma));
      raw.push({ x: xCss, y: yCss, maxRadius, gx, gy });
    }
  }

  if (raw.length === 0) return [];

  let sumX = 0, sumY = 0;
  for (const d of raw) { sumX += d.x; sumY += d.y; }
  const centroidX = sumX / raw.length;
  const centroidY = sumY / raw.length;
  let maxDist = 0;
  for (const d of raw) maxDist = Math.max(maxDist, Math.hypot(d.x - centroidX, d.y - centroidY));

  return raw.map((d) => {
    const dist = Math.hypot(d.x - centroidX, d.y - centroidY) / (maxDist || 1);
    const radial = opts.staggerOutward ? dist : 1 - dist;
    const hash = (((d.gx * 374761393) ^ (d.gy * 668265263)) >>> 0) / 4294967295;
    const phase = clamp01(radial * (1 - opts.staggerJitter) + hash * opts.staggerJitter);
    return { x: d.x, y: d.y, maxRadius: d.maxRadius, phase };
  });
}

function optsKey(opts: HalftoneMaskOptions): string {
  return [
    opts.pitch, opts.maxRadius, opts.coverageGamma, opts.coverageThreshold,
    opts.offsetX, opts.offsetY, opts.staggerJitter, opts.staggerOutward,
  ].join("|");
}

/** A bake's dots plus the CSS-px box they're positioned within — HalftoneDotField
 *  sizes/centers its overlay SVG to this box so dot coordinates line up 1:1.
 *  `baselineY` (text bakes only, CSS px from the box's top) is where
 *  HalftoneDotField positions its live glyph-clone <text> element so it
 *  lands exactly where the real DOM text's baseline sits. */
export interface HalftoneMaskResult {
  dots: HalftoneDot[];
  width: number;
  height: number;
  baselineY?: number;
}

const bakeCache = new Map<string, HalftoneMaskResult>();

/** Rasterizes a text label with the site's real nav font and bakes a dot mask from its glyph alpha. */
export async function buildTextMask(
  text: string,
  fontWeight: number,
  fontSizePx: number,
  lineHeightPx: number,
  opts: HalftoneMaskOptions
): Promise<HalftoneMaskResult> {
  if (typeof document === "undefined") return { dots: [], width: 0, height: 0 };

  const key = `text:${text}:${fontWeight}:${fontSizePx}:${lineHeightPx}:${optsKey(opts)}`;
  const cached = bakeCache.get(key);
  if (cached) return cached;

  await fontsReady();

  // The nav's real font stack, read live rather than re-declared here — a
  // second hardcoded copy of this stack is exactly the kind of drift that
  // produced the overlay-opacity bug this redesign also fixes.
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif";
  const fontStr = `${fontWeight} ${fontSizePx * SUPERSAMPLE}px ${family}`;

  // Throwaway tiny context purely to call measureText before we know the
  // real canvas size it needs to be.
  const probe = getScratch(4, 4);
  probe.font = fontStr;
  const metrics = probe.measureText(text);

  // FONT-level metrics (not this string's tight ink bounds) for the canvas
  // height and baseline position — this is what CSS line-height centering
  // itself uses (half the leading above the font's own ascent, half below
  // its descent), so the baked baseline lands at the exact spot within the
  // box the real DOM text's baseline does. Using actualBoundingBox* (tight,
  // per-glyph) here instead made the mask drift vertically depending on
  // whether a label had descenders ("play") or not ("about"), since a tight
  // box's own height and top offset vary per string.
  const fontAscent = metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent || fontSizePx * SUPERSAMPLE * 0.8;
  const fontDescent = metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent || fontSizePx * SUPERSAMPLE * 0.25;
  const lineHeight = lineHeightPx * SUPERSAMPLE;
  const halfLeading = Math.max(0, (lineHeight - (fontAscent + fontDescent)) / 2);
  const baselineY = halfLeading + fontAscent;

  const width = Math.ceil(metrics.width) + 4;
  const height = Math.ceil(lineHeight);

  const ctx = getScratch(width, height);
  ctx.font = fontStr;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 2, baselineY);

  const { data } = ctx.getImageData(0, 0, width, height);
  const dots = sampleGrid(data, width, height, opts);
  const result: HalftoneMaskResult = {
    dots,
    width: width / SUPERSAMPLE,
    height: height / SUPERSAMPLE,
    baselineY: baselineY / SUPERSAMPLE,
  };
  bakeCache.set(key, result);
  return result;
}

/** Rasterizes a mask-only icon SVG (see halftoneIconMasks.ts) and bakes a dot mask from its alpha. */
export async function buildIconMask(
  svgMarkup: string,
  sizeCss: number,
  opts: HalftoneMaskOptions
): Promise<HalftoneMaskResult> {
  if (typeof document === "undefined") return { dots: [], width: 0, height: 0 };

  const key = `icon:${svgMarkup}:${sizeCss}:${optsKey(opts)}`;
  const cached = bakeCache.get(key);
  if (cached) return cached;

  const size = Math.round(sizeCss * SUPERSAMPLE);
  const img = new Image();
  img.src = `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`;
  await img.decode();

  const ctx = getScratch(size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const dots = sampleGrid(data, size, size, opts);
  const result: HalftoneMaskResult = { dots, width: sizeCss, height: sizeCss };
  bakeCache.set(key, result);
  return result;
}

/**
 * Turns the single shared spring value `globalT` into an independent local
 * progress for one dot: a windowed remap giving each dot its own time-shifted
 * slice of the exact same spring curve (including its overshoot), so a dot
 * with a later phase both fills in later and — since it's the same formula
 * evaluated on the same falling `t` — recedes later too. Stateless: no
 * per-dot physics simulation, just algebra on the one shared value.
 */
export function dotLocalProgress(globalT: number, phase: number, spread: number): number {
  const windowLen = 1 - spread; // spread is dial-clamped to [0, 0.9], so this never hits 0
  const windowStart = phase * spread;
  return (globalT - windowStart) / windowLen;
}

/**
 * A "hump" that's exactly 0 at globalT=0 and globalT=1 and rises to 1 at
 * `peakPosition` — drives the goo filter's blur/threshold/radius-boost in
 * HalftoneDotField so the transition is crisp at both rest and fully-active
 * endpoints but fuses into a connected blob mid-transition. Two linear ramps
 * (up to the peak, back down from it) each passed through smoothstep so the
 * peak isn't a sharp linear kink. Symmetric in both directions and immune to
 * the underdamped out-spring's negative overshoot via Math.abs.
 */
export function gooHump(globalT: number, peakPosition: number): number {
  const at = Math.min(1, Math.max(0, Math.abs(globalT)));
  const p = Math.min(0.95, Math.max(0.05, peakPosition));
  const local = at <= p ? at / p : (1 - at) / (1 - p);
  const clamped = Math.min(1, Math.max(0, local));
  return clamped * clamped * (3 - 2 * clamped); // smoothstep
}
