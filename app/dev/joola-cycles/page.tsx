"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDialKit } from "dialkit";
import DecisionCycle from "@/components/joola/DecisionCycle";
import ProtoChrome from "@/app/dev/joola-b2b/ProtoChrome";
import { JOOLA_CYCLES } from "@/lib/caseStudies/joolaCycles";

/**
 * Local authoring lab for the JOOLA design-cycle playground.
 * DialKit "Cycle" panel + DecisionCycle (Emil-style lab chrome via CSS).
 */
export default function JoolaCyclesLabPage() {
  const [copied, setCopied] = useState(false);

  const cycle = useDialKit(
    "Cycle",
    {
      decision: {
        type: "select",
        options: JOOLA_CYCLES.map((d) => ({ value: d.slug, label: d.title })),
        default: JOOLA_CYCLES[0].slug,
      },
      version: {
        type: "select",
        options: JOOLA_CYCLES[0].rounds.map((r) => ({
          value: String(r.v),
          label: `v${r.v}`,
        })),
        default: String(JOOLA_CYCLES[0].rounds[0].v),
      },
      verdict: {
        type: "select",
        options: [
          { value: "kept", label: "Thumbs up (kept)" },
          { value: "dropped", label: "Thumbs down (dropped)" },
        ],
        default: "kept",
      },
      note: {
        type: "text",
        default: JOOLA_CYCLES[0].rounds[0].note,
        placeholder: "Round note…",
      },
      copy: { type: "action", label: "Copy JSON" },
    },
    {
      id: "joola-cycles",
      onAction: (path) => {
        if (path === "copy") {
          // Handled below via effect on a bump — DialKit actions fire here.
          const payload = {
            decision: (cycle as { values?: Record<string, string> })?.values?.decision,
          };
          void payload;
        }
      },
    },
  );

  const decisionSlug = String(cycle.decision ?? JOOLA_CYCLES[0].slug);
  const decision = useMemo(
    () => JOOLA_CYCLES.find((d) => d.slug === decisionSlug) ?? JOOLA_CYCLES[0],
    [decisionSlug],
  );

  // Keep version options in sync when decision changes — DialKit select is static,
  // so we mirror into the URL that DecisionCycle already owns.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("decision", decision.slug);
    const v = String(cycle.version ?? decision.rounds[0].v);
    const exists = decision.rounds.some((r) => String(r.v) === v);
    params.set("v", exists ? v : String(decision.rounds[0].v));
    const next = `${window.location.pathname}?${params.toString()}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [cycle.version, decision]);

  const copyJson = useCallback(async () => {
    const round =
      decision.rounds.find((r) => String(r.v) === String(cycle.version)) ?? decision.rounds[0];
    const payload = {
      slug: decision.slug,
      v: round.v,
      verdict: cycle.verdict,
      note: cycle.note,
      changed: round.changed,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [cycle.note, cycle.verdict, cycle.version, decision]);

  // Wire Copy action: DialKit's onAction closes over stale cycle; expose a button too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && e.shiftKey) {
        e.preventDefault();
        void copyJson();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyJson]);

  return (
    <>
      <ProtoChrome />
      <main
        style={{
          minHeight: "100vh",
          padding: "48px var(--page-px, 24px) 96px",
          maxWidth: "calc(var(--content-max-w, 750px) + 48px)",
          margin: "0 auto",
          fontFamily: "var(--font-sans)",
          background: "var(--color-bg, #101214)",
          color: "var(--color-text-primary, #EDEDEC)",
        }}
      >
        <header style={{ marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted, #828282)" }}>
            /dev/joola-cycles
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 500 }}>
            JOOLA design cycles
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 14,
              color: "var(--color-text-secondary, #AEAEAE)",
              maxWidth: 520,
            }}
          >
            Local lab. DialKit Cycle panel edits verdict/note for copy-out. Same playground chrome as
            /joola: dots, arrows, and N of M (no version chips).
          </p>
          <button
            type="button"
            onClick={() => void copyJson()}
            style={{
              marginTop: 14,
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border-subtle, #333)",
              background: "var(--color-badge-bg, #1E2226)",
              color: "var(--color-text-primary, #fafafa)",
              font: "inherit",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy round JSON"}
          </button>
        </header>
        <DecisionCycle lab />
      </main>
    </>
  );
}
