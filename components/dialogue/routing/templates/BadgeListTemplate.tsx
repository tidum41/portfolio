"use client";

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import type { BadgeResolved } from "@/lib/dialogue/routing/playground";

type Props = { data: BadgeResolved };

export default function BadgeListTemplate({ data }: Props) {
  return (
    <div className="dlg-route-answer" data-template="badge_list">
      <ChartVizCard title={data.finding} footnote={data.whyChart} className="dlg-route-card">
        <ChartBarList max={data.max} rows={data.rows} />
      </ChartVizCard>
    </div>
  );
}
