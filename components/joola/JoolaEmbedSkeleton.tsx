export default function JoolaEmbedSkeleton({
  figureId,
  designWidth,
  designHeight,
}: {
  figureId: string;
  designWidth: number;
  designHeight: number;
}) {
  const rows =
    figureId === "quick-order-row-compare"
      ? 5
      : figureId === "approval-queue"
        ? 6
        : 4;

  return (
    <div
      className="joola-embed-skeleton"
      data-joola-skeleton={figureId}
      style={{ width: designWidth, height: designHeight }}
      aria-hidden
    >
      <div className="joola-embed-skeleton__bar" style={{ width: "32%", height: 14 }} />
      <div className="joola-embed-skeleton__grid">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="joola-embed-skeleton__row">
            <div className="joola-embed-skeleton__thumb" />
            <div className="joola-embed-skeleton__cols">
              <div className="joola-embed-skeleton__line" style={{ width: "58%" }} />
              <div className="joola-embed-skeleton__line" style={{ width: "36%" }} />
            </div>
            <div className="joola-embed-skeleton__qty" />
            <div className="joola-embed-skeleton__total" />
          </div>
        ))}
      </div>
    </div>
  );
}
