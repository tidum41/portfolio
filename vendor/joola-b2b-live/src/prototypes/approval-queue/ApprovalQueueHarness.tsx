/**
 * Isolated prototype surface: admin approval queue.
 */
import { useEffect } from "react";
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

  useEffect(() => {
    if (embed) document.documentElement.classList.add("is-embed");
  }, [embed]);

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
