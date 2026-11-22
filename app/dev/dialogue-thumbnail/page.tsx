"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DialogueThumbnailDemo from "@/components/dialogue/product/thumbnail/DialogueThumbnailDemo";
import DialogueThumbnailCard from "@/components/DialogueThumbnailCard";
import { DIALOGUE_PROJECT } from "@/lib/sanity/queries";
import {
  THUMBNAIL_SEL_MOTIONS,
  THUMBNAIL_VARIANTS,
  thumbnailLoopDuration,
  type ThumbnailSelMotion,
  type ThumbnailVariantId,
} from "@/components/dialogue/product/thumbnail/variants";

const IDS = Object.keys(THUMBNAIL_VARIANTS) as ThumbnailVariantId[];

/** Dev recorder hook (scripts/record-thumbnail-loop.mjs), present only with ?t=. */
type SeekWindow = Window & { __dlgThumbSeek?: (ms: number) => Promise<void> };

function DialogueThumbnailDevPage() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("variant");
  const variant: ThumbnailVariantId = IDS.includes(raw as ThumbnailVariantId) ? (raw as ThumbnailVariantId) : "product";
  const reduced = params.get("poster") === "1";
  const rawSel = params.get("sel");
  const selMotion: ThumbnailSelMotion = THUMBNAIL_SEL_MOTIONS.includes(rawSel as ThumbnailSelMotion)
    ? (rawSel as ThumbnailSelMotion)
    : "cut";
  /* ?t=<ms> renders the demo frame in scrub mode at that loop time; the
     recorder then steps it through window.__dlgThumbSeek without reloads. */
  const rawT = params.get("t");
  const urlT = rawT != null && rawT !== "" && Number.isFinite(Number(rawT)) ? Number(rawT) : null;
  const [seekT, setSeekT] = useState<number | null>(null);
  const scrubT = urlT == null ? null : (seekT ?? urlT);
  const scrubOn = urlT != null;
  useEffect(() => {
    if (!scrubOn) return;
    const w = window as SeekWindow;
    w.__dlgThumbSeek = (ms: number) =>
      new Promise<void>((resolve) => {
        setSeekT(ms);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    return () => {
      delete w.__dlgThumbSeek;
    };
  }, [scrubOn]);
  /* One clock for both previews: they share this epoch, so each loop of
     the demo frame and the card frame starts on the same tick. */
  const [loopEpoch] = useState(() => performance.now());
  const setSel = (m: ThumbnailSelMotion) => {
    const next = new URLSearchParams(params.toString());
    if (m === "cut") next.delete("sel");
    else next.set("sel", m);
    router.replace(`?${next.toString()}`);
  };
  const setVariant = (id: ThumbnailVariantId) => {
    const next = new URLSearchParams(params.toString());
    next.set("variant", id);
    router.replace(`?${next.toString()}`);
  };
  const setReduced = (on: boolean) => {
    const next = new URLSearchParams(params.toString());
    if (on) next.set("poster", "1");
    else next.delete("poster");
    router.replace(`?${next.toString()}`);
  };
  const timing = useMemo(() => THUMBNAIL_VARIANTS[variant], [variant]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", fontFamily: "var(--font-sans)" }}>
      <p style={{ margin: "0 0 8px", color: "var(--color-text-muted)", fontSize: "var(--fs-caption)" }}>
        Dev only. Dialogue homepage card timings.
      </p>
      <h1 style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 500 }}>Thumbnail demo variants</h1>
      <p style={{ margin: "0 0 24px", maxWidth: 640, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
        Same story in each cut. The loop opens on the bar with nothing selected. The cursor opens the 75 unsure
        side and Owen&rsquo;s quote lands, then it opens the 225 and Dev&rsquo;s quote lands. Poster is the bar with
        nothing selected and the Preview badge. The card frame always shows the shipped selection cut.{" "}
        {variant === "lift-explore" ? (
          <strong>Lift marker (exploration): dev-only bar motion, not used on the homepage card.</strong>
        ) : null}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {IDS.map((id) => (
          <button
            key={id}
            type="button"
            data-variant-btn={id}
            aria-pressed={variant === id}
            onClick={() => setVariant(id)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid var(--color-border-subtle)",
              background: variant === id ? "var(--color-text-primary)" : "var(--color-bg)",
              color: variant === id ? "var(--color-bg)" : "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {THUMBNAIL_VARIANTS[id].label}
          </button>
        ))}
        <button
          type="button"
          data-reduced-btn=""
          aria-pressed={reduced}
          onClick={() => setReduced(!reduced)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid var(--color-border-subtle)",
            background: reduced ? "var(--color-text-primary)" : "var(--color-bg)",
            color: reduced ? "var(--color-bg)" : "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          Poster only
        </button>
        <button
          type="button"
          data-sel-btn=""
          aria-pressed={selMotion === "travel"}
          onClick={() => setSel(selMotion === "travel" ? "cut" : "travel")}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid var(--color-border-subtle)",
            background: selMotion === "travel" ? "var(--color-text-primary)" : "var(--color-bg)",
            color: selMotion === "travel" ? "var(--color-bg)" : "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          Selection travels
        </button>
      </div>
      <p data-timing="" style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "var(--fs-caption)" }}>
        {timing.label}: rest {timing.restMs}ms, move {timing.moveMs}ms, hover {timing.hoverMs}ms, press {timing.pressMs}ms, hold {timing.payoffMs}ms.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <div
          data-demo-frame={variant}
          data-sel-motion={selMotion}
          data-loop-ms={thumbnailLoopDuration(timing)}
          style={{ alignSelf: "start" }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 3",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "var(--color-placeholder)",
            }}
          >
            <DialogueThumbnailDemo
              variant={variant}
              playing={!reduced}
              showPreview
              selMotion={selMotion}
              timeMs={scrubT}
              loopEpoch={loopEpoch}
            />
          </div>
        </div>
        <div data-card-frame={variant}>
          <DialogueThumbnailCard
            title={DIALOGUE_PROJECT.title}
            label={DIALOGUE_PROJECT.label}
            variant={variant}
            active
            playing={!reduced && !scrubOn}
            loopEpoch={loopEpoch}
          />
        </div>
      </div>
    </main>
  );
}

export default function DialogueThumbnailDevRoute() {
  return (
    <Suspense fallback={null}>
      <DialogueThumbnailDevPage />
    </Suspense>
  );
}
