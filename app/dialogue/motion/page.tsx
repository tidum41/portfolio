import DialogueMotionStage, { type MotionDemo } from "@/components/dialogue/live/DialogueMotionStage";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Dialogue motion stage", robots: { index: false } };

const DEMOS: MotionDemo[] = ["hero", "side", "clip", "before", "every", "picker", "toggles", "bars"];
/** Frame per demo: 1:1 or 4:3 at 519 css px wide (471 panel + 24 px air), and the well tone it sits in on the page. */
const STAGE = {
  hero: { ratio: 0.75, tone: "solution", zoom: 1 },
  side: { ratio: 1, tone: "solution", zoom: 0.92 },
  clip: { ratio: 0.82, tone: "solution", zoom: 0.88 },
  before: { ratio: 0.84, tone: "problem", zoom: 1 },
  every: { ratio: 1, tone: "problem", zoom: 0.88 },
  picker: { ratio: 1, tone: "problem", zoom: 0.88 },
  toggles: { ratio: 1, tone: "solution", zoom: 0.88 },
  bars: { ratio: 1, tone: "solution", zoom: 0.92 },
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
