"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDialKit, useDialKitController } from "dialkit";
import { isVariantId, VARIANTS, VariantStage, type Copy, type VariantId } from "./stages";

const LAB_Z = 50;

const DEFAULT_COPY: Copy = {
  heading: "hello hello, i'm mudit",
  dek: "placeholder dek — swap this. judge how a subtitle settles under the title.",
  body: "Placeholder body, long enough to read as a paragraph. This lab is for page-enter motion: opacity + translate, compositor-only. Cycle variants, drag DialKit, hit Replay. Production still refuses scale on type (Mux letterboxes; glyphs glitch).",
  items: [
    "opacity floors at 0.4 — a skipped tween cannot hide copy",
    "translateY settle, not scale — keep that unless you open Combo → experimental",
    "stagger is capped by maxSpread so long lists don't take forever",
    "Replay (R / Space) after you drag. Auto-replay is on by default.",
  ],
};

export default function MotionLabClient() {
  const [replayKey, setReplayKey] = useState(0);
  const replay = useCallback(() => setReplayKey((n) => n + 1), []);

  const copyDk = useDialKit(
    "Copy",
    {
      heading: DEFAULT_COPY.heading,
      dek: DEFAULT_COPY.dek,
      body: { type: "text", default: DEFAULT_COPY.body, placeholder: "Body paragraph…" },
      item1: DEFAULT_COPY.items[0],
      item2: DEFAULT_COPY.items[1],
      item3: DEFAULT_COPY.items[2],
      item4: DEFAULT_COPY.items[3],
    },
    { id: "motion-lab-copy" },
  );

  const copy: Copy = {
    heading: copyDk.heading,
    dek: copyDk.dek,
    body: copyDk.body,
    items: [copyDk.item1, copyDk.item2, copyDk.item3, copyDk.item4],
  };

  const labRef = useRef<ReturnType<typeof useDialKitController> | null>(null);
  const lab = useDialKitController(
    "Motion Lab",
    {
      variant: {
        type: "select",
        options: VARIANTS.map((v) => ({ value: v.id, label: v.label })),
        default: "opacity-only",
      },
      autoReplay: true,
      twoColumn: false,
      prev: { type: "action", label: "← Prev" },
      next: { type: "action", label: "Next →" },
      replay: { type: "action", label: "Replay" },
    },
    {
      id: "motion-lab",
      onAction: (path) => {
        if (path === "replay") replay();
        if (path === "prev" || path === "next") {
          const ctl = labRef.current;
          if (!ctl) return;
          const current = ctl.getValues().variant;
          const idx = Math.max(
            0,
            VARIANTS.findIndex((v) => v.id === current),
          );
          const next =
            path === "next"
              ? VARIANTS[(idx + 1) % VARIANTS.length]
              : VARIANTS[(idx - 1 + VARIANTS.length) % VARIANTS.length];
          ctl.setValue("variant", next.id);
          replay();
        }
      },
    },
  );
  useEffect(() => {
    labRef.current = lab;
  }, [lab]);

  const variantId: VariantId = isVariantId(lab.values.variant)
    ? lab.values.variant
    : "opacity-only";
  const variantMeta = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];
  const variantIndex = VARIANTS.findIndex((v) => v.id === variantId);

  const cycle = useCallback(
    (dir: 1 | -1) => {
      const next = VARIANTS[(variantIndex + dir + VARIANTS.length) % VARIANTS.length];
      lab.setValue("variant", next.id);
      replay();
    },
    [lab, replay, variantIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        cycle(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycle(-1);
      } else if (e.key === " " || e.key === "r" || e.key === "R") {
        e.preventDefault();
        replay();
      } else if (/^[1-8]$/.test(e.key)) {
        const next = VARIANTS[Number(e.key) - 1];
        if (next) {
          lab.setValue("variant", next.id);
          replay();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle, lab, replay]);

  return (
    <>
      <style>{`
        .dialkit-panel,
        .dialkit-select-dropdown,
        .dialkit-preset-dropdown,
        .dialkit-shortcuts-dropdown {
          z-index: 10050 !important;
        }
        .ml-enter {
          opacity: 1;
          translate: 0 0;
          filter: blur(0px);
          animation-name: ml-enter;
          animation-fill-mode: backwards;
        }
        @keyframes ml-enter {
          from {
            opacity: var(--ml-from-opacity, 0.4);
            translate: var(--ml-from-x, 0px) var(--ml-from-y, 12px);
            filter: blur(var(--ml-from-blur, 0px));
            transform: scale(var(--ml-from-scale, 1));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ml-enter { animation: none !important; }
        }
        .ml-btn {
          appearance: none;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          color: var(--color-text-primary);
          font: inherit;
          font-size: 12px;
          letter-spacing: 0.04em;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          min-height: 44px;
        }
        .ml-btn:hover {
          background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: LAB_Z,
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
          overflow: "auto",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            background: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.45,
                marginBottom: 2,
              }}
            >
              Motion lab · {variantIndex + 1} / {VARIANTS.length}
            </div>
            <div style={{ fontSize: 15, letterSpacing: "-0.02em" }}>{variantMeta.label}</div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{variantMeta.hint}</div>
          </div>
          <button type="button" className="ml-btn" onClick={() => cycle(-1)} aria-label="Previous variant">
            ←
          </button>
          <button type="button" className="ml-btn" onClick={() => cycle(1)} aria-label="Next variant">
            →
          </button>
          <button type="button" className="ml-btn" onClick={replay}>
            Replay
          </button>
        </div>

        <div style={{ padding: "48px 24px 120px", paddingInline: "var(--page-px, 24px)" }}>
          <VariantStage
            key={variantId}
            id={variantId}
            copy={copy}
            replayKey={replayKey}
            autoReplay={lab.values.autoReplay}
            twoColumn={lab.values.twoColumn}
          />
        </div>

        <div
          style={{
            position: "fixed",
            left: 20,
            bottom: 20,
            maxWidth: 320,
            padding: "10px 12px",
            borderRadius: 6,
            background: "color-mix(in srgb, var(--color-bg) 72%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
            fontSize: 12,
            lineHeight: 1.45,
            opacity: 0.75,
            zIndex: 2,
          }}
        >
          <div style={{ opacity: 0.5, marginBottom: 6, letterSpacing: "0.04em", fontSize: 11 }}>
            ← → cycle · R / Space replay · 1–8 jump
          </div>
          <p style={{ margin: "0 0 8px" }}>
            Each variant mounts its own DialKit panel. Copy and layout live in{" "}
            <strong style={{ fontWeight: 500 }}>Copy</strong> /{" "}
            <strong style={{ fontWeight: 500 }}>Motion Lab</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
            <Link href="/" style={{ color: "inherit" }}>
              ← work
            </Link>
            <Link href="/about" style={{ color: "inherit" }}>
              about
            </Link>
            <Link href="/archive" style={{ color: "inherit" }}>
              archive
            </Link>
            <Link href="/dev/ps3-wave-lab" style={{ color: "inherit" }}>
              wave lab
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
