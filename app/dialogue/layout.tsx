import type { ReactNode } from "react";

export default function DialogueLayout({ children }: { children: ReactNode }) {
  return <div className="dialogue-case-study-root">{children}</div>;
}
