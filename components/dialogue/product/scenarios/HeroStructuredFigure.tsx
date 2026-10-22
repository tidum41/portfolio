import HeroChatCard from "@/components/dialogue/product/scenarios/HeroChatCard";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import EvidenceFooter from "@/components/dialogue/product/EvidenceFooter";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

function FunnelCard() {
  return (
    <div
      className={`dp-hero-v2__card dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <ChartVizCard title="Drop-off by step">
        <ChartBarList
          rows={CHECKOUT_FUNNEL.steps.slice(0, 4).map((s) => ({
            label: s.label,
            value: s.pct,
            display: formatChartPercent(s.pct),
            focal: Boolean(s.focal),
          }))}
          max={100}
          fillMode="index"
        />
      </ChartVizCard>
    </div>
  );
}

/**
 * Hero v2. Desktop: chat card on the left, funnel and clip row on the right, one
 * 24px gutter, no rotation. Mobile is a separate composition: chat plus a funnel
 * card that overlaps its bottom 24px, no clip row.
 */
export default function HeroStructuredFigure() {
  return (
    <div className="dp-hero-v2 dialogue-product-root">
      <div className="dp-hero-v2__desktop">
        <HeroChatCard />
        <div className="dp-hero-v2__aside" data-annotate-part="aside">
          <FunnelCard />
          <div
            className={`dp-hero-v2__card dp-hero-v2__quotes dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
            data-annotate-part="quotes-card"
          >
            <ClipQuotes />
            <EvidenceFooter expand />
          </div>
        </div>
      </div>
      <div className="dp-hero-v2__mobile">
        <HeroChatCard composer={false} />
        <FunnelCard />
      </div>
    </div>
  );
}
