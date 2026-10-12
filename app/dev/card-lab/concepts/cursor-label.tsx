"use client";

import { useEffect, useRef, useState } from "react";
import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const PROJECT = projectById("cd-player");

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
  const labelRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 120, y: 88 });
  const target = useRef({ x: 120, y: 88 });
  const raf = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    const clamp = (x: number, y: number) => {
      const wrap = wrapRef.current;
      const label = labelRef.current;
      if (!wrap || !label) return { x, y };
      const wr = wrap.getBoundingClientRect();
      const lw = label.offsetWidth || (v.shape === "circle" ? 64 : 140);
      const lh = label.offsetHeight || (v.shape === "circle" ? 64 : 32);
      const pad = 8;
      const halfW = lw / 2;
      const halfH = lh / 2;
      return {
        x: Math.min(wr.width - pad - halfW, Math.max(pad + halfW, x)),
        y: Math.min(wr.height - pad - halfH, Math.max(pad + halfH, y)),
      };
    };

    if (force) {
      // Higher lag reads as a farther mid-spring seat — still clamped inside.
      setPos(clamp(v.lagMs >= 200 ? 56 : 160, v.lagMs >= 200 ? 48 : 100));
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;

    const stiffness = Math.max(0.08, Math.min(0.35, 180 / v.lagMs));

    const tick = () => {
      setPos((p) => {
        const nx = p.x + (target.current.x - p.x) * stiffness;
        const ny = p.y + (target.current.y - p.y) * stiffness;
        return clamp(nx, ny);
      });
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      target.current = clamp(e.clientX - r.left, e.clientY - r.top);
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
  }, [force, v.lagMs, v.shape]);

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
      data-cl-project={PROJECT.id}
      ref={wrapRef}
    >
      <div className="cl-cursor__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={8}
          className="cl-cursor__media"
        />
        <span
          ref={labelRef}
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
          {PROJECT.title}
        </p>
        <p className="cl-cursor__desc" data-cl-card-desc>
          {PROJECT.subtitle}
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
  mediaIndex: 0,
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
