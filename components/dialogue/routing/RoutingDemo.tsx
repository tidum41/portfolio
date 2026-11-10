"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import RoutingAnswer, {
  type RoutingAnswerData,
} from "@/components/dialogue/routing/RoutingAnswer";
import { PLAYGROUND_PRESETS } from "@/lib/dialogue/routing/playground";
import { EXAMPLE_STUDY } from "@/lib/dialogue/routing/sampleDataset";
import type { RoutingPath } from "@/lib/dialogue/routing/schema";
import type { RoutingTemplate } from "@/lib/dialogue/routing/constants";
import "@/components/dialogue/routing/routing-demo.css";

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
  routingLine: string;
  path: RoutingPath;
  data: RoutingAnswerData;
  study: typeof EXAMPLE_STUDY;
  explain: Explain;
};

type Turn =
  | { kind: "user"; text: string }
  | { kind: "loading"; text: string }
  | { kind: "answer"; text: string; result: ApiOk }
  | { kind: "error"; text: string; message: string };

function PlusGlyph() {
  return (
    <svg className="dlg-thin__chip-plus" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Playground r2 option A: fixed study chat, preset chips, routing line on the container well.
 */
export default function RoutingDemo() {
  const inputId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [routingLine, setRoutingLine] = useState<string | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [lastExplain, setLastExplain] = useState<Explain | null>(null);

  const scrollChatToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [turns, scrollChatToBottom]);

  const reset = () => {
    setTurns([]);
    setText("");
    setRoutingLine(null);
    setShowExplain(false);
    setLastExplain(null);
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || pending) return;
    setText("");
    setShowExplain(false);
    setPending(true);
    setTurns((t) => [...t, { kind: "user", text: q }, { kind: "loading", text: q }]);
    try {
      const res = await fetch("/api/dialogue/route", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(`Route failed (${res.status})`);
      const json = (await res.json()) as ApiOk;
      setRoutingLine(json.routingLine);
      setLastExplain(json.explain);
      setTurns((t) => {
        const withoutLoading = t.filter((x) => x.kind !== "loading");
        return [...withoutLoading, { kind: "answer", text: q, result: json }];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Route failed";
      setTurns((t) => {
        const withoutLoading = t.filter((x) => x.kind !== "loading");
        return [...withoutLoading, { kind: "error", text: q, message }];
      });
    } finally {
      setPending(false);
    }
  };

  const composer = (
    <form
      className="dp-study-chat__composer dlg-route-playground__composer"
      onSubmit={(e) => {
        e.preventDefault();
        void ask(text);
      }}
    >
      <div className="dp-study-chat__composer-box dlg-route-playground__composer-box">
        <label className="dlg-route-demo__label" htmlFor={inputId}>
          Ask about the example study
        </label>
        <textarea
          id={inputId}
          className="dlg-route-playground__input"
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(text);
            }
          }}
          onPaste={() => {
            requestAnimationFrame(() => {
              const el = document.getElementById(inputId) as HTMLTextAreaElement | null;
              if (el) el.scrollTop = 0;
            });
          }}
          placeholder="Ask about your study..."
          maxLength={200}
          autoComplete="off"
        />
        <button
          type="submit"
          className="dp-study-chat__composer-send dlg-route-demo__send"
          aria-label="Send question"
          disabled={pending || !text.trim()}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </form>
  );

  return (
    <div
      className={[
        "dlg-route-demo",
        "dlg-route-playground",
        "dialogue-product-root",
        "dp-chat-panel-typography",
        dialogueProductFontClassName,
      ].join(" ")}
      data-example-data=""
    >
      <div className="dlg-route-playground__meta">
        <span className="dlg-route-demo__badge">{EXAMPLE_STUDY.label}</span>
        <span className="dlg-route-demo__meta-text">
          Illustrative Hearthside counts from the case study, {EXAMPLE_STUDY.participantCount} shoppers.
        </span>
      </div>

      <div className="dlg-route-playground__well" data-annotate-part="playground-well">
        <div className="dlg-route-playground__chrome" data-annotate-part="playground-chrome">
          <button
            type="button"
            className="dlg-route-playground__reset dlg-live__reset"
            onClick={reset}
            disabled={pending}
          >
            Reset chat
          </button>
        </div>

        <div className="dlg-route-playground__panel">
          <StudyChatShell scrollRef={scrollRef} composerSlot={composer}>
            {turns.length === 0 ? (
              <p className="dlg-route-playground__idle">Ask a question about the example study.</p>
            ) : null}
            {turns.map((turn, i) => {
              if (turn.kind === "user") {
                return <UserMessageBubble key={`u-${i}`}>{turn.text}</UserMessageBubble>;
              }
              if (turn.kind === "loading") {
                return (
                  <p key={`l-${i}`} className="dlg-route-demo__status" role="status">
                    Matching a template…
                  </p>
                );
              }
              if (turn.kind === "error") {
                return (
                  <p key={`e-${i}`} className="dlg-route-demo__status" role="alert">
                    {turn.message}
                  </p>
                );
              }
              return (
                <div key={`a-${i}`} className="dlg-route-playground__answer">
                  <RoutingAnswer
                    template={turn.result.template}
                    data={turn.result.data}
                    onAsk={(q) => void ask(q)}
                  />
                </div>
              );
            })}
          </StudyChatShell>
        </div>
      </div>

      <div className="dlg-route-playground__suggestions">
        {PLAYGROUND_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            className="dlg-suggest dlg-route-playground__preset"
            disabled={pending}
            onClick={() => void ask(s)}
          >
            <PlusGlyph />
            <span>{s}</span>
          </button>
        ))}
      </div>

      {routingLine ? (
        <p className="dlg-route-playground__routing" role="status">
          {routingLine}
        </p>
      ) : null}

      {lastExplain ? (
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
                <dd>{lastExplain.queryType}</dd>
                <dt>Data available</dt>
                <dd>{lastExplain.dataAvailable}</dd>
                <dt>Study goal</dt>
                <dd>{lastExplain.goal}</dd>
                <dt>Template</dt>
                <dd>{lastExplain.template}</dd>
              </dl>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
