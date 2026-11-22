import type { ReactNode } from "react";

const PLACEHOLDER_RE = /\[PLACEHOLDER:\s*([^\]]*)\]/g;

function renderSegment(segment: string, key: number): ReactNode {
  if (!segment) return null;
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((match = PLACEHOLDER_RE.exec(segment)) !== null) {
    if (match.index > last) {
      parts.push(segment.slice(last, match.index));
    }
    parts.push(
      <span key={`ph-${key}-${match.index}`} className="joola-sanity-placeholder">
        [PLACEHOLDER: {match[1].trim()}]
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < segment.length) parts.push(segment.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/** Renders CMS copy; `[PLACEHOLDER: …]` stays visible with subtle styling. */
export default function JoolaSanityText({ text }: { text?: string }) {
  if (!text) return null;
  return <>{renderSegment(text, 0)}</>;
}
