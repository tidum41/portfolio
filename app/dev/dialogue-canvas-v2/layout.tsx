import type { ReactNode } from "react";

export default function DialogueReviewCanvasLayout({ children }: { children: ReactNode }) {
  return <div className="dialogue-canvas-root">{children}</div>;
}
