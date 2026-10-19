import type { ReactNode } from "react";
import CopyEmail from "@/components/CopyEmail";
import CaseStudyBody from "@/components/CaseStudyBody";

/**
 * Quiet NDA notice for a case study that is not published in full.
 */
export default function CaseStudyRequest({
  teaser,
  outcome,
  label = "Under NDA",
  message = "Full case study available upon request.",
  action = "Request access",
}: {
  teaser?: ReactNode;
  outcome?: ReactNode;
  label?: string;
  message?: string;
  action?: string;
}) {
  return (
    <div className="cs-request-block">
      {teaser ? <CaseStudyBody as="div">{teaser}</CaseStudyBody> : null}
      {outcome}
      <div className="cs-request-card" data-case-request>
        <p className="cs-request-label">
          <LockIcon />
          {label}
        </p>
        <p className="cs-request-message">{message}</p>
        <CopyEmail className="cs-request-action cs-pill-btn" ariaLabel={`${action} — copy email to clipboard`}>
          {action}
        </CopyEmail>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3.25" y="8" width="11.5" height="7.25" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6 8V5.75a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
