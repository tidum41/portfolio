"use client";

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import type { SegmentResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = { data: SegmentResolved };

/** Segment comparison: one bar per named group, cherry focal and teal secondary. */
export default function SegmentComparisonTemplate({ data }: Props) {
  return (
    <div className="dlg-route-answer" data-template="segment_comparison">
      <ChartVizCard title={data.finding}>
        <ChartBarList max={data.max} rows={data.rows} />
      </ChartVizCard>
    </div>
  );
}
