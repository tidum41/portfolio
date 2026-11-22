"use client";

import { useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaFigureSeg from "./JoolaFigureSeg";
import {
  QuickOrderLineInner,
  type QuickOrderVariant,
} from "./JoolaQuickOrderLine";

const VARIANTS: { value: QuickOrderVariant; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "cases", label: "Cases" },
  { value: "reorder", label: "Reorder" },
  { value: "stock", label: "Stock status" },
];

const VARIANT_HEIGHT: Record<QuickOrderVariant, number> = {
  default: 220,
  compact: 200,
  cases: 228,
  reorder: 248,
  stock: 220,
};

export default function JoolaQuickOrderCompare({ caption }: { caption?: string }) {
  const [variant, setVariant] = useState<QuickOrderVariant>("cases");
  const minH = VARIANT_HEIGHT[variant];

  return (
    <JoolaStage
      caption={caption}
      label="Quick order line variants"
      footer={
        <JoolaFigureSeg
          label="Quick order line view"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      }
    >
      <div
        className="joola-variant-slot"
        style={{ minHeight: minH }}
        data-variant={variant}
      >
        <QuickOrderLineInner
          key={variant}
          variant={variant}
          initialQty={variant === "cases" ? 12 : 6}
          productId={variant === "reorder" ? "hyperion" : "perseus"}
        />
      </div>
    </JoolaStage>
  );
}
