"use client";

import JoolaLiveRoot from "./JoolaLiveRoot";
import JoolaSessionBootstrap from "./JoolaSessionBootstrap";
import JoolaUniformScale from "./JoolaUniformScale";
import JoolaProtoFigure from "./JoolaProtoFigure";
import { BuyerShell } from "@/vendor/joola-b2b-live/src/components/layout/BuyerShell";
import { QuickOrderPage } from "@/vendor/joola-b2b-live/src/screens/QuickOrderPage";

const DESIGN_W = 1280;
const SEARCH =
  "?clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks";

export default function JoolaLiveQuickOrderPortal({
  caption,
  figureId = "quick-order-portal",
}: {
  caption?: string;
  figureId?: string;
}) {
  return (
    <JoolaProtoFigure
      figureId={figureId}
      caption={caption}
      designWidth={DESIGN_W}
      minHeight={520}
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <JoolaLiveRoot initialEntry={`/quick-order${SEARCH}`}>
          <JoolaSessionBootstrap role="buyer" accountId="dicks" screen="quick-order" />
          <BuyerShell>
            <QuickOrderPage />
          </BuyerShell>
        </JoolaLiveRoot>
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}
