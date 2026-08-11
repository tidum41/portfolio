import { preload } from "react-dom";
import { markSoftNav } from "@/lib/instantNav";

/**
 * Known case-study LCP assets — warmed on work-grid hover / pointerdown so
 * the destination hero poster is often already in cache before the route
 * commits. Keep in sync with page fallbacks (heroMuxId / local hero image).
 */
export const CASE_STUDY_LCP: Record<string, string> = {
  "/ucla-sublease":
    "https://image.mux.com/gEJdc76IbGz8NzGfdRM7v00biDmwgACII24guyZ01tbVU/thumbnail.webp",
  "/sviz": "/images/sviz/hero-channel-screenshot.png",
};

const PRIMARY_NAV = new Set(["/", "/about", "/archive"]);

function pathOf(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  return href.split("?")[0]?.split("#")[0] ?? null;
}

/** Internal case-study routes (not primary chrome, not external). */
export function isCaseStudyHref(href: string): boolean {
  const path = pathOf(href);
  if (!path || PRIMARY_NAV.has(path)) return false;
  return path in CASE_STUDY_LCP || path.split("/").filter(Boolean).length === 1;
}

export function caseStudyLcpUrl(href: string): string | undefined {
  const path = pathOf(href);
  return path ? CASE_STUDY_LCP[path] : undefined;
}

type PrefetchableRouter = { prefetch: (href: string) => void };

/**
 * Passive resource warmup only. Hover/focus must never decide the next route's
 * visual policy: users routinely inspect several cards before committing.
 */
export function warmCaseStudyNav(
  href: string,
  router?: PrefetchableRouter | null,
) {
  if (!isCaseStudyHref(href)) return;

  router?.prefetch(href);

  const lcp = caseStudyLcpUrl(href);
  if (lcp) {
    preload(lcp, { as: "image" });
  }
}

/** Soft-nav + prefetch for a committed Work → case-study click. */
export function commitCaseStudyNav(
  href: string,
  router?: PrefetchableRouter | null,
) {
  if (!isCaseStudyHref(href)) return;
  markSoftNav();
  warmCaseStudyNav(href, router);
}
