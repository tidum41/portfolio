import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  compact?: boolean;
  hero?: boolean;
};

export default function StudyChatShell({ children, compact, hero }: Props) {
  return (
    <div
      className={["dp-study-chat", hero ? "dp-study-chat--hero" : ""].filter(Boolean).join(" ")}
      data-testid="viz-card"
    >
      <div className="dp-study-chat__head">
        <p className="dp-study-chat__title">Research assistant</p>
        <p className="dp-study-chat__sub">Checkout usability, 24 interviews</p>
      </div>
      <div className="dp-study-chat__body" style={compact ? { padding: "10px 12px 12px" } : undefined}>
        {children}
      </div>
    </div>
  );
}
