/**
 * The resting nav letters are large path data. NavFrame (a server component)
 * leaves their markup here for the server render of RestingOutlineWord, so
 * the paths are written into the HTML once instead of also riding in the RSC
 * payload of every document and prefetch. The browser never reads it.
 */
import { getSsrSlot } from "@/lib/ssrSlot";

export const NAV_WORDS_SSR_KEY = "__muditNavWordsSvg";

export type NavWordsSsr = Record<string, string>;

export function readNavWordsSsr(label: string): string {
  return getSsrSlot<NavWordsSsr>(NAV_WORDS_SSR_KEY)?.[label] ?? "";
}
