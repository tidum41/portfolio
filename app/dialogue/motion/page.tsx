import DialogueMotionStage from "@/components/dialogue/live/DialogueMotionStage";
import { MOTION_DEMOS, STAGES, stageBox, type MotionDemo } from "@/components/dialogue/motion/stages";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Dialogue motion stage", robots: { index: false } };

/** Recording stage for the demos (scripts/record-dialogue-motion.mjs). Geometry lives in components/dialogue/motion/stages.ts. */
export default async function Page({ searchParams }: { searchParams: Promise<{ demo?: string; m?: string }> }) {
  const { demo: d, m } = await searchParams;
  const mobile = m === "1";
  const demo = (MOTION_DEMOS.includes(d as MotionDemo) ? d : "hero") as MotionDemo;
  const s = STAGES[demo];
  const b = stageBox(demo, mobile);
  return (
    <main className="dialogue-case-study dlg-motion-page">
      <div id="frame" className={`dialogue-rachel-frame dialogue-rachel-frame--${s.tone} dlg-motion-frame`} style={{ width: `${b.w}px`, height: `${b.h}px`, padding: `${b.top}px ${b.w - b.panelW - b.top}px ${b.top}px ${b.top}px` }} data-mobile={mobile ? "" : undefined}>
        <div className="dialogue-product-root dp-chat-panel-typography dlg-motion-frame__panel" data-zoom={1} style={{ width: `${b.panelW}px`, height: `${b.panelH}px` }}>
          <DialogueMotionStage demo={demo} />
        </div>
      </div>
    </main>
  );
}
