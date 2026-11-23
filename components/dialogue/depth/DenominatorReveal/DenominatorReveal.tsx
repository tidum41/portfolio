"use client";

/* Dev only, awaiting Mudit's OK (exploration 2, design/dialogue-explorations/ex2-denominator-reveal.md).
   Percents for two groups of different size, then each group counted out of its own size.
   Numbers come from the caller; the only data on the page is the Hearthside 9 of 14 / 88 of 125 pair. */

import { useEffect, useRef, useState } from "react";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import "./denominator-reveal.css";

/** a relabel: geometry fixed, the label cuts. b rescale: label cuts, then each track resizes to its group (staged).
 *  c units: the percent bar is replaced by one dot per person. */
export type DenominatorRevealOption = "relabel" | "rescale" | "units";
export type DenominatorRevealPhase = "rate" | "people";
export type DenominatorTone = "focal" | "mid";
export type DenominatorGroup = { label: string; count: number; of: number; tone: DenominatorTone };

type Props = {
  option: DenominatorRevealOption;
  title: string;
  groups: readonly [DenominatorGroup, DenominatorGroup];
  /** Controlled phase. Omit it and the figure runs itself once it is in view. */
  phase?: DenominatorRevealPhase;
  /** How long the percents hold before the reveal, in ms. */
  holdMs?: number;
};

const pct = (g: DenominatorGroup) => `${Math.round((g.count / g.of) * 100)}%`;
const ofText = (g: DenominatorGroup) => `${g.count} of ${g.of}`;

function usePhase(controlled: DenominatorRevealPhase | undefined, holdMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [auto, setAuto] = useState<DenominatorRevealPhase>("rate");
  useEffect(() => {
    if (controlled) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setAuto("people"), 0);
      return () => clearTimeout(t);
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.6)) {
          timer = setTimeout(() => setAuto("people"), holdMs);
          io.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [controlled, holdMs]);
  return { ref, phase: controlled ?? auto };
}

export default function DenominatorReveal({ option, title, groups, phase: controlled, holdMs = 900 }: Props) {
  const { ref, phase } = usePhase(controlled, holdMs);
  const maxOf = Math.max(...groups.map((g) => g.of));
  return (
    <div ref={ref} className="dialogue-product-root dlg-dx-denom" data-option={option} data-phase={phase}>
      <ChartVizCard title={title}>
        <div className="dp-chart-root dp-chart-bars dlg-dx-denom__rows">
          {groups.map((g) => {
            const track = option === "rescale" && phase === "people" ? (g.of / maxOf) * 100 : 100;
            return (
              <div key={g.label} className="dp-chart-bars__row dlg-dx-denom__row" tabIndex={0} aria-label={`${g.label}: ${ofText(g)}, ${pct(g)}`}>
                <span className="dp-chart-bars__label">{g.label}</span>
                <div className="dlg-dx-denom__lane">
                  <div className="dlg-dx-denom__layer dlg-dx-denom__layer--bar">
                    <div className="dp-chart-bars__track dlg-dx-denom__track" style={{ ["--dlg-dx-track" as string]: `${track}%` }}>
                      <div className="dp-chart-bars__bar dlg-dx-denom__bar" data-tone={g.tone} style={{ ["--dlg-dx-fill" as string]: `${(g.count / g.of) * 100}%` }} />
                    </div>
                  </div>
                  {option === "units" ? (
                    <div className="dlg-dx-denom__layer dlg-dx-denom__layer--units" aria-hidden>
                      {Array.from({ length: g.of }, (_, i) => (
                        <span key={i} className="dlg-dx-denom__unit" data-tone={i < g.count ? g.tone : "empty"} />
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* One grid cell: the percent and the count share it, so nothing reflows when either shows. */}
                <span className={["dp-chart-bars__value", "dlg-dx-denom__value", g.tone === "focal" ? "dp-chart-bars__value--focal" : ""].filter(Boolean).join(" ")}>
                  <span className="dlg-dx-denom__v dlg-dx-denom__v--rate">{pct(g)}</span>
                  <span className="dlg-dx-denom__v dlg-dx-denom__v--people">{ofText(g)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </ChartVizCard>
    </div>
  );
}
