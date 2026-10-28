/* Nav-letter droplet outlines (wght 400, 16px on a 24px line, pitch 2.25,
   radius 0.8, min coverage 0.07), decoded from the lossless packed form in
   outlineMorphPacked.ts. Regenerate with scripts/bake-outline-assets.mjs. */
import { OUTLINE_META } from "./outlineMorphMeta";
import { OUTLINE_PACKED } from "./outlineMorphPacked";

export type OutlineDroplet = { readonly start: string; readonly end: string };

export type OutlineWord = {
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly droplets: readonly OutlineDroplet[];
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const NUMS = 194;

function decode(): OutlineWord[] {
  const table = new Int8Array(128);
  for (let i = 0; i < ALPHABET.length; i++) table[ALPHABET.charCodeAt(i)] = i;
  let pos = 0;
  const prev = [0, 0];
  const fmt = (v: number) => (v < 0 ? "-" : "") + (Math.abs(v) / 100).toFixed(2);
  const nextPath = () => {
    const n: number[] = new Array(NUMS);
    for (let k = 0; k < NUMS; k++) {
      let v = 0;
      let shift = 1;
      let c: number;
      do {
        c = table[OUTLINE_PACKED.charCodeAt(pos++)];
        v += (c & 31) * shift;
        shift *= 32;
      } while (c & 32);
      const delta = v % 2 ? -(v + 1) / 2 : v / 2;
      prev[k & 1] += delta;
      n[k] = prev[k & 1];
    }
    let d = "M" + fmt(n[0]) + " " + fmt(n[1]);
    for (let c = 0; c < 32; c++) {
      const o = 2 + c * 6;
      d += "C" + fmt(n[o]) + " " + fmt(n[o + 1]) + " " + fmt(n[o + 2]) + " " +
        fmt(n[o + 3]) + " " + fmt(n[o + 4]) + " " + fmt(n[o + 5]);
    }
    return d + "Z";
  };
  return OUTLINE_META.map(([label, width, height, count]) => {
    const droplets: OutlineDroplet[] = [];
    for (let i = 0; i < count; i++) {
      const start = nextPath();
      const end = nextPath();
      droplets.push({ start, end });
    }
    return { label, width, height, droplets };
  });
}

export const OUTLINE_WORDS: readonly OutlineWord[] = decode();
