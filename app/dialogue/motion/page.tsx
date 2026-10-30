import DialogueMotionStage, { type MotionDemo } from "@/components/dialogue/live/DialogueMotionStage";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Dialogue motion stage", robots: { index: false } };

const DEMOS: MotionDemo[] = ["hero", "side", "clip", "before", "every", "picker", "toggles", "bars", "thin"];
/** Frame per demo: 1:1 or 4:3 at 519 css px wide (471 panel + 24 px air), and the well tone it sits in on the page. */
const STAGE = {
  // Hero: whole answer (finding + bar + Unsure) fits at zoom 1; 108px composer min-height is picker-only.
  hero: { ratio: 1, tone: "solution", zoom: 1 },
  side: { ratio: 1, tone: "solution", zoom: 0.92 },
  clip: { ratio: 0.8, tone: "solution", zoom: 0.88 },
  before: { ratio: 0.75, tone: "problem", zoom: 1 },
  // P15 item 4: taller so both sides open without the panel scrolling; the card never shifts.
  every: { ratio: 1.28, tone: "problem", zoom: 0.88 },
  // Zoom 0.8 so Source depth keeps the answer top in the poster frame.
  picker: { ratio: 1, tone: "problem", zoom: 0.8 },
  // P15 item 6: Insight, People, Source, back to Insight; taller so the clip fits under its quote.
  toggles: { ratio: 1.42, tone: "solution", zoom: 0.88 },
  bars: { ratio: 1, tone: "solution", zoom: 0.92 },
  thin: { ratio: 1, tone: "system", zoom: 0.88 },
} as const;

/** Recording stage for the P11 demos (scripts/record-dialogue-motion.mjs). 404s nothing; noindex. */
export default async function Page({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo: d } = await searchParams;
  const demo = (DEMOS.includes(d as MotionDemo) ? d : "hero") as MotionDemo;
  const s = STAGE[demo];
  return (
    <main className="dialogue-case-study dlg-motion-page">
      <div id="frame" className={`dialogue-rachel-frame dialogue-rachel-frame--${s.tone} dlg-motion-frame`} style={{ height: `${Math.round(519 * s.ratio)}px` }}>
        <div className="dialogue-product-root dp-chat-panel-typography dlg-motion-frame__panel" data-zoom={s.zoom} style={{ zoom: s.zoom, width: `${423 / s.zoom}px`, height: `${(Math.round(519 * s.ratio) - 96) / s.zoom}px` }}>
          <DialogueMotionStage demo={demo} />
        </div>
      </div>
    </main>
  );
}
