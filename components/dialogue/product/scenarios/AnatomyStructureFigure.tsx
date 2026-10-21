"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { ANATOMY_LABELS } from "@/lib/dialogue/product/sampleData";

const PART_IDS = ["sources", "summary", "chart", "clips", "followups"] as const;

type CalloutLayout = { top: number };
type LeaderLine = { y: number; x1: number; x2: number };

export default function AnatomyStructureFigure() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [callouts, setCallouts] = useState<CalloutLayout[]>([]);
  const [lines, setLines] = useState<LeaderLine[]>([]);
  const [railHeight, setRailHeight] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const card = root.querySelector<HTMLElement>(".dp-study-chat");
      const diagram = root.querySelector<HTMLElement>(".dp-anatomy__diagram");
      const rail = root.querySelector<HTMLElement>(".dp-anatomy__rail");
      if (!card || !diagram || !rail) return;

      if (root.clientWidth <= 480) {
        setCallouts([]);
        setLines([]);
        setRailHeight(0);
        return;
      }

      const cardLeft = card.getBoundingClientRect().left - rootRect.left;
      const railRect = rail.getBoundingClientRect();
      const x1 = railRect.right - rootRect.left;
      const x2 = cardLeft;

      const nextCallouts: CalloutLayout[] = [];
      const nextLines: LeaderLine[] = [];

      PART_IDS.forEach((partId, i) => {
        const target = root.querySelector<HTMLElement>(`[data-anatomy-part="${partId}"]`);
        if (!target) return;
        const t = target.getBoundingClientRect();
        const y = t.top + t.height / 2 - rootRect.top;
        nextCallouts[i] = { top: y };
        nextLines.push({ y, x1, x2 });
      });

      setCallouts(nextCallouts);
      setLines(nextLines);
      setRailHeight(diagram.offsetHeight);
    };

    measure();
    requestAnimationFrame(measure);
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
      <svg className="dp-anatomy__svg" aria-hidden>
        {lines.map((line, i) => (
          <g key={i}>
            <line
              x1={line.x1}
              y1={line.y}
              x2={line.x2}
              y2={line.y}
              className="dp-anatomy__line"
            />
            <circle cx={line.x2} cy={line.y} r="2" className="dp-anatomy__tick" />
          </g>
        ))}
      </svg>
      <div className="dp-anatomy__rail" aria-hidden style={{ minHeight: railHeight || undefined }}>
        {ANATOMY_LABELS.map((label, i) => (
          <div
            key={label}
            className="dp-anatomy__callout"
            style={callouts[i] ? { top: callouts[i].top } : undefined}
          >
            <span className="dp-anatomy__num">{i + 1}</span>
            <span className="dp-anatomy__name">{label}</span>
          </div>
        ))}
      </div>
      <div className="dp-anatomy__diagram">
        <StructuredAnswerFigure anatomy />
      </div>
    </div>
  );
}
