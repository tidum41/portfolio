import Link from "next/link";
import { caseStudyNeighbors } from "@/lib/caseStudyRegistry";
import { getProjects } from "@/lib/sanity/queries";
import { pagerKicker } from "@/lib/projectCardType";

function pathOf(href: string | undefined): string | null {
  if (!href?.startsWith("/") || href.startsWith("//")) return null;
  return href.split("?")[0]?.split("#")[0] ?? null;
}

export default async function CaseStudyPager({ href }: { href: string }) {
  const { prev, next } = caseStudyNeighbors(href);
  if (!prev && !next) return null;

  // Same label source as homepage project cards.
  const projects = await getProjects();
  const labelByPath = new Map<string, string | undefined>();
  for (const p of projects) {
    const path = pathOf(p.href);
    if (path) labelByPath.set(path, p.label);
  }

  const prevKicker = prev
    ? pagerKicker("Previous", labelByPath.get(prev.href)).kicker
    : null;
  const nextKicker = next
    ? pagerKicker("Next", labelByPath.get(next.href)).kicker
    : null;

  return (
    <nav className="cs-pager" aria-label="Case study navigation">
      {prev ? (
        <Link href={prev.href} className="cs-pager-link">
          <span className="cs-pager-kicker">{prevKicker}</span>
          <span className="cs-pager-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
      {next ? (
        <Link href={next.href} className="cs-pager-link cs-pager-link--next">
          <span className="cs-pager-kicker">{nextKicker}</span>
          <span className="cs-pager-title">{next.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
    </nav>
  );
}
