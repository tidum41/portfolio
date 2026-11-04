"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, CheckIcon, InfoCircleIcon } from "@/components/dialogue/product/icons";
import { THIN_DATA_MIN_PARTICIPANTS } from "@/lib/dialogue/routing/constants";
import type { ThinResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = { data: ThinResolved };

/**
 * Thin-data state: early-signal flag and Add to my plan.
 * Cutoff is the demo constant THIN_DATA_MIN_PARTICIPANTS.
 */
export default function ThinDataTemplate({ data }: Props) {
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

  return (
    <div className="dlg-route-answer" data-template="thin_data">
      <p className="dlg-route-finding">{data.finding}</p>
      <div className="dp-low-signal">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">
          Early signal from {data.count} {data.count === 1 ? "person" : "people"}. Under{" "}
          {THIN_DATA_MIN_PARTICIPANTS} for a chart (demo cutoff).
        </p>
      </div>
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
