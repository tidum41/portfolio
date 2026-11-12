/**
 * Isolated prototype surface: quick-order line item.
 * Route: /prototypes/quick-order-row
 * Nothing here is imported by production screens.
 */
import { useEffect, useLayoutEffect } from "react";
import {
  attachCaseStudyEmbedMode,
  caseStudyEmbedFromSearch,
} from "../../embed/caseStudyEmbedMode";
import { attachEmbedHeightReporter } from "../../embed/reportEmbedHeight";
import { useSearchParams } from "react-router-dom";
import { QuickOrderState } from "./context";
import { QuickOrderDial } from "./QuickOrderDial";
import { parseVariant, VARIANTS } from "./logic";
import { AvailabilityVariant } from "./variants/Availability";
import { CompactVariant } from "./variants/Compact";
import { ReorderVariant } from "./variants/Reorder";
import { PresetsVariant } from "./variants/Presets";
import "../proto-scaffold.css";
import "./quick-order-row.css";

/** Portfolio case-study embeds omit the Cases quantity mode (v=2). */
const RENDER = {
  "1": CompactVariant,
  "3": ReorderVariant,
  "4": AvailabilityVariant,
  "5": PresetsVariant,
} as const;

function Stage() {
  const [params, setParams] = useSearchParams();
  const embed = params.get("embed") === "1";
  let variant = parseVariant(params.get("v"));
  if (caseStudyEmbedFromSearch(params) && variant === "2") variant = "3";
  const Active = RENDER[variant as keyof typeof RENDER] ?? CompactVariant;

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
      {embed ? null : <QuickOrderDial />}
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
