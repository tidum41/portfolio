"use client";

import { useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";

export default function PlacementBubbleFigure({ collapsed = false }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div className="dialogue-product-root dp-placement-layer">
      <StudyPageChrome />
      {open ? (
        <div className="dp-floating-chat">
          <StructuredAnswerFigure compact showClips={false} />
          <button
            type="button"
            className="dp-chip"
            style={{ marginTop: 6, width: "100%", cursor: "default" }}
            onClick={() => setOpen(false)}
            aria-label="Minimize chat"
          >
            Minimize
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="dp-bubble-launcher"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          ◐
        </button>
      )}
    </div>
  );
}
