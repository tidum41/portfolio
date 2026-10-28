"use client";

import { useEffect, useRef, useState } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CheckIcon, CopyIcon, InfoCircleIcon } from "@/components/dialogue/product/icons";

const NEXT_STUDY_PROMPT = [
  "Plan the next study on lapsed buyers.",
  "In the last study, 2 of 63 lapsed buyers mentioned a damaged first order. The count is small, so treat it as a lead.",
  "Recruit more lapsed buyers and ask each about their first order.",
  "Report how many mention it and quote the moment they noticed.",
].join("\n\n");

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

/** f6a5192 low-signal answer: amber lead warning, clip link, plan action, evidence footer. */
export default function ThinDataFigure() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onCopy = async () => {
    const ok = await copyText(NEXT_STUDY_PROMPT);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 4000);
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
          className={["dp-next-study", copied ? "dp-next-study--done" : ""].join(" ")}
          data-interactive
          data-annotate-part="next-study-button"
          title="Copies a prompt to paste into Ask about your study."
          aria-label="Add to my plan. Copies a prompt to paste into Ask about your study."
          onClick={onCopy}
        >
          {/* Dialogue's own enter (tw-animate fade-in-50, 300 ms) on the swapped icon and hint. */}
          {copied ? (
            <CheckIcon key="check" className="dp-next-study__icon dp-animate-in" />
          ) : (
            <CopyIcon key="copy" className="dp-next-study__icon" />
          )}
          Add to my plan
        </button>
        <p key={copied ? "done" : "idle"} className={["dp-next-study__hint", copied ? "dp-animate-in" : ""].join(" ")} role="status" data-annotate-part="next-study-hint">
          {copied ? "Copied. Paste it into Ask about your study." : "Copies a prompt to paste into Ask about your study."}
        </p>
      </div>
    </StudyChatShell>
  );
}
