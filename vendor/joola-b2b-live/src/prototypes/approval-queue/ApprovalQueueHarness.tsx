/**
 * Admin approval queue prototype inside production AdminShell.
 */
import { useSearchParams } from "react-router-dom";
import { AdminShell } from "../../components/layout/AdminShell";
import { ProtoPicker } from "../ProtoPicker";
import { ApprovalQueueIntro } from "./ApprovalQueueIntro";
import "./approval.css";
import { ApprovalQueueSection, ProtoStateDial } from "./Frame";
import { Ledger } from "./Ledger";
import { SplitInbox } from "./Split";
import { Triage } from "./Triage";

export function ApprovalQueueHarness() {
  const [params] = useSearchParams();
  const force = params.get("protoState") || "default";
  const variants = [
    {
      name: "Ledger",
      render: () => (
        <ApprovalQueueSection>
          <ApprovalQueueIntro />
          <Ledger key={force} />
        </ApprovalQueueSection>
      ),
    },
    {
      name: "Triage card",
      render: () => (
        <ApprovalQueueSection>
          <ApprovalQueueIntro />
          <Triage key={force} />
        </ApprovalQueueSection>
      ),
    },
    {
      name: "Split inbox",
      render: () => (
        <ApprovalQueueSection>
          <ApprovalQueueIntro />
          <SplitInbox key={force} />
        </ApprovalQueueSection>
      ),
    },
  ];
  return (
    <AdminShell protoFoot>
      <ProtoStateDial />
      <ProtoPicker variants={variants} hasMotion />
    </AdminShell>
  );
}

export default ApprovalQueueHarness;
