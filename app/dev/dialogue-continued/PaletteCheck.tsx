"use client";

/* Palette check sheet (?pal=N&check=1, dev only): every chart state on one page, from existing components.
   Data is MOCK-DATA 4d, 4f, 4h (the All row) and 4i. Fills come from position (palettes.css). */
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { FRIDAY, TOTAL } from "@/components/dialogue/live/DeliveryDateTrial";
import HybridPanel from "./HybridPanel";

const SERIES = [1, 2, 3, 4, 5, 6] as const;

function Label({ children }: { children: string }) {
  return <p className="dlgh-caption">{children}</p>;
}

export default function PaletteCheck() {
  return (
    <div className="dlg-check dlgh">
      <div className="dlg-trial dlg-cont" data-mode="live">
        <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
          <div className="dlg-trial__body">
            <Label>At rest</Label>
            <AnswerCard still sideOpen={false} />
            <Label>225 open</Label>
            <AnswerCard still sideOpen="friday" />
            <Label>75 open</Label>
            <AnswerCard still sideOpen="unsure" />

            <Label>Folded reply 1</Label>
            <div className="dlgh-muted">
              <button type="button" className="dlgh-compact dlg-live__bar" tabIndex={-1} aria-hidden>
                <span className="dlgh-compact__bar">
                  <ChartStackedBar total={TOTAL} segments={[
                    { label: "Read it as this Friday", value: FRIDAY, display: "225", focal: true },
                    { label: "Unsure", value: TOTAL - FRIDAY, display: "75", remainder: true },
                  ]} />
                </span>
              </button>
            </div>

            <Label>Ranked themes</Label>
            <ChartVizCard title="What shoppers asked for after checkout, longest first.">
              <div className="dlg-answer--rows" data-series="1">
                <ChartBarList max={41} rows={[
                  { label: "Show an exact calendar date", value: 41, display: "41 of 300", focal: true },
                  { label: "Say which Friday it means", value: 28, display: "28 of 300" },
                  { label: "Warn when Friday slips", value: 17, display: "17 of 300" },
                  { label: "Offer a pickup option", value: 11, display: "11 of 300" },
                  { label: "Email the day before", value: 8, display: "8 of 300" },
                ]} />
              </div>
            </ChartVizCard>

            <Label>Three and four parts</Label>
            <ChartVizCard title="Which delivery badge most changed confidence to add to cart?">
              <div className="dlg-live__bar" data-layout="bar">
                <ChartStackedBar lanes total={300} segments={[
                  { label: "‘Arrives by Friday’", value: 118, display: "118 of 300" },
                  { label: "Free delivery over $50", value: 72, display: "72 of 300" },
                  { label: "Free returns for 30 days", value: 110, display: "110 of 300" },
                ]} />
              </div>
            </ChartVizCard>
            <ChartVizCard title="At which stage do shoppers start to doubt the price?">
              <div className="dlg-live__bar" data-layout="bar">
                <ChartStackedBar lanes total={94} segments={[
                  { label: "Browse", value: 8, display: "8 of 94" },
                  { label: "Product page", value: 21, display: "21 of 94" },
                  { label: "Cart", value: 47, display: "47 of 94" },
                  { label: "Checkout", value: 18, display: "18 of 94" },
                ]} />
              </div>
            </ChartVizCard>

            <Label>Series 1 to 6</Label>
            <div className="dlg-check__swatches">
              {SERIES.map((n) => (
                <span key={n} className="dlg-check__swatch">
                  <span className="dlg-check__chip" style={{ background: `var(--dp-series-${n})` }} />
                  <span className="dlgh-caption">{n}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="dlgh-caption">Illustrative data.</p>

      <Label>Reply 1 reopened under reply 2</Label>
      <HybridPanel opt="h2" state="top" variant="reply1" />
      <Label>A theme row open</Label>
      <HybridPanel opt="h" state="landed" deep />
    </div>
  );
}
