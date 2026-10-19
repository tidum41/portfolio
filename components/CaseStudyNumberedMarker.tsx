import type { ReactNode } from "react";

/** Number + label row (anatomy legend, decision reasons). */
export default function CaseStudyNumberedMarker({
  n,
  children,
  className = "",
}: {
  n: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`cs-numbered-marker ${className}`.trim()}>
      <span className="cs-numbered-marker__n">{n}</span>
      <span className="cs-numbered-marker__text">{children}</span>
    </p>
  );
}
