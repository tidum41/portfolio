"use client";

import { useEffect, useId, useState } from "react";
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

type Explain = {
  queryType: string;
  dataAvailable: string;
  goal: string;
  template: string;
};

type ApiOk = {
  question: string;
  template: RoutingTemplate;
  reason: string;
  path: RoutingPath;
  data: RoutingAnswerData;
  study: typeof EXAMPLE_STUDY;
  explain: Explain;
};

type State =
  | { kind: "idle" }
  | { kind: "loading"; question: string }
  | { kind: "routing"; question: string; result: ApiOk }
  | { kind: "ready"; question: string; result: ApiOk }
  | { kind: "error"; question: string; message: string };

const IDLE_PREVIEW = resolveCountSplit("friday_reading");
const STREAM_CHARS_PER_SEC = 137;

/**
 * Live generative-UI routing demo for the Dialogue case study.
 * Built after the engagement, on example data. Mudit-approved.
 */
export default function RoutingDemo() {
  const inputId = useId();
  const [text, setText] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [showExplain, setShowExplain] = useState(false);
  const [reasonShown, setReasonShown] = useState("");
  const [cardOn, setCardOn] = useState(true);
  const pending = state.kind === "loading" || state.kind === "routing";

  useEffect(() => {
    if (state.kind !== "routing") return;
    const reason = state.result.reason.replaceAll("\u2014", ", ").replaceAll("\u2013", "-");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReasonShown(reason);
      setCardOn(true);
      setState({ kind: "ready", question: state.question, result: state.result });
      return;
    }
    setCardOn(false);
    setReasonShown("");
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(reason.length, Math.floor(((now - start) / 1000) * STREAM_CHARS_PER_SEC));
      setReasonShown(reason.slice(0, n));
      if (n < reason.length) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setCardOn(true);
      setState((current) =>
        current.kind === "routing"
          ? { kind: "ready", question: current.question, result: current.result }
          : current,
      );
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    setText("");
    setCardOn(false);
    setReasonShown("");
    setShowExplain(false);
    setState({ kind: "loading", question: q });
    try {
      const res = await fetch("/api/dialogue/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(`Route failed (${res.status})`);
      const json = (await res.json()) as ApiOk;
      setState({ kind: "routing", question: q, result: json });
    } catch (err) {
      setState({
        kind: "error",
        question: q,
        message: err instanceof Error ? err.message : "Route failed",
      });
    }
  };

  const ready = state.kind === "ready" || state.kind === "routing" ? state.result : null;
  const pathLabel = ready
    ? ready.path === "model"
      ? "Answered by the model router"
      : "Answered by the rule router"
    : null;

  return (
    <div
      className={[
        "dlg-route-demo",
        "dialogue-product-root",
        "dp-chat-panel-typography",
        dialogueProductFontClassName,
      ].join(" ")}
      data-example-data=""
    >
      <div className="dlg-route-demo__meta">
        <span className="dlg-route-demo__badge">{EXAMPLE_STUDY.label}</span>
        <span className="dlg-route-demo__meta-text">
          Example data. Same checkout study as the case study, {EXAMPLE_STUDY.participantCount} shoppers.
        </span>
        {pathLabel ? (
          <span className="dlg-route-demo__path" data-path={ready?.path}>
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
          {state.kind !== "idle" ? (
            <UserMessageBubble>{state.question}</UserMessageBubble>
          ) : null}
          {state.kind === "loading" ? (
            <p className="dlg-route-demo__status" role="status">
              Matching a template…
            </p>
          ) : null}
          {state.kind === "routing" || state.kind === "ready" ? (
            <p className="dlg-route-demo__picked" role="status">
              {reasonShown}
            </p>
          ) : null}
          {state.kind === "ready" && cardOn ? (
            <div className="dlg-route-enter" data-answer="">
              <RoutingAnswer template={state.result.template} data={state.result.data} />
            </div>
          ) : null}
          {state.kind === "error" ? (
            <p className="dlg-route-demo__status" role="alert">
              {state.message}
            </p>
          ) : null}
        </StudyChatShell>
      </div>

      {ready ? (
        <div className="dlg-route-explain">
          <button
            type="button"
            className="dlg-route-explain__toggle"
            aria-expanded={showExplain}
            onClick={() => setShowExplain((v) => !v)}
          >
            {showExplain ? "Hide how it routed" : "How it routed"}
          </button>
          {showExplain ? (
            <div className="dlg-route-explain__panel">
              <dl>
                <dt>Query type</dt>
                <dd>{ready.explain.queryType}</dd>
                <dt>Data available</dt>
                <dd>{ready.explain.dataAvailable}</dd>
                <dt>Study goal</dt>
                <dd>{ready.explain.goal}</dd>
                <dt>Template</dt>
                <dd>{ready.explain.template}</dd>
              </dl>
            </div>
          ) : null}
        </div>
      ) : null}

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

      <div className="dlg-route-demo__chips">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="dlg-route-demo__chip"
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
