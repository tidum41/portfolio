"use client";

import type { ReactNode } from "react";

/** Small unobtrusive switcher for figure demo states. */
export default function JoolaDemoState({
  label = "State",
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="joola-demo-state">
      <label>
        <span className="joola-demo-state__label">{label}</span>
        <select
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function JoolaSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="joola-skel" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="joola-skel__row" />
      ))}
    </div>
  );
}

export function JoolaEmpty({ children }: { children: ReactNode }) {
  return <div className="joola-empty">{children}</div>;
}

export function JoolaSyncBanner({ children }: { children: ReactNode }) {
  return (
    <div className="joola-sync" role="status">
      <span className="joola-sync__dot" aria-hidden />
      {children}
    </div>
  );
}
