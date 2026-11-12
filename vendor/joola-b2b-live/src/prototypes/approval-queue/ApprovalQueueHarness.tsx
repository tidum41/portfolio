/**
 * Isolated prototype surface: admin approval queue.
 */
import { useEffect, useLayoutEffect } from "react";
import {
  attachCaseStudyEmbedMode,
  caseStudyEmbedFromSearch,
} from "../../embed/caseStudyEmbedMode";
import { attachEmbedHeightReporter } from "../../embed/reportEmbedHeight";
import { useSearchParams } from "react-router-dom";
import { ProtoPicker } from "../ProtoPicker";
import "./approval.css";
import { ProtoStateDial } from "./Frame";
import { Ledger } from "./Ledger";
import { SplitInbox } from "./Split";
import { Triage } from "./Triage";

function parseEmbedVariant(v: string | null) {
  const n = Number(v ?? "3");
  if (n === 1) return <Ledger key="embed-ledger" />;
  if (n === 2) return <Triage key="embed-triage" />;
  return <SplitInbox key="embed-split" />;
}

export function ApprovalQueueHarness() {
  const [params] = useSearchParams();
  const embed = params.get("embed") === "1";
  const force = params.get("protoState") || "default";
  const variants = [
    { name: "Ledger", render: () => <Ledger key={force} /> },
    { name: "Triage card", render: () => <Triage key={force} /> },
    { name: "Split inbox", render: () => <SplitInbox key={force} /> },
  ];

  useLayoutEffect(() => {
    if (!embed) return;
    document.documentElement.classList.add("is-embed");
    const stopHeight = attachEmbedHeightReporter();
    const stopCs = caseStudyEmbedFromSearch(params)
      ? attachCaseStudyEmbedMode()
      : () => {};
    return () => {
      stopCs();
      stopHeight();
      document.documentElement.classList.remove("is-embed");
    };
  }, [embed, params]);

  if (embed) {
    return parseEmbedVariant(params.get("v"));
  }

  return (
    <>
      <ProtoStateDial />
      <ProtoPicker variants={variants} hasMotion />
    </>
  );
}

export default ApprovalQueueHarness;
