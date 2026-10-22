"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { stampAnnotateParts } from "@/components/dialogue/useAnnotateParts";

const FOCUSABLE = "a[href], button, input, textarea, select, [tabindex]";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  figure: string;
  children: ReactNode;
};

/**
 * Wrapper for a figure that is a picture of product UI, not a control.
 * Its parts stay real, hit-testable elements (so annotation tools can select
 * them). Keyboard focus is removed here instead of with `inert`, which would
 * also remove the parts from pointer hit-testing.
 */
export default function StaticFigure({ figure, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") stampAnnotateParts(root, `dialogue-${figure}`);
  });

  return (
    <div ref={ref} aria-hidden data-annotate={`dialogue-${figure}/root`} {...rest}>
      {children}
    </div>
  );
}
