"use client";

import type { CardKind, DockPlacementMode } from "./types";
import { kindShort } from "./types";

export default function DockTooltipLayer({
  kind,
  visible,
  showCaret = true,
  placement = "anchored",
  flipped = false,
}: {
  kind: CardKind;
  visible: boolean;
  showCaret?: boolean;
  placement?: DockPlacementMode;
  flipped?: boolean;
}) {
  const dockClass = [
    "hilab-dock",
    showCaret ? "" : "hilab-dock--no-caret",
    placement === "cursor-follow" ? "hilab-dock--follow" : "",
    flipped ? "hilab-dock--flipped" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={dockClass} data-visible={visible ? "true" : "false"} aria-hidden>
      <div className="hilab-dock__bubble">{kindShort(kind)}</div>
      {showCaret ? <div className="hilab-dock__caret" aria-hidden /> : null}
    </div>
  );
}
