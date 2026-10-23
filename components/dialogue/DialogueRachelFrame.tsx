import type { ReactNode } from "react";

/** Figure well tone — maps to near-neutral surface tokens (not lilac/beige/chart grey). */
export type DialogueFrameTone = "problem" | "solution" | "system";

type Props = {
  label?: string;
  tone?: DialogueFrameTone;
  children: ReactNode;
  className?: string;
};

/** One caption: 13px label, and at most one sentence, under the figure. */
export function DialogueCaption({
  label,
  sentence,
}: {
  label: string;
  sentence?: string;
}) {
  return (
    <p className="dialogue-caption">
      <span className="dialogue-caption__label">{label}</span>
      {sentence ? <span className="dialogue-caption__sentence">{sentence}</span> : null}
    </p>
  );
}

function splitFrameLabel(label: string): { label: string; sentence?: string } {
  const idx = label.indexOf(":");
  if (idx === -1) return { label };
  const head = label.slice(0, idx).trim();
  let rest = label.slice(idx + 1).trim();
  if (!rest) return { label: head };
  rest = rest.charAt(0).toUpperCase() + rest.slice(1);
  if (!/[.!?]$/.test(rest)) rest = `${rest}.`;
  return { label: head, sentence: rest };
}

export default function DialogueRachelFrame({
  label,
  tone = "system",
  children,
  className,
}: Props) {
  const caption = label ? splitFrameLabel(label) : null;
  return (
    <div className="dialogue-framed">
      <div
        className={["dialogue-rachel-frame", `dialogue-rachel-frame--${tone}`, className]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="dialogue-rachel-frame__pad">{children}</div>
      </div>
      {caption ? <DialogueCaption label={caption.label} sentence={caption.sentence} /> : null}
    </div>
  );
}
