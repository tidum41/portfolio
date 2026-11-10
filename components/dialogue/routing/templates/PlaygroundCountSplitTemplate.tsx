"use client";

import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import type { CountSplitResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = { data: CountSplitResolved & { whyChart: string } };

/** Playground count split: stacked bar, one cherry focal, no drill-in. */
export default function PlaygroundCountSplitTemplate({ data }: Props) {
  const segments = data.groups.map((g) => ({
    label: g.label,
    value: g.value,
    display: `${g.value} of ${data.total}`,
    focal: g.focal,
  }));
  return (
    <div className="dlg-route-answer" data-template="count_split">
      <ChartVizCard title={data.finding} footnote={data.whyChart} className="dlg-route-card">
        <ChartStackedBar segments={segments} total={data.total} lanes />
      </ChartVizCard>
    </div>
  );
}
