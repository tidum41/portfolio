import type { ReactNode } from "react";
import "./joola-portal.css";

/**
 * Framed stage so live portal components read as embedded product UI,
 * not page chrome. Caption stays outside (CaseStudyFigure pattern).
 */
export default function JoolaStage({
  children,
  caption,
  mobile = false,
  label,
  className = "",
}: {
  children: ReactNode;
  caption?: string;
  mobile?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={`joola-stage ${className}`.trim()}>
      <div
        className={`joola-stage__frame joola-portal${mobile ? " joola-stage__frame--mobile" : ""}`}
        role="group"
        aria-label={label}
      >
        {children}
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}
