"use client";

import { useCallback, type Ref } from "react";
import { useRouter } from "next/navigation";
import { markInstantBack } from "@/lib/instantNav";

/**
 * The one case-study Back control. It lives in the nav row, at the page
 * margin, on every width. It uses the nav type (`--fs-nav-text` on the
 * `--lh-nav` line) inside the same 44px row, so its cap height and baseline
 * land on the Work / Archive / About row. Rest and hover colours match
 * the nav links. Under 480px the row has no room for the label, so Back is
 * the chevron alone (the aria-label names it).
 */
export default function CaseStudyBack({
  href = "/",
  ref,
  inert,
}: {
  href?: string;
  ref?: Ref<HTMLAnchorElement>;
  /** Takes this copy out of focus order and the accessibility tree (the
      sticky bar's Back is the live one while the nav row is scrolled away). */
  inert?: boolean;
}) {
  const router = useRouter();

  // Instant, in-place back: skip the hard reload and fade, restore the prior
  // scroll. Always `push` with `{ scroll: false }` rather than `router.back()`.
  // The App Router scrolls to top on any navigation it manages, and
  // PersistentWorkShell (persistently mounted, not a per-route tree) restores
  // scroll itself, so Next must leave scroll alone.
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      markInstantBack();
      router.push(href, { scroll: false });
    },
    [router, href],
  );

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      className="nav-link nav-back"
      aria-label="Back to work"
      inert={inert}
    >
      {/* Tight 8x12 canvas so the ink is the box: no built-in icon padding. */}
      <svg
        className="nav-back-arrow"
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="7 1 1.5 6 7 11" />
      </svg>
      <span className="nav-back-label">Back</span>
    </a>
  );
}
