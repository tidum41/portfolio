"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { ANATOMY_LABELS } from "@/lib/dialogue/product/sampleData";

type Line = { x1: number; y1: number; x2: number; y2: number };

export default function AnatomyStructureFigure() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const labels = [...root.querySelectorAll<HTMLElement>(".dp-anatomy__callout")];
      const targets = [...root.querySelectorAll<HTMLElement>("[data-anatomy-part]")];
      const next: Line[] = [];
      labels.forEach((label, i) => {
        const target = targets[i];
        if (!target) return;
        const l = label.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        next.push({
          x1: l.right - rootRect.left,
          y1: l.top + l.height / 2 - rootRect.top,
          x2: t.left - rootRect.left,
          y2: t.top + t.height / 2 - rootRect.top,
        });
      });
      setLines(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="dp-anatomy dialogue-product-root" ref={rootRef}>
      <div className="dp-anatomy__rail" aria-hidden>
        {ANATOMY_LABELS.map((label, i) => (
          <div key={label} className="dp-anatomy__callout">
            <span className="dp-anatomy__num">{i + 1}</span>
            <span className="dp-anatomy__name">{label}</span>
          </div>
        ))}
      </div>
      <div className="dp-anatomy__diagram">
        <svg className="dp-anatomy__svg" aria-hidden>
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="dp-anatomy__line"
            />
          ))}
        </svg>
        <StructuredAnswerFigure anatomy />
      </div>
    </div>
  );
}
