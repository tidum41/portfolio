import type { ReactNode } from "react";

/** Figure well tone — maps to near-neutral surface tokens (not lilac/beige/chart grey). */
export type DialogueFrameTone = "problem" | "solution" | "system";

type Props = {
  label?: string;
  tone?: DialogueFrameTone;
  children: ReactNode;
  className?: string;
};

export default function DialogueRachelFrame({
  label,
  tone = "system",
  children,
  className,
}: Props) {
  return (
    <div
      className={[
        "dialogue-rachel-frame",
        `dialogue-rachel-frame--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? <span className="dialogue-rachel-frame__label">{label}</span> : null}
      <div className="dialogue-rachel-frame__pad">{children}</div>
    </div>
  );
}
