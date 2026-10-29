"use client";

import { useEffect, useRef, useState } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { ArrowDownIcon, CheckIcon, InfoCircleIcon } from "@/components/dialogue/product/icons";

/** Hearthside mock: Markdown study plan an agent can read as written (P14 item 11). */
const STUDY_PLAN_MD = [
  "# Next study plan: lapsed buyers",
  "",
  "## Lead from this study",
  "",
  "2 of 63 lapsed buyers mentioned a damaged first order. The count is small, so treat it as a lead.",
  "",
  "## Quotes",
  "",
  "### Sam R. · 04:12–04:28",
  "",
  "> The box arrived crushed. I opened it and the bottle was cracked.",
  "",
  "### Alex P. · 11:40–11:55",
  "",
  "> My first order showed up with the seal broken. I did not reorder.",
  "",
  "## Draft questions",
  "",
  "- Tell me about the first order you received from us.",
  "- What did you notice about the packaging when it arrived?",
  "- Did that first delivery change whether you ordered again?",
  "",
  "_Illustrative data. Hearthside mock._",
  "",
].join("\n");

function downloadMarkdown(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Thin-data answer: amber lead warning, clip link, plan action, evidence footer.
 * P14 item 11: Markdown download with ArrowDownIcon. Label stays "Add to my plan"
 * (pinned b056865 / TASTE likes) until Mudit OKs renaming it to "Download study plan".
 */
export default function ThinDataFigure() {
  const [downloaded, setDownloaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onDownload = () => {
    downloadMarkdown("study-plan.md", STUDY_PLAN_MD);
    setDownloaded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <StudyChatShell compact hideHeader hideComposer evidence={2} evidenceOf={{ of: 63, group: "lapsed buyers" }}>
      <UserMessageBubble>What did lapsed buyers say about their first order?</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        Two of 63 lapsed buyers mentioned that their first order arrived damaged.
      </p>
      <div className="dp-low-signal" data-annotate-part="low-signal-note">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">Early signal, 2 people</p>
      </div>
      <p className="dp-clips-link" data-annotate-part="clips-link">View 2 clips</p>
      <div className="dp-next-study-wrap">
        <button
          type="button"
          className={["dp-next-study", downloaded ? "dp-next-study--done" : ""].join(" ")}
          data-interactive
          data-annotate-part="next-study-button"
          title="Saves both answers and follow-up questions as a Markdown file for your agent."
          aria-label="Add to my plan. Saves both answers and follow-up questions as a Markdown file for your agent."
          onClick={onDownload}
        >
          {downloaded ? (
            <CheckIcon key="check" className="dp-next-study__icon dp-animate-in" />
          ) : (
            <ArrowDownIcon key="down" className="dp-next-study__icon" />
          )}
          {downloaded ? "Downloaded study-plan.md" : "Add to my plan"}
        </button>
        <p key={downloaded ? "done" : "idle"} className={["dp-next-study__hint", downloaded ? "dp-animate-in" : ""].join(" ")} role="status" data-annotate-part="next-study-hint">
          {downloaded
            ? "Downloaded study-plan.md"
            : "Saves both answers and follow-up questions as a Markdown file for your agent."}
        </p>
      </div>
    </StudyChatShell>
  );
}
