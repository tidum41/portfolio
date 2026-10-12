/** Shared canvas / type tokens for every concept. */

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

/** Apply ?{overrideKey}{variantId}.{field}=n overrides. */
export function applyFieldOverrides<T extends object>(
  overrideKey: string,
  variantId: string,
  base: T,
  params: URLSearchParams,
  aliases: Record<string, string> = {}
): T {
  const prefix = `${overrideKey}${variantId}.`;
  const next = { ...(base as Record<string, unknown>) };
  for (const [key, raw] of params.entries()) {
    if (!key.startsWith(prefix)) continue;
    const field = aliases[key.slice(prefix.length)] ?? key.slice(prefix.length);
    if (field === "previewPlacement") {
      if (raw === "beside" || raw === "above") next[field] = raw;
      continue;
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) continue;
    if (field in next) next[field] = num;
  }
  return next as T;
}
