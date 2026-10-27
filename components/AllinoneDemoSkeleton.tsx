/**
 * Skeleton mirroring All in One chrome:
 * - Full-bleed panel bg + full-width toolbar divider (toolbarStrip)
 * - Centered .app column max-width 680px
 * - MenuBar / Blob 16px gutters; checkbox → text gap 10px
 */
const ROW_WIDTHS = ["72%", "58%", "81%", "46%", "67%", "54%", "76%", "61%"] as const;

export default function AllinoneDemoSkeleton({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="aio-demo-skel"
      data-hidden={hidden ? "true" : "false"}
      aria-hidden
    >
      {/* Full-width strip (matches .toolbarStrip border); content centered in .app */}
      <div className="aio-demo-skel-strip" data-aio-skel-strip>
        <div className="aio-demo-skel-col aio-demo-skel-toolbar" data-aio-skel-col>
          <div className="aio-demo-skel-toolbar-left">
            <span className="aio-demo-skel-sidebar" data-aio-skel-sidebar />
            <span className="aio-demo-skel-title" data-aio-skel-title />
          </div>
          <div className="aio-demo-skel-toolbar-right" data-aio-skel-toolbar-right>
            <span className="aio-demo-skel-icon-sm" />
            <span className="aio-demo-skel-icon-sm" />
            <span className="aio-demo-skel-pill aio-demo-skel-pill--ghost" />
            <span className="aio-demo-skel-pill aio-demo-skel-pill--solid" data-aio-skel-sort />
          </div>
        </div>
      </div>

      <div className="aio-demo-skel-col aio-demo-skel-list" data-aio-skel-col data-aio-skel-list>
        {ROW_WIDTHS.map((w, i) => (
          <div key={i} className="aio-demo-skel-row" data-aio-skel-row>
            <span className="aio-demo-skel-check" data-aio-skel-check />
            <span className="aio-demo-skel-bar" data-aio-skel-bar style={{ width: w }} />
          </div>
        ))}
      </div>
    </div>
  );
}
