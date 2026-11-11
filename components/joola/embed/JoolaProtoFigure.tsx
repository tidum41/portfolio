"use client";

import type { ReactNode } from "react";
import JoolaFigureSeg, { type SegOption } from "../JoolaFigureSeg";

export default function JoolaProtoFigure<T extends string>({
  figureId,
  caption,
  designWidth,
  children,
  minHeight,
  footer,
}: {
  figureId: string;
  caption?: string;
  designWidth: number;
  children: ReactNode;
  minHeight?: number;
  footer?: ReactNode;
}) {
  return (
    <figure className="joola-proto-figure" data-joola-figure={figureId}>
      <div
        className="joola-proto-figure__chrome"
        style={minHeight ? { minHeight } : undefined}
      >
        <div data-joola-capture-root data-design-width={designWidth}>
          {children}
        </div>
      </div>
      {footer ? <div className="joola-proto-figure__footer">{footer}</div> : null}
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}

export function JoolaProtoSegFooter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <JoolaFigureSeg label={label} value={value} options={options} onChange={onChange} />
  );
}
