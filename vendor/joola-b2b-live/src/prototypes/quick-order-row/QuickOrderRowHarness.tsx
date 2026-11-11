/**
 * Isolated prototype surface: quick-order line item.
 * Route: /prototypes/quick-order-row
 * Nothing here is imported by production screens.
 */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QuickOrderState } from "./context";
import { QuickOrderDial } from "./QuickOrderDial";
import { parseVariant, VARIANTS } from "./logic";
import { AvailabilityVariant } from "./variants/Availability";
import { CasesVariant } from "./variants/Cases";
import { CompactVariant } from "./variants/Compact";
import { ReorderVariant } from "./variants/Reorder";
import "../proto-scaffold.css";
import "./quick-order-row.css";

const RENDER = {
  "1": CompactVariant,
  "2": CasesVariant,
  "3": ReorderVariant,
  "4": AvailabilityVariant,
} as const;

function Stage() {
  const [params, setParams] = useSearchParams();
  const variant = parseVariant(params.get("v"));
  const Active = RENDER[variant];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const current = Number(parseVariant(params.get("v")));
      let next = current;
      const num = parseInt(event.key, 10);
      if (num >= 1 && num <= VARIANTS.length) next = num;
      else if (event.key === "ArrowRight") next = (current % VARIANTS.length) + 1;
      else if (event.key === "ArrowLeft") next = ((current - 2 + VARIANTS.length) % VARIANTS.length) + 1;
      else return;
      event.preventDefault();
      const url = new URLSearchParams(params);
      url.set("v", String(next));
      setParams(url, { replace: true });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [params, setParams]);

  return (
    <div className="qo-stage">
      <div className="qo-stage__canvas">
        <Active key={variant} />
      </div>
      <QuickOrderDial />
    </div>
  );
}

export function QuickOrderRowHarness() {
  return (
    <QuickOrderState>
      <Stage />
    </QuickOrderState>
  );
}

export default QuickOrderRowHarness;
