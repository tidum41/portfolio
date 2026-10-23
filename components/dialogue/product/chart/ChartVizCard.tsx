import type { ReactNode } from "react";

type Props = {
  title?: string;
  caption?: string;
  footnote?: string;
  children: ReactNode;
  className?: string;
};

/** Framed plot well: title above, caption/footnote below (Carbon: legend under chart). */
export default function ChartVizCard({
  title,
  caption,
  footnote,
  children,
  className,
}: Props) {
  return (
    <div
      className={["dp-chart-root dp-chart-viz-card", className].filter(Boolean).join(" ")}
      data-testid="viz-card"
      data-annotate-part="chart-card"
    >
      <div className="dp-chart-viz-card__inner">
        {title ? <p className="dp-chart-title" data-annotate-part="chart-title">{title}</p> : null}
        {children}
        {caption ? <p className="dp-chart-caption" data-annotate-part="chart-caption">{caption}</p> : null}
        {footnote ? <p className="dp-chart-footnote" data-annotate-part="chart-footnote">{footnote}</p> : null}
      </div>
    </div>
  );
}
