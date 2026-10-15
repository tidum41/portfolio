"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { CardKind, DockPlacementMode, VariantId } from "./types";
import { kindLabel, kindShort } from "./types";
import { PsFaceMark } from "./icons";

const DECODE_TICK_MS = 28;
const DECODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function useDecodeLabel(text: string, active: boolean) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    if (reduced) {
      setOut(text);
      return;
    }

    let tick = 0;
    const len = text.length;
    setOut(
      Array.from({ length: len }, () => DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]).join(""),
    );

    const id = window.setInterval(() => {
      tick += 1;
      const revealed = Math.min(len, Math.floor(tick / 1.35));
      let next = text.slice(0, revealed);
      for (let i = revealed; i < len; i++) {
        next += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      }
      setOut(next);
      if (revealed >= len) window.clearInterval(id);
    }, DECODE_TICK_MS);

    return () => window.clearInterval(id);
  }, [active, reduced, text]);

  return out;
}

function PsSegmentLabel({ kind }: { kind: CardKind }) {
  if (kind === "case-study") {
    return (
      <div className="hilab-dock__segments hilab-dock__segments--solo" role="presentation">
        <span className="hilab-dock__seg" data-active="true">
          <PsFaceMark shape="square" />
          <span>Case study</span>
        </span>
      </div>
    );
  }
  if (kind === "demo") {
    return (
      <div className="hilab-dock__segments hilab-dock__segments--solo" role="presentation">
        <span className="hilab-dock__seg" data-active="true">
          <PsFaceMark shape="circle" />
          <span>Demo</span>
        </span>
      </div>
    );
  }

  return (
    <div className="hilab-dock__segments" role="presentation">
      <span className="hilab-dock__seg" data-active="true">
        <PsFaceMark shape="square" />
        <span>Case study</span>
      </span>
      <span className="hilab-dock__seg-div" aria-hidden />
      <span className="hilab-dock__seg" data-active="true">
        <PsFaceMark shape="triangle" />
        <span>Demo</span>
      </span>
    </div>
  );
}

export default function DockTooltipLayer({
  variant,
  kind,
  visible,
  showCaret = true,
  placement = "anchored",
  flipped = false,
}: {
  variant: VariantId;
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
  const caret = showCaret ? (
    variant === "dock-tooltip" ? (
      <div className="hilab-dock__caret hilab-dock__caret--solid" />
    ) : variant === "dock-xmb-glow" ? (
      <div className="hilab-dock__caret hilab-dock__caret--xmb" />
    ) : variant === "dock-halftone-caret" ? (
      <div className="hilab-dock__caret hilab-dock__caret--halftone" />
    ) : variant === "dock-decode" ? (
      <div className="hilab-dock__caret hilab-dock__caret--decode" />
    ) : variant === "dock-ps-segment" ? (
      <div className="hilab-dock__caret hilab-dock__caret--ps" />
    ) : null
  ) : null;
  const label = kindLabel(kind);
  const short = kindShort(kind);
  const decoded = useDecodeLabel(label, visible && variant === "dock-decode");

  if (variant === "dock-tooltip") {
    return (
      <div className={`${dockClass} hilab-dock--mac`} data-visible={visible ? "true" : "false"} aria-hidden>
        <div className="hilab-dock__bubble">{label}</div>
        {caret}
      </div>
    );
  }

  if (variant === "dock-xmb-glow") {
    return (
      <div className={`${dockClass} hilab-dock--xmb`} data-visible={visible ? "true" : "false"} aria-hidden>
        <div className="hilab-dock__bubble">
          <div className="hilab-dock__xmb-rule" />
          <span className="hilab-dock__xmb-text">{short}</span>
        </div>
        {caret}
      </div>
    );
  }

  if (variant === "dock-halftone-caret") {
    return (
      <div className={`${dockClass} hilab-dock--halftone`} data-visible={visible ? "true" : "false"} aria-hidden>
        <div className="hilab-dock__bubble hilab-dock__bubble--halftone">{label}</div>
        {caret}
      </div>
    );
  }

  if (variant === "dock-decode") {
    return (
      <div className={`${dockClass} hilab-dock--decode`} data-visible={visible ? "true" : "false"} aria-hidden>
        <div className="hilab-dock__bubble hilab-dock__bubble--decode">
          <span className="hilab-dock__decode-wrap">
            <span className="hilab-dock__decode-ghost">{label}</span>
            <span className="hilab-dock__decode-live">{decoded || "\u00a0"}</span>
          </span>
        </div>
        {caret}
      </div>
    );
  }

  if (variant === "dock-ps-segment") {
    return (
      <div className={`${dockClass} hilab-dock--ps`} data-visible={visible ? "true" : "false"} aria-hidden>
        <div className="hilab-dock__bubble hilab-dock__bubble--ps">
          <PsSegmentLabel kind={kind} />
        </div>
        {caret}
      </div>
    );
  }

  return null;
}
