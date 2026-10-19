import type { ReactNode } from "react";

export default function CaseStudyPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="cs-to-fill">
      <p className="cs-to-fill-label">To fill</p>
      <div className="cs-to-fill-body">{children}</div>
    </div>
  );
}
