"use client";

import CaseStudyBack from "./CaseStudyBack";

/**
 * Sticky Back for case studies. The nav row is not sticky, so once its Back
 * scrolls out of view this bar fades in over the top edge with the same frame
 * (`.site-nav-frame` > `.site-nav`) as the nav row. Back lands on the same x
 * and y as the nav's, so it reads as the nav and not a floating button.
 *
 * `shown` comes from an IntersectionObserver on the nav's Back (see Nav), not
 * a scroll listener. While hidden the bar is `inert` (and `visibility:hidden`)
 * so only one Back is ever focusable; Nav makes the in-row copy inert while
 * this one is shown.
 */
export default function CaseStudyBackBar({ shown }: { shown: boolean }) {
  return (
    <div className="nav-back-bar" data-shown={shown} inert={!shown}>
      <div className="site-nav-frame">
        <nav className="site-nav flex items-center" aria-label="Case study">
          <CaseStudyBack />
        </nav>
      </div>
    </div>
  );
}
