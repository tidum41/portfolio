"use client";

import { useState } from "react";
import "@/vendor/joola-b2b-live/src/prototypes/approval-queue/approval.css";
import { Ledger } from "@/vendor/joola-b2b-live/src/prototypes/approval-queue/Ledger";
import { SplitInbox } from "@/vendor/joola-b2b-live/src/prototypes/approval-queue/Split";
import JoolaLiveRoot from "./JoolaLiveRoot";
import JoolaUniformScale from "./JoolaUniformScale";
import JoolaProtoFigure, { JoolaProtoSegFooter } from "./JoolaProtoFigure";

export type ApprovalView = "split" | "ledger";

const DESIGN_W = 1280;
const SLOT: Record<ApprovalView, number> = { split: 520, ledger: 560 };

function ApprovalStage({ view }: { view: ApprovalView }) {
  const search = "?clean=1&protoState=default&latency=0";
  return (
    <JoolaLiveRoot initialEntry={`/prototypes/approval-queue${search}`}>
      {view === "split" ? <SplitInbox key="split" /> : <Ledger key="ledger" />}
    </JoolaLiveRoot>
  );
}

export default function JoolaLiveApprovalCompare({ caption }: { caption?: string }) {
  const [view, setView] = useState<ApprovalView>("split");

  return (
    <JoolaProtoFigure
      figureId="approval-queue"
      caption={caption}
      designWidth={DESIGN_W}
      minHeight={SLOT[view]}
      footer={
        <JoolaProtoSegFooter
          label="Approval queue view"
          value={view}
          options={[
            { value: "split", label: "Split inbox" },
            { value: "ledger", label: "Ledger" },
          ]}
          onChange={setView}
        />
      }
    >
      <JoolaUniformScale designWidth={DESIGN_W}>
        <ApprovalStage view={view} />
      </JoolaUniformScale>
    </JoolaProtoFigure>
  );
}
