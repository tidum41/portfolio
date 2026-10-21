import type { ReactNode } from "react";

export type DialogueFrameTone = "problem" | "solution" | "neutral" | "chart";

type Props = {
  label?: string;
  tone?: DialogueFrameTone;
  children: ReactNode;
  className?: string;
};

export default function DialogueRachelFrame({
  label,
  tone = "neutral",
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
