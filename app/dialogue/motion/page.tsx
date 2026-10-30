import DialogueMotionStage from "@/components/dialogue/live/DialogueMotionStage";
import { MOTION_DEMOS, STAGES, STAGE_PANEL_W, stageBox, type MotionDemo } from "@/components/dialogue/motion/stages";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Dialogue motion stage", robots: { index: false } };

/** Recording stage for the demos (scripts/record-dialogue-motion.mjs). Geometry lives in components/dialogue/motion/stages.ts. */
export default async function Page({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo: d } = await searchParams;
  const demo = (MOTION_DEMOS.includes(d as MotionDemo) ? d : "hero") as MotionDemo;
  const s = STAGES[demo];
  const b = stageBox(demo);
  return (
    <main className="dialogue-case-study dlg-motion-page">
      <div id="frame" className={`dialogue-rachel-frame dialogue-rachel-frame--${s.tone} dlg-motion-frame`} style={{ width: `${b.w}px`, height: `${b.h}px`, paddingTop: `${b.top}px` }}>
        <div className="dialogue-product-root dp-chat-panel-typography dlg-motion-frame__panel" data-zoom={s.zoom} style={{ zoom: s.zoom, width: `${STAGE_PANEL_W / s.zoom}px`, height: `${b.panelH / s.zoom}px` }}>
          <DialogueMotionStage demo={demo} />
        </div>
      </div>
    </main>
  );
}
