/**
 * Calm skeleton that mirrors the All in One demo chrome: 52px toolbar
 * (title + Categories/Sort pills) and ~8 task rows (16px checkbox + text bars).
 * Columns match MenuBar / TaskItem padding so the iframe swap feels seamless.
 */
const ROW_WIDTHS = ["72%", "58%", "81%", "46%", "67%", "54%", "76%", "61%"] as const;

export default function AllinoneDemoSkeleton({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="aio-demo-skel"
      data-hidden={hidden ? "true" : "false"}
      aria-hidden
    >
      <div className="aio-demo-skel-toolbar">
        <div className="aio-demo-skel-toolbar-left">
          <span className="aio-demo-skel-icon" />
          <span className="aio-demo-skel-title" />
        </div>
        <div className="aio-demo-skel-toolbar-right">
          <span className="aio-demo-skel-icon-sm" />
          <span className="aio-demo-skel-icon-sm" />
          <span className="aio-demo-skel-pill aio-demo-skel-pill--ghost" />
          <span className="aio-demo-skel-pill aio-demo-skel-pill--solid" />
        </div>
      </div>
      <div className="aio-demo-skel-list">
        {ROW_WIDTHS.map((w, i) => (
          <div key={i} className="aio-demo-skel-row">
            <span className="aio-demo-skel-check" />
            <span className="aio-demo-skel-bar" style={{ width: w }} />
          </div>
        ))}
      </div>
      <div className="aio-demo-skel-shine" />
    </div>
  );
}
