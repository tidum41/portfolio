"use client";

import { useEffect, useRef, useState } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { ArrowDownIcon, CheckIcon, InfoCircleIcon } from "@/components/dialogue/product/icons";
import { THIN_DATA_MIN_PARTICIPANTS } from "@/lib/dialogue/routing/constants";
import type { ThinResolved } from "@/lib/dialogue/routing/sampleDataset";

const THIN_CHIPS = [
  { label: "How did repeat shoppers read it?", n: 125 },
  { label: "What did shoppers say about the date?", n: 300 },
] as const;

type Props = {
  data: ThinResolved;
  onAsk?: (question: string) => void;
};

function PlusGlyph() {
  return (
    <svg className="dlg-thin__chip-plus" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Thin-data state: early-signal flag, follow-up chips, optional nested split.
 */
export default function ThinDataTemplate({ data, onAsk }: Props) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onAdd = async () => {
    try {
      await navigator.clipboard.writeText(data.planPrompt);
    } catch {
      /* clipboard may be denied; still show the done state */
    }
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 4000);
  };

  const split = data.repeatSplit;

  return (
    <div className="dlg-route-answer" data-template="thin_data">
      <p className="dlg-route-finding">{data.finding}</p>
      {data.whyChart ? <p className="dp-chart-footnote">{data.whyChart}</p> : null}
      <div className="dp-low-signal">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">
          Early signal from {data.count} {data.count === 1 ? "person" : "people"}. Under{" "}
          {THIN_DATA_MIN_PARTICIPANTS} for a chart (demo cutoff).
        </p>
      </div>
      <p className="dlg-thin__label">Follow-ups with more data</p>
      <div className="dlg-thin__chips">
        {THIN_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className="dlg-suggest dlg-thin__chip"
            disabled={!onAsk}
            onClick={() => onAsk?.(chip.label)}
          >
            <PlusGlyph />
            <span className="dlg-thin__chip-q">{chip.label}</span>
            <span className="dlg-thin__chip-n" aria-hidden>
              {chip.n}
            </span>
          </button>
        ))}
      </div>
      {split ? (
        <ChartVizCard title={split.finding} className="dlg-route-card">
          <ChartStackedBar
            lanes
            total={split.total}
            segments={split.groups.map((g) => ({
              label: g.label,
              value: g.value,
              display: `${g.value} of ${split.total}`,
              focal: g.focal,
            }))}
          />
        </ChartVizCard>
      ) : null}
      <div className="dp-next-study-wrap">
        <button
          type="button"
          className={["dp-next-study", added ? "dp-next-study--done" : ""].join(" ")}
          onClick={onAdd}
          aria-label="Add to my plan. Copies a follow-up prompt."
        >
          {added ? (
            <CheckIcon className="dp-next-study__icon dp-animate-in" />
          ) : (
            <ArrowDownIcon className="dp-next-study__icon" />
          )}
          {added ? "Added to plan" : "Add to my plan"}
        </button>
        <p className="dp-next-study__hint" role="status">
          {added
            ? "Copied a follow-up prompt for your next study."
            : "Copies a follow-up prompt for your next study."}
        </p>
      </div>
    </div>
  );
}
