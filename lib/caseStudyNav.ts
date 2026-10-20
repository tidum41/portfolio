import { preload } from "react-dom";
import { markSoftNav } from "@/lib/instantNav";
import { CASE_STUDY_PAGES } from "@/lib/caseStudyRegistry";

/**
 * Known case-study LCP assets — warmed on work-grid hover / pointerdown so
 * the destination hero poster is often already in cache before the route
 * commits. Keep in sync with page fallbacks (heroMuxId / local hero image).
 */
export const CASE_STUDY_LCP: Record<string, string> = {
  // /joola hero is a 530KB 2400×1600 PNG via next/image `priority` — do not
  // point CASE_STUDY_LCP at the source (same trap as /sviz). Card film poster
  // is Mux; route prefetch alone is enough on hover.
  "/ucla-sublease":
    "https://image.mux.com/gEJdc76IbGz8NzGfdRM7v00biDmwgACII24guyZ01tbVU/thumbnail.webp?time=1&width=1280",
  // /sviz hero is a next/image with `priority`, which already emits the
  // sized preload. Pointing this at the 1.7MB source PNG made hover and
  // the document download the original in addition to the optimized image.
};

/** In-flight case-study soft-nav — coalesce rapid re-clicks of the same href. */
let pendingCaseStudyPath: string | null = null;

export function peekPendingCaseStudy(): string | null {
  return pendingCaseStudyPath;
}

export function clearPendingCaseStudy() {
  pendingCaseStudyPath = null;
}

export function markPendingCaseStudy(href: string) {
  pendingCaseStudyPath = pathOf(href);
}

const PRIMARY_NAV = new Set(["/", "/about", "/archive"]);

function pathOf(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  return href.split("?")[0]?.split("#")[0] ?? null;
}

/** Internal case-study routes (not primary chrome, not external). */
export function isCaseStudyHref(href: string): boolean {
  const path = pathOf(href);
  if (!path || PRIMARY_NAV.has(path)) return false;
  // Live registry + known LCP map + any single-segment internal path.
  if (CASE_STUDY_PAGES.some((p) => p.href === path)) return true;
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
    if (typeof window !== "undefined") {
      const img = new window.Image();
      img.decoding = "async";
      img.src = lcp;
    }
  }
}

/** Idle: prefetch every live case-study route + LCP so first card click is warm. */
export function warmAllCaseStudyNav(router?: PrefetchableRouter | null) {
  for (const { href } of CASE_STUDY_PAGES) {
    warmCaseStudyNav(href, router);
  }
}

/** Soft-nav + prefetch for a committed Work → case-study click. */
export function commitCaseStudyNav(
  href: string,
  router?: PrefetchableRouter | null,
) {
  if (!isCaseStudyHref(href)) return;
  markSoftNav();
  markPendingCaseStudy(href);
  warmCaseStudyNav(href, router);
}
