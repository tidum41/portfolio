"use client";

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import type { RankedResolved } from "@/lib/dialogue/routing/playground";

type Props = { data: RankedResolved };

export default function RankedListTemplate({ data }: Props) {
  return (
    <div className="dlg-route-answer" data-template="ranked_list">
      <ChartVizCard title={data.finding} footnote={data.whyChart} className="dlg-route-card">
        <ChartBarList max={data.max} rows={data.rows} onSelect={() => {}} />
      </ChartVizCard>
    </div>
  );
}
