import Link from "next/link";
import { caseStudyNeighbors } from "@/lib/caseStudyRegistry";

/** Same chevron polyline as CaseStudyTOC / QuarterPicker, sized for the kicker. */
function PagerArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      className={`cs-pager-kicker-icon cs-pager-kicker-icon--${dir}`}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "prev" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export default function CaseStudyPager({ href }: { href: string }) {
  const { prev, next } = caseStudyNeighbors(href);
  if (!prev && !next) return null;

  return (
    <nav className="cs-pager" aria-label="Case study navigation">
      {prev ? (
        <Link href={prev.href} className="cs-pager-link">
          <span className="cs-pager-kicker">
            <PagerArrow dir="prev" />
            Previous
          </span>
          <span className="cs-pager-title">{prev.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
      {next ? (
        <Link href={next.href} className="cs-pager-link cs-pager-link--next">
          <span className="cs-pager-kicker">
            Next
            <PagerArrow dir="next" />
          </span>
          <span className="cs-pager-title">{next.title}</span>
        </Link>
      ) : (
        <span className="cs-pager-slot" aria-hidden="true" />
      )}
    </nav>
  );
}
