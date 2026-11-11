"use client";

import { useState, type ReactNode } from "react";
import JoolaProtoIframe from "./JoolaProtoIframe";
import JoolaFigureSeg from "./JoolaFigureSeg";
import {
  JOOLA_EMBED_HEIGHT,
  JOOLA_FIGURE_URLS,
  approvalUrl,
  qoRowUrl,
  type QoVariant,
} from "@/lib/joola/protoEmbed";

const QO_W = 1024;
const PORTAL_W = 1280;

const QO_HEIGHTS: Record<QoVariant, number> = {
  "1": JOOLA_EMBED_HEIGHT["quick-order-row-search"],
  "2": JOOLA_EMBED_HEIGHT["quick-order-row-compare"],
  "3": JOOLA_EMBED_HEIGHT["quick-order-row-compare"],
  "4": JOOLA_EMBED_HEIGHT["quick-order-row-compare"],
};

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
    (variantParam as QoVariant) ?? "2",
  );
  const [approvalView, setApprovalView] = useState<"split" | "ledger">(
    tab === "ledger" ? "ledger" : "split",
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
          designWidth={PORTAL_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-portal"]}
        />,
        PORTAL_W,
      );
    case "quick-order-row-search":
      return wrapper(
        <JoolaProtoIframe
          figureId="quick-order-row-search"
          src={qoRowUrl("1")}
          designWidth={QO_W}
          designHeight={JOOLA_EMBED_HEIGHT["quick-order-row-search"]}
        />,
        QO_W,
      );
    case "quick-order-row-compare":
      return wrapper(
        <JoolaProtoIframe
          key={qoVariant}
          figureId="quick-order-row-compare"
          src={qoRowUrl(qoVariant)}
          designWidth={QO_W}
          designHeight={QO_HEIGHTS[qoVariant]}
          footer={
            <JoolaFigureSeg
              label="Quick order line view"
              value={qoVariant}
              options={[
                { value: "2", label: "Cases" },
                { value: "3", label: "Reorder" },
                { value: "4", label: "Stock status" },
              ]}
              onChange={setQoVariant}
            />
          }
        />,
        QO_W,
      );
    case "review-checkout":
      return wrapper(
        <JoolaProtoIframe
          figureId="review-checkout"
          src={JOOLA_FIGURE_URLS["review-checkout"]}
          designWidth={PORTAL_W}
          designHeight={JOOLA_EMBED_HEIGHT["review-checkout"]}
        />,
        PORTAL_W,
      );
    case "approval-queue":
      return wrapper(
        <JoolaProtoIframe
          key={approvalView}
          figureId="approval-queue"
          src={approvalView === "split" ? approvalUrl("3") : approvalUrl("1")}
          designWidth={PORTAL_W}
          designHeight={
            approvalView === "split"
              ? JOOLA_EMBED_HEIGHT["approval-queue-split"]
              : JOOLA_EMBED_HEIGHT["approval-queue-ledger"]
          }
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
        PORTAL_W,
      );
    default:
      return null;
  }
}
