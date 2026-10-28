/** SVG marks copied from Dialogue Paper / static export (`section-6.html`, `section-3.html`). */

export function DialogueAsteriskIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 6.5v11M7.24 9.25l9.52 5.5M7.24 14.75l9.52-5.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type IconProps = { className?: string };

const stroke = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function WaveformIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3" />
    </svg>
  );
}

export function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function MessageSquareIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function PersonIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <circle cx="12" cy="9" r="3.6" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...stroke} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Round P10: loading arc for the querying row (shape of Dialogue's spinner; drawn here, not Lucide). */
export function LoaderArcIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M14 8a6 6 0 1 1-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
