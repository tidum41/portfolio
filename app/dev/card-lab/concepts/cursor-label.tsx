"use client";

import { useEffect, useRef, useState } from "react";
import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const MEDIA_INDEX = 0;
const TITLE = "Clause generator";
const DESC = "Legal drafting assist for ops.";

export type CursorLabelVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  shape: "pill" | "circle";
  lagMs: number;
};

function CursorLabelCard({
  v,
  ctx,
}: {
  v: CursorLabelVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 72, y: 64 });
  const target = useRef({ x: 72, y: 64 });
  const raf = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    if (force) {
      // Higher lag reads as a farther mid-spring seat in stills.
      setPos(v.lagMs >= 200 ? { x: 48, y: 40 } : { x: 120, y: 88 });
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;

    const stiffness = Math.max(0.08, Math.min(0.35, 180 / v.lagMs));

    const tick = () => {
      setPos((p) => {
        const nx = p.x + (target.current.x - p.x) * stiffness;
        const ny = p.y + (target.current.y - p.y) * stiffness;
        if (
          Math.abs(nx - target.current.x) < 0.2 &&
          Math.abs(ny - target.current.y) < 0.2
        ) {
          if (!active.current) return p;
        }
        return { x: nx, y: ny };
      });
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      active.current = true;
    };
    const onEnter = () => {
      active.current = true;
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      active.current = false;
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [force, v.lagMs]);

  return (
    <div
      className="cl-cursor"
      data-cl-card
      data-cl-kind="cursor-label"
      data-cl-direction="11"
      data-cl-variant={v.id}
      data-cl-label-shape={v.shape}
      data-cl-lag-ms={v.lagMs}
      data-cl-force-hover={force ? "1" : "0"}
      ref={wrapRef}
    >
      <div className="cl-cursor__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={8}
          className="cl-cursor__media"
        />
        <span
          className={`cl-cursor__label cl-cursor__label--${v.shape}`}
          data-cl-cursor-label
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
          }}
        >
          {v.shape === "circle" ? "→" : "View case study"}
        </span>
      </div>
      <div className="cl-cursor__copy" data-cl-copy>
        <p className="cl-cursor__title" data-cl-card-title>
          {TITLE}
        </p>
        <p className="cl-cursor__desc" data-cl-card-desc>
          {DESC}
        </p>
      </div>
    </div>
  );
}

export const cursorLabel: ConceptDefinition<CursorLabelVariant> = {
  id: "cursor-label",
  kind: "cursor-label",
  overrideKey: "d11",
  name: "Cursor-following label",
  intent:
    "A small label follows the cursor with spring lag; the system cursor stays visible.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", shape: "pill", lagMs: 120 },
    { id: "b", shape: "pill", lagMs: 280 },
    { id: "c", shape: "circle", lagMs: 120 },
  ],
  label: (v) => `${v.id} · ${v.shape} · lag ${v.lagMs}ms`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d11", v.id, v, params, { lag: "lagMs" }),
  render: (v, ctx) => <CursorLabelCard v={v} ctx={ctx} />,
};
