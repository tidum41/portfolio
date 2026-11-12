"use client";

import { useState, type ReactNode } from "react";
import JoolaProtoIframe from "./JoolaProtoIframe";
import JoolaFigureSeg from "./JoolaFigureSeg";
import {
  JOOLA_EMBED_DESIGN_WIDTH,
  JOOLA_EMBED_HEIGHT,
  JOOLA_FIGURE_URLS,
  approvalUrl,
  qoRowUrl,
  type QoVariant,
} from "@/lib/joola/protoEmbed";

const EMBED_W = JOOLA_EMBED_DESIGN_WIDTH;

export default function JoolaParityBench({
  figure,
  variant: variantParam,
  tab,
}: {
  figure: string;
  variant?: string;
  tab?: string;
}) {
  const [qoVariant, setQoVariant] = useState<QoVariant>(
    (variantParam as QoVariant) ?? "1",
  );
  const [approvalView, setApprovalView] = useState<"split" | "ledger">(
    tab === "ledger" ? "ledger" : "split",
  );
  const [qoSlotH, setQoSlotH] = useState(JOOLA_EMBED_HEIGHT["quick-order-row-compact"]);
  const [approvalSlotH, setApprovalSlotH] = useState(
    Math.max(JOOLA_EMBED_HEIGHT["approval-queue-split"], JOOLA_EMBED_HEIGHT["approval-queue-ledger"]),
  );

  const wrapper = (child: ReactNode, width: number) => (
    <div style={{ width, maxWidth: "100%", margin: "0 auto" }}>{child}</div>
  );

  switch (figure) {
    case "quick-order-portal":
      return wrapper(
        <JoolaProtoIframe
          figureId="quick-order-portal"
          src={JOOLA_FIGURE_URLS["quick-order-portal"]}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-portal"]}
        />,
        EMBED_W,
      );
    case "quick-order-row-search":
      return wrapper(
        <JoolaProtoIframe
          figureId="quick-order-row-search"
          src={qoRowUrl("1")}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-row-search"]}
        />,
        EMBED_W,
      );
    case "quick-order-row-compare":
      return wrapper(
        <JoolaProtoIframe
          key={qoVariant}
          figureId="quick-order-row-compare"
          src={qoRowUrl(qoVariant)}
          designWidth={EMBED_W}
          designHeight={qoSlotH}
          onEmbedHeight={(h) => setQoSlotH((prev) => Math.max(prev, h))}
          footer={
            <JoolaFigureSeg
              label="Quick order line view"
              value={qoVariant}
              options={[
                { value: "1", label: "Compact" },
                { value: "3", label: "Reorder" },
                { value: "4", label: "Stock status" },
              ]}
              onChange={setQoVariant}
            />
          }
        />,
        EMBED_W,
      );
    case "review-checkout":
      return wrapper(
        <JoolaProtoIframe
          figureId="review-checkout"
          src={JOOLA_FIGURE_URLS["review-checkout"]}
          designWidth={EMBED_W}
          designHeight={JOOLA_EMBED_HEIGHT["review-checkout"]}
        />,
        EMBED_W,
      );
    case "approval-queue":
      return wrapper(
        <JoolaProtoIframe
          key={approvalView}
          figureId="approval-queue"
          src={approvalView === "split" ? approvalUrl("3") : approvalUrl("1")}
          designWidth={EMBED_W}
          designHeight={approvalSlotH}
          onEmbedHeight={(h) => setApprovalSlotH((prev) => Math.max(prev, h))}
          footer={
            <JoolaFigureSeg
              label="Approval queue view"
              value={approvalView}
              options={[
                { value: "split", label: "Split inbox" },
                { value: "ledger", label: "Ledger" },
              ]}
              onChange={setApprovalView}
            />
          }
        />,
        EMBED_W,
      );
    default:
      return null;
  }
}
