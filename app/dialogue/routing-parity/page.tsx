"use client";

import { useState } from "react";
import { FridayBar } from "@/components/dialogue/live/AnswerCard";
import SideSample from "@/components/dialogue/product/scenarios/SideSample";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import SourcePill from "@/components/dialogue/product/SourcePill";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import CountSplitTemplate from "@/components/dialogue/routing/templates/CountSplitTemplate";
import QuoteListTemplate from "@/components/dialogue/routing/templates/QuoteListTemplate";
import ClipListTemplate from "@/components/dialogue/routing/templates/ClipListTemplate";
import { QUOTE_LIST, QUOTE_LIST_FRIDAY, CLIPS } from "@/lib/dialogue/product/sampleData";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/routing/routing-demo.css";

/**
 * Paired 448px mounts of the live Counts primitives and the routing-demo
 * templates, fed the same Hearthside numbers so Playwright can pixel-diff.
 */
const LIVE_ANSWER = {
  finding: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.",
  total: 300,
  groups: [
    {
      id: "this_friday",
      label: "Read it as this Friday",
      value: 225,
      focal: true,
      people: QUOTE_LIST_FRIDAY.map((q) => ({
        name: q.participant,
        time: q.time,
        quote: q.quote,
      })),
    },
    {
      id: "unsure",
      label: "Unsure",
      value: 75,
      focal: false,
      people: QUOTE_LIST.map((q) => ({
        name: q.participant,
        time: q.time,
        quote: q.quote,
      })),
    },
  ],
};

const DEMO_COUNT = {
  finding: LIVE_ANSWER.finding,
  total: LIVE_ANSWER.total,
  groups: LIVE_ANSWER.groups,
};

const DEMO_QUOTES = {
  finding: "2 of 24 shoppers mentioned the Friday label.",
  quotes: QUOTE_LIST.map((q) => ({
    name: q.participant,
    time: q.time,
    quote: q.quote,
  })),
};

const DEMO_CLIPS = {
  finding: "2 clips about the Friday label.",
  clips: (CLIPS.length >= 2 ? CLIPS : [...CLIPS, {
    id: "friday-2",
    participant: "Owen",
    segment: "07:12\u201307:30",
    transcript: "I checked the date to be sure.",
    highlight: "checked the date",
  }]).slice(0, 2).map((c) => ({
    name: c.participant,
    time: c.segment,
    quote: c.transcript,
    start: c.segment.split(/[\u2013-]/)[0],
    end: c.segment.split(/[\u2013-]/)[1] ?? c.segment.split(/[\u2013-]/)[0],
  })),
};

function Panel({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="dlg-route-shot" data-parity={id}>
      <p className="dlg-route-shot__label">{label}</p>
      <div className="dlg-route-shot__panel" style={{ width: 448 }}>
        <div className={["dialogue-product-root", "dp-chat-panel-typography", dialogueProductFontClassName].join(" ")}>
          {children}
        </div>
      </div>
    </section>
  );
}

function LiveCountMount({ sideOpen }: { sideOpen: false | "friday" | "unsure" }) {
  const [side, setSide] = useState<false | "friday" | "unsure">(sideOpen);
  return (
    <StudyChatShell compact hideHeader hideComposer>
      <UserMessageBubble>How do shoppers read &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
      <FridayBar
        still
        sideOpen={side}
        onSide={(w) => setSide((s) => (s === w ? false : w))}
        answer={{
          finding: LIVE_ANSWER.finding,
          total: LIVE_ANSWER.total,
          groups: LIVE_ANSWER.groups.map(({ label, value, focal }) => ({ label, value, focal })),
        }}
      />
      {side ? (
        <SideSample
          label={side === "friday" ? "read it as this Friday" : "unsure"}
          total={side === "friday" ? 225 : 75}
          quotes={side === "friday" ? QUOTE_LIST_FRIDAY : QUOTE_LIST}
          selectedParticipant={
            (side === "friday" ? QUOTE_LIST_FRIDAY : QUOTE_LIST)[0]?.participant ?? null
          }
          onSelectQuote={() => {}}
        />
      ) : (
        <p className="dlg-route-side__hint">Tap a side of the bar to see those people.</p>
      )}
    </StudyChatShell>
  );
}

export default function RoutingParityPage() {
  return (
    <main className="dialogue-product-root" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 48 }}>
      <Panel id="live-count-closed" label="Live Counts — bar closed">
        <LiveCountMount sideOpen={false} />
      </Panel>
      <Panel id="demo-count-closed" label="Demo count_split — bar closed">
        <StudyChatShell compact hideHeader hideComposer>
          <UserMessageBubble>How do shoppers read &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
          <CountSplitTemplate data={DEMO_COUNT} />
        </StudyChatShell>
      </Panel>

      <Panel id="live-count-open" label="Live Counts — Friday side open">
        <LiveCountMount sideOpen="friday" />
      </Panel>
      <Panel id="demo-count-open" label="Demo count_split — Friday side open">
        <StudyChatShell compact hideHeader hideComposer>
          <UserMessageBubble>How do shoppers read &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
          <CountSplitTemplate data={DEMO_COUNT} initialSide="this_friday" />
        </StudyChatShell>
      </Panel>

      <Panel id="live-quotes" label="Live QuoteListFigure">
        <StudyChatShell compact hideHeader hideComposer>
          <QuoteListFigure focus="answer" quotes={QUOTE_LIST} />
        </StudyChatShell>
      </Panel>
      <Panel id="demo-quotes" label="Demo quote_list">
        <StudyChatShell compact hideHeader hideComposer>
          <QuoteListTemplate data={DEMO_QUOTES} />
        </StudyChatShell>
      </Panel>

      <Panel id="live-clips" label="Live ClipQuotes">
        <StudyChatShell compact hideHeader hideComposer>
          <ClipQuotes
            clips={DEMO_CLIPS.clips.map((c, i) => ({
              id: `${c.name}-${i}`,
              participant: c.name,
              segment: c.time,
              transcript: c.quote,
            }))}
            selectedParticipant={DEMO_CLIPS.clips[0]?.name ?? null}
            onSelect={() => {}}
          />
        </StudyChatShell>
      </Panel>
      <Panel id="demo-clips" label="Demo clip_list">
        <StudyChatShell compact hideHeader hideComposer>
          <ClipListTemplate data={DEMO_CLIPS} initialPlaying={DEMO_CLIPS.clips[0]?.name ?? null} />
        </StudyChatShell>
      </Panel>
    </main>
  );
}
