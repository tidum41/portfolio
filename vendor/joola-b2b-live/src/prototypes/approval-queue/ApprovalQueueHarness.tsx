/**
 * Isolated prototype surface: admin approval queue.
 * Directions from docs/prototype-variants.md. Nothing here is imported
 * by production screens. /prototypes/quick-order-row is a different branch.
 */
import { useSearchParams } from "react-router-dom";
import { ProtoPicker } from "../ProtoPicker";
import "./approval.css";
import { ProtoStateDial } from "./Frame";
import { Ledger } from "./Ledger";
import { SplitInbox } from "./Split";
import { Triage } from "./Triage";

export function ApprovalQueueHarness() {
  const [params] = useSearchParams();
  const force = params.get("protoState") || "default";
  const variants = [
    { name: "Ledger", render: () => <Ledger key={force} /> },
    { name: "Triage card", render: () => <Triage key={force} /> },
    { name: "Split inbox", render: () => <SplitInbox key={force} /> },
  ];
  return (
    <>
      <ProtoStateDial />
      <ProtoPicker variants={variants} hasMotion />
    </>
  );
}

export default ApprovalQueueHarness;
