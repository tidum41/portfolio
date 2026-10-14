export function HilabArrowIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      className="hilab-pill__icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function HilabPlayIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      className="hilab-pill__icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

export function PsFaceMark({
  shape,
  size = 10,
}: {
  shape: "circle" | "cross" | "square" | "triangle";
  size?: number;
}) {
  const common = { width: size, height: size, className: "hilab-ps-mark", "aria-hidden": true as const };
  if (shape === "circle") {
    return (
      <svg {...common} viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    );
  }
  if (shape === "cross") {
    return (
      <svg {...common} viewBox="0 0 12 12" fill="none">
        <path d="M6 2.2v7.6M2.2 6h7.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    );
  }
  if (shape === "triangle") {
    return (
      <svg {...common} viewBox="0 0 12 12" fill="none">
        <path d="M6 2.4L9.8 9.2H2.2L6 2.4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common} viewBox="0 0 12 12" fill="none">
      <rect x="2.4" y="2.4" width="7.2" height="7.2" rx="0.6" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function HilabChipArrow({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
