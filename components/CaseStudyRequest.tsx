/**
 * Quiet NDA notice for a case study that is not published in full.
 * Other projects can pass their own label, message, and mailto.
 */
export default function CaseStudyRequest({
  label = "Under NDA",
  message = "Full case study available upon request.",
  action = "Request access",
  href = "mailto:Mudit14.mahajan@gmail.com?subject=JOOLA%20case%20study%20access",
}: {
  label?: string;
  message?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="cs-request" data-case-request>
      <p className="cs-request-label">
        <LockIcon />
        {label}
      </p>
      <p className="cs-request-message">{message}</p>
      <a className="cs-request-action" href={href}>
        {action}
      </a>
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
