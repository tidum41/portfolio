/**
 * The resting nav letters are large path data. NavFrame (a server component)
 * leaves their markup here for the server render of RestingOutlineWord, so
 * the paths are written into the HTML once instead of also riding in the RSC
 * payload of every document and prefetch. The browser never reads it.
 */
export const NAV_WORDS_SSR_KEY = "__muditNavWordsSvg";

export type NavWordsSsr = Record<string, string>;

export function readNavWordsSsr(label: string): string {
  if (typeof window !== "undefined") return "";
  const map = (globalThis as Record<string, unknown>)[NAV_WORDS_SSR_KEY] as NavWordsSsr | undefined;
  return map?.[label] ?? "";
}
