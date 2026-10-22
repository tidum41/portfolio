"use client";

import { useEffect, type RefObject } from "react";

/**
 * Leaves declare data-annotate-part="pill-priya"; this joins it to the figure
 * name so the DOM carries data-annotate="hero/pill-priya". The figure root
 * itself must already carry data-annotate="hero". Server-rendered leaves cannot
 * read context, so the join happens once after mount.
 */
export function stampAnnotateParts(root: HTMLElement | null, figure: string) {
  if (!root) return;
  root.querySelectorAll<HTMLElement>("[data-annotate-part]").forEach((el) => {
    const id = `${figure}/${el.dataset.annotatePart}`;
    el.setAttribute("data-annotate", id);
    el.setAttribute("data-element", id);
  });
}

export function useAnnotateParts(
  ref: RefObject<HTMLElement | null>,
  figure: string,
  deps: unknown[] = [],
) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") return;
    stampAnnotateParts(ref.current, figure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figure, ...deps]);
}
