"use client";

import { useState } from "react";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SideSample from "@/components/dialogue/product/scenarios/SideSample";
import type { SegmentResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = { data: SegmentResolved };

/** Segment comparison: one bar per named group, cherry focal and teal secondary. */
export default function SegmentComparisonTemplate({ data }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const row = open == null ? null : data.rows[open];

  return (
    <div className="dlg-route-answer" data-template="segment_comparison">
      <ChartVizCard title={data.finding} className="dlg-route-card">
        <ChartBarList
          max={data.max}
          rows={data.rows}
          selected={open}
          onSelect={(index) => setOpen((current) => (current === index ? null : index))}
        />
      </ChartVizCard>
      {row && row.people.length > 0 ? (
        <SideSample
          label={row.label.replace(/^[A-Z]/, (c) => c.toLowerCase())}
          total={row.value}
          quotes={row.people.map((person) => ({
            participant: person.name,
            time: person.time,
            quote: person.quote,
          }))}
        />
      ) : null}
    </div>
  );
}
