/** Live case study routes in portfolio order (homepage sequence). */
export const CASE_STUDY_PAGES = [
  { href: "/joola", title: "B2B ordering for JOOLA" },
  { href: "/ucla-sublease", title: "BruinLease" },
  { href: "/sviz", title: "sviz" },
] as const;

export function caseStudyNeighbors(href: string) {
  const i = CASE_STUDY_PAGES.findIndex((p) => p.href === href);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? CASE_STUDY_PAGES[i - 1] : null,
    next: i < CASE_STUDY_PAGES.length - 1 ? CASE_STUDY_PAGES[i + 1] : null,
  };
}
