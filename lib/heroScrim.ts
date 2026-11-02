/**
 * Hero legibility scrim, shared between the hero (which measures its text
 * lines) and PS3Silk (which darkens/lightens the silk behind them in its
 * shader). The scrim never paints over the page itself, so it cannot band or
 * tint anything but the silk.
 */

/** One rendered line of hero text, in document (page) CSS px. */
export type ScrimLine = { l: number; t: number; r: number; b: number };

export type HeroScrim = {
  lines: ScrimLine[];
  /** Headline line height in CSS px; spreads are multiples of it. */
  lineHeight: number;
  /** Peak strength over the text, 0..1. */
  opacity: number;
  /** Gaussian blur radius (sigma) across / along the lines, in line heights. */
  spreadX: number;
  spreadY: number;
};

let current: HeroScrim | null = null;
const subs = new Set<() => void>();

export function getHeroScrim() {
  return current;
}

export function setHeroScrim(next: HeroScrim) {
  current = next;
  subs.forEach((fn) => fn());
}

export function subscribeHeroScrim(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

// Abramowitz-Stegun 7.1.26, |error| < 1.5e-7.
function erf(x: number) {
  const s = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}

/**
 * Rasterises the scrim as a Gaussian blur of the line boxes (exact, since the
 * boxes don't overlap: the blur of a union of disjoint rects is the sum of
 * each rect's separable erf profile). Output is a bottom-up 8-bit mask, one
 * texel per `texel` CSS px, for an area `w`x`h` whose top-left sits at page
 * (`left`, `top`).
 */
export function rasterizeHeroScrim(scrim: HeroScrim, left: number, top: number, w: number, h: number, texel: number) {
  const mw = Math.max(1, Math.ceil(w / texel));
  const mh = Math.max(1, Math.ceil(h / texel));
  const out = new Uint8Array(mw * mh);
  const n = scrim.lines.length;
  if (!n || scrim.opacity <= 0) return { data: out, width: mw, height: mh };
  const sx = Math.max(1, scrim.spreadX * scrim.lineHeight) * Math.SQRT2;
  const sy = Math.max(1, scrim.spreadY * scrim.lineHeight) * Math.SQRT2;
  const xs = new Float32Array(n * mw);
  const ys = new Float32Array(n * mh);
  for (let i = 0; i < n; i++) {
    const { l, t, r, b } = scrim.lines[i];
    for (let c = 0; c < mw; c++) {
      const x = left + (c + 0.5) * texel;
      xs[i * mw + c] = 0.5 * (erf((x - l) / sx) - erf((x - r) / sx));
    }
    for (let row = 0; row < mh; row++) {
      const y = top + h - (row + 0.5) * texel;
      ys[i * mh + row] = 0.5 * (erf((y - t) / sy) - erf((y - b) / sy));
    }
  }
  for (let row = 0; row < mh; row++) {
    for (let c = 0; c < mw; c++) {
      let cov = 0;
      for (let i = 0; i < n; i++) cov += xs[i * mw + c] * ys[i * mh + row];
      out[row * mw + c] = Math.round(Math.min(1, cov) * scrim.opacity * 255);
    }
  }
  return { data: out, width: mw, height: mh };
}
