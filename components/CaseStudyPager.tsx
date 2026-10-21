import Link from "next/link";
import { caseStudyNeighbors } from "@/lib/caseStudyRegistry";

export default function CaseStudyPager({ href }: { href: string }) {
  const { prev, next } = caseStudyNeighbors(href);
  if (!prev && !next) return null;

  return (
    <nav className="cs-pager" aria-label="Case study navigation">
      {prev ? (
        <Link href={prev.href} className="cs-pager-link">
          <span className="cs-pager-kicker">Previous project</span>
          <span className="cs-pager-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
      {next ? (
        <Link href={next.href} className="cs-pager-link cs-pager-link--next">
          <span className="cs-pager-kicker">Next project</span>
          <span className="cs-pager-title">{next.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
    </nav>
  );
}
