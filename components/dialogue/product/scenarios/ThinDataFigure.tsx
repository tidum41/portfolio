"use client";

import { useEffect, useRef, useState } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CheckIcon, CopyIcon, InfoCircleIcon } from "@/components/dialogue/product/icons";

const NEXT_STUDY_PROMPT = [
  "Plan the next study on mobile checkout.",
  "In the last study, 4 of 24 interviews said autofill skipped the apartment field and address validation fired late on mobile. That is a lead, not a trend.",
  "Recruit more mobile participants, ask each to complete checkout on a phone, and confirm whether the problem repeats.",
  "Report how many participants hit it and quote the moment they noticed.",
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
    <StudyChatShell compact hideHeader hideComposer evidence={4}>
      <UserMessageBubble>Why did people abandon on mobile?</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        On mobile, several participants bailed when autofill skipped the apartment field and
        validation fired late.
      </p>
      <div className="dp-low-signal" data-annotate-part="low-signal-note">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">Only 4 of 24 interviews mention this.</p>
      </div>
      <p className="dp-clips-link" data-annotate-part="clips-link">View 1 clip</p>
      <div className="dp-next-study-wrap">
        <button
          type="button"
          className="dp-next-study"
          data-interactive
          data-annotate-part="next-study-button"
          title="Copies a prompt to paste into Ask about your study."
          aria-label="Add to my plan. Copies a prompt to paste into Ask about your study."
          onClick={onCopy}
        >
          {copied ? <CheckIcon className="dp-next-study__icon" /> : <CopyIcon className="dp-next-study__icon" />}
          Add to my plan
        </button>
        <p className="dp-next-study__hint" role="status" data-annotate-part="next-study-hint">
          {copied ? "Copied. Paste it into Ask about your study." : "Copies a prompt to paste into Ask about your study."}
        </p>
      </div>
    </StudyChatShell>
  );
}
