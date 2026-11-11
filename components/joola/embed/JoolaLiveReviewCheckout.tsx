"use client";

import JoolaLiveRoot from "./JoolaLiveRoot";
import JoolaSessionBootstrap from "./JoolaSessionBootstrap";
import JoolaUniformScale from "./JoolaUniformScale";
import JoolaProtoFigure from "./JoolaProtoFigure";
import { BuyerShell } from "@/vendor/joola-b2b-live/src/components/layout/BuyerShell";
import { ReviewPage } from "@/vendor/joola-b2b-live/src/screens/ReviewPage";

const DESIGN_W = 1280;
const SEARCH =
  "?clean=1&view=portal&screen=review&state=default&latency=0&account=dicks";

export default function JoolaLiveReviewCheckout({ caption }: { caption?: string }) {
  return (
    <JoolaProtoFigure
      figureId="review-checkout"
      caption={caption}
      designWidth={DESIGN_W}
      minHeight={480}
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <JoolaLiveRoot initialEntry={`/review${SEARCH}`}>
          <JoolaSessionBootstrap
            role="buyer"
            accountId="dicks"
            screen="review"
            preloadCart
          />
          <BuyerShell>
            <ReviewPage />
          </BuyerShell>
        </JoolaLiveRoot>
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}
