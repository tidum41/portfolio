"use client";

import { useState, type ReactNode } from "react";
import "@/vendor/joola-b2b-live/src/prototypes/proto-scaffold.css";
import "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/quick-order-row.css";
import { QuickOrderState } from "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/context";
import { AvailabilityVariant } from "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/variants/Availability";
import { CasesVariant } from "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/variants/Cases";
import { CompactVariant } from "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/variants/Compact";
import { ReorderVariant } from "@/vendor/joola-b2b-live/src/prototypes/quick-order-row/variants/Reorder";
import JoolaLiveRoot from "./JoolaLiveRoot";
import JoolaUniformScale from "./JoolaUniformScale";
import JoolaProtoFigure, { JoolaProtoSegFooter } from "./JoolaProtoFigure";

export type QORowVariant = "compact" | "cases" | "reorder" | "stock";

const VARIANTS: { value: QORowVariant; label: string; v: string }[] = [
  { value: "compact", label: "Compact", v: "1" },
  { value: "cases", label: "Cases", v: "2" },
  { value: "reorder", label: "Reorder", v: "3" },
  { value: "stock", label: "Stock status", v: "4" },
];

const RENDER: Record<QORowVariant, () => ReactNode> = {
  compact: () => <CompactVariant />,
  cases: () => <CasesVariant />,
  reorder: () => <ReorderVariant />,
  stock: () => <AvailabilityVariant />,
};

const SLOT_HEIGHT: Record<QORowVariant, number> = {
  compact: 380,
  cases: 400,
  reorder: 420,
  stock: 400,
};

const DESIGN_W = 1024;

function RowStage({ variant }: { variant: QORowVariant }) {
  const v = VARIANTS.find((item) => item.value === variant)?.v ?? "1";
  const entry = `/prototypes/quick-order-row?clean=1&v=${v}&line=typed&w=${DESIGN_W}&latency=0`;
  const Active = RENDER[variant];

  return (
    <JoolaLiveRoot initialEntry={entry}>
      <QuickOrderState>
        <div className="qo-stage qo-stage--embed">
          <div className="qo-stage__canvas">
            <Active key={variant} />
          </div>
        </div>
      </QuickOrderState>
    </JoolaLiveRoot>
  );
}

export function JoolaLiveQuickOrderRow({
  variant = "compact",
  figureId = "quick-order-row",
}: {
  variant?: QORowVariant;
  figureId?: string;
}) {
  return (
    <JoolaProtoFigure
      figureId={`${figureId}-${variant}`}
      designWidth={DESIGN_W}
      minHeight={SLOT_HEIGHT[variant]}
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <RowStage variant={variant} />
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}

export default function JoolaLiveQuickOrderRowCompare({
  caption,
}: {
  caption?: string;
}) {
  const [variant, setVariant] = useState<QORowVariant>("cases");

  return (
    <JoolaProtoFigure
      figureId="quick-order-row-compare"
      caption={caption}
      designWidth={DESIGN_W}
      minHeight={SLOT_HEIGHT[variant]}
      footer={
        <JoolaProtoSegFooter
          label="Quick order line view"
          value={variant}
          options={VARIANTS.map(({ value, label }) => ({ value, label }))}
          onChange={setVariant}
        />
      }
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <RowStage variant={variant} />
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}

export function JoolaLiveQuickOrderRowSearch({
  caption,
}: {
  caption?: string;
}) {
  return (
    <JoolaProtoFigure
      figureId="quick-order-row-search"
      caption={caption}
      designWidth={DESIGN_W}
      minHeight={SLOT_HEIGHT.compact}
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <RowStage variant="compact" />
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}
