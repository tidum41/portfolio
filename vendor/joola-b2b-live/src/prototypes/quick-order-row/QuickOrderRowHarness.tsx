/**
 * Quick-order row source of truth for case study embeds (Compact, Reorder, Stock).
 * Route: /prototypes/quick-order-row
 */
import { BuyerShell } from "../../components/layout/BuyerShell";
import { ProtoPicker } from "../ProtoPicker";
import {
  QuickOrderRowVariants,
  type QoRowVariant,
} from "./QuickOrderRowVariants";

function withShell(variant: QoRowVariant) {
  return () => (
    <BuyerShell protoFoot>
      <QuickOrderRowVariants variant={variant} />
    </BuyerShell>
  );
}

const VARIANTS = [
  { name: "Compact", render: withShell("compact") },
  { name: "Reorder", render: withShell("reorder") },
  { name: "Stock status", render: withShell("stock") },
];

export function QuickOrderRowHarness() {
  return <ProtoPicker variants={VARIANTS} />;
}

export default QuickOrderRowHarness;
