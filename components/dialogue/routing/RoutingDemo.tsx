"use client";

import { useId, useState } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import RoutingAnswer, {
  type RoutingAnswerData,
} from "@/components/dialogue/routing/RoutingAnswer";
import {
  EXAMPLE_STUDY,
  resolveCountSplit,
} from "@/lib/dialogue/routing/sampleDataset";
import type { RoutingPath } from "@/lib/dialogue/routing/schema";
import type { RoutingTemplate } from "@/lib/dialogue/routing/constants";
import "@/components/dialogue/routing/routing-demo.css";

const SUGGESTIONS = [
  "How do shoppers read 'Arrives by Friday'?",
  "Compare address friction on mobile vs desktop",
  "Play clips about damaged packaging",
  "What did shoppers say about returns?",
] as const;

type ApiOk = {
  question: string;
  template: RoutingTemplate;
  reason: string;
  path: RoutingPath;
  data: RoutingAnswerData;
  study: typeof EXAMPLE_STUDY;
};

type State =
  | { kind: "idle" }
  | { kind: "loading"; question: string }
  | { kind: "ready"; question: string; result: ApiOk }
  | { kind: "error"; question: string; message: string };

const IDLE_PREVIEW = resolveCountSplit("friday_reading");

/**
 * Live generative-UI routing demo for the Dialogue case study.
 * Built after the engagement, on example data. Mudit-approved.
 */
export default function RoutingDemo() {
  const inputId = useId();
  const [text, setText] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const pending = state.kind === "loading";

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    setText(q);
    setState({ kind: "loading", question: q });
    try {
      const res = await fetch("/api/dialogue/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(`Route failed (${res.status})`);
      const json = (await res.json()) as ApiOk;
      setState({ kind: "ready", question: q, result: json });
    } catch (err) {
      setState({
        kind: "error",
        question: q,
        message: err instanceof Error ? err.message : "Route failed",
      });
    }
  };

  const pathLabel =
    state.kind === "ready"
      ? state.result.path === "model"
        ? "Answered by the model router"
        : "Answered by the rule router"
      : null;

  return (
    <div className={["dlg-route-demo", dialogueProductFontClassName].join(" ")} data-example-data="">
      <div className="dlg-route-demo__meta">
        <span className="dlg-route-demo__badge">{EXAMPLE_STUDY.label}</span>
        <span className="dlg-route-demo__meta-text">
          Interactive demo built after the engagement. {EXAMPLE_STUDY.participantCount}{" "}
          participants.
        </span>
        {pathLabel ? (
          <span className="dlg-route-demo__path" data-path={state.kind === "ready" ? state.result.path : undefined}>
            {pathLabel}
          </span>
        ) : null}
      </div>

      <div className="dlg-route-demo__panel">
        <StudyChatShell compact hideHeader hideComposer>
          {state.kind === "idle" ? (
            <>
              <p className="dlg-route-demo__idle">Ask a question about the example study.</p>
              <RoutingAnswer template="count_split" data={IDLE_PREVIEW} />
            </>
          ) : null}
          {state.kind === "loading" || state.kind === "ready" || state.kind === "error" ? (
            <UserMessageBubble>{state.question}</UserMessageBubble>
          ) : null}
          {state.kind === "loading" ? (
            <p className="dlg-route-demo__status" role="status">
              Matching a template…
            </p>
          ) : null}
          {state.kind === "ready" ? (
            <>
              <p className="dlg-route-demo__reason">{state.result.reason}</p>
              <RoutingAnswer template={state.result.template} data={state.result.data} />
            </>
          ) : null}
          {state.kind === "error" ? (
            <p className="dlg-route-demo__status" role="alert">
              {state.message}
            </p>
          ) : null}
        </StudyChatShell>
      </div>

      <form
        className="dlg-route-demo__composer"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <label className="dlg-route-demo__label" htmlFor={inputId}>
          Ask about the example study
        </label>
        <div className="dlg-route-demo__row">
          <input
            id={inputId}
            className="dlg-route-demo__input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about your study..."
            maxLength={200}
            autoComplete="off"
          />
          <button
            type="submit"
            className="dlg-route-demo__send"
            aria-label="Send question"
            disabled={pending || !text.trim()}
          >
            <ArrowUpIcon />
          </button>
        </div>
      </form>

      <div className="dlg-route-demo__chips" role="list">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="dlg-route-demo__chip"
            role="listitem"
            onClick={() => ask(s)}
            disabled={pending}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
