/**
 * Single source of truth for card-lab variant numbers.
 * Spec lines are generated from these objects — they cannot drift.
 *
 * Optional query overrides (no UI): ?d1b.p=5  ?d2c.gutter=10  ?d3a.ms=180
 */

export type ThemeName = "light" | "dark";

export const CANVAS = {
  light: { bg: "#F4F4F4", surface: "#FFFFFF" },
  dark: { bg: "#141414", surface: "#1E1E1E" },
} as const;

export const TEXT = {
  light: { primary: "#111111", secondary: "#5C5C5C", tertiary: "#6B6B6B" },
  dark: { primary: "#F2F2F2", secondary: "#A3A3A3", tertiary: "#969696" },
} as const;

export const MEDIA_FILLS = {
  light: ["#E6E6E6", "#E3E6EA", "#E9E4DE"] as const,
  dark: ["#2A2A2A", "#272B30", "#2E2A26"] as const,
};

export const TITLE = "Project name";
export const DESCRIPTION = "One line about the work.";

export type Direction1Variant = {
  id: "a" | "b" | "c";
  radius: number;
  padding: number;
  gap: number;
  titleSize: number;
  descSize: number;
};

export type Direction2Variant = {
  id: "a" | "b" | "c";
  radius: number;
  gutter: number;
  captionGap: number;
  titleSize: number;
  descSize: number;
};

export type Direction3Variant = {
  id: "a" | "b" | "c";
  hoverMs: number;
  titleSize: number;
  descSize: number;
  rowMinHeight: number;
};

export const direction1 = {
  key: "d1" as const,
  name: "Framed inset card",
  intent: "Media inset in a surface frame; radius stays concentric with padding.",
  aspect: "4 / 3" as const,
  mediaIndex: 0,
  variants: [
    { id: "a", radius: 12, padding: 4, gap: 12, titleSize: 15, descSize: 13 },
    { id: "b", radius: 12, padding: 6, gap: 12, titleSize: 15, descSize: 13 },
    { id: "c", radius: 12, padding: 8, gap: 12, titleSize: 15, descSize: 13 },
  ] satisfies Direction1Variant[],
};

export const direction2 = {
  key: "d2" as const,
  name: "Edge-to-edge tile",
  intent: "Media is the card; caption sits below with a visible grid gutter.",
  aspect: "16 / 10" as const,
  mediaIndex: 1,
  variants: [
    {
      id: "a",
      radius: 8,
      gutter: 8,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
    {
      id: "b",
      radius: 12,
      gutter: 8,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
    {
      id: "c",
      radius: 12,
      gutter: 12,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
  ] satisfies Direction2Variant[],
};

export const direction3 = {
  key: "d3" as const,
  name: "Text-first row",
  intent: "Type leads; media preview fades in on fine pointer, stays inline on touch.",
  aspect: "1.9 / 1" as const,
  mediaIndex: 2,
  variants: [
    {
      id: "a",
      hoverMs: 150,
      titleSize: 15,
      descSize: 13,
      rowMinHeight: 40,
    },
    {
      id: "b",
      hoverMs: 200,
      titleSize: 15,
      descSize: 13,
      rowMinHeight: 40,
    },
    {
      id: "c",
      hoverMs: 250,
      titleSize: 15,
      descSize: 13,
      rowMinHeight: 40,
    },
  ] satisfies Direction3Variant[],
};

export function innerRadius(v: Direction1Variant): number {
  return v.radius - v.padding;
}

export function labelD1(v: Direction1Variant): string {
  return `${v.id} · r ${v.radius} · p ${v.padding} · inner ${innerRadius(v)} · gap ${v.gap} · title ${v.titleSize}`;
}

export function labelD2(v: Direction2Variant): string {
  return `${v.id} · r ${v.radius} · gutter ${v.gutter} · gap ${v.captionGap} · title ${v.titleSize}`;
}

export function labelD3(v: Direction3Variant): string {
  return `${v.id} · title ${v.titleSize} · ${v.hoverMs}ms · ease-out`;
}

/** Apply ?d1b.p=5 style overrides from a URLSearchParams-like map. */
export function applyOverrides<T extends object>(
  directionKey: "d1" | "d2" | "d3",
  variantId: string,
  base: T,
  params: URLSearchParams
): T {
  const prefix = `${directionKey}${variantId}.`;
  const next: Record<string, unknown> = { ...base };
  const aliases: Record<string, string> = {
    p: "padding",
    r: "radius",
    ms: "hoverMs",
  };
  for (const [key, raw] of params.entries()) {
    if (!key.startsWith(prefix)) continue;
    const field = aliases[key.slice(prefix.length)] ?? key.slice(prefix.length);
    const num = Number(raw);
    if (!Number.isFinite(num)) continue;
    if (field in next) next[field] = num;
  }
  return next as T;
}
