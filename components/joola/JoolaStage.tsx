import type { ReactNode } from "react";
import "./joola-portal.css";

/**
 * Framed stage so live portal components read as embedded product UI.
 * Caption sits below the rounded chrome in the site caption style.
 */
export default function JoolaStage({
  children,
  caption,
  mobile = false,
  wide = false,
  label,
  className = "",
}: {
  children: ReactNode;
  caption?: string;
  mobile?: boolean;
  /** Expand past the case-study measure for wide tables (rep queue). */
  wide?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <figure
      className={`joola-stage${wide ? " joola-stage--wide" : ""}${mobile ? " joola-stage--mobile" : ""} ${className}`.trim()}
    >
      <div className="joola-stage__chrome">
        <div className="joola-stage__pad">
          <div
            className={`joola-stage__frame joola-portal${mobile ? " joola-stage__frame--mobile" : ""}`}
            role="group"
            aria-label={label}
          >
            {children}
          </div>
        </div>
      </div>
      {caption ? <figcaption className="cs-figcaption joola-stage__caption">{caption}</figcaption> : null}
    </figure>
  );
}
