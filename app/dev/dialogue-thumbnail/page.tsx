"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DialogueThumbnailDemo from "@/components/dialogue/product/thumbnail/DialogueThumbnailDemo";
import DialogueThumbnailCard from "@/components/DialogueThumbnailCard";
import { DIALOGUE_PROJECT } from "@/lib/sanity/queries";
import {
  THUMBNAIL_VARIANTS,
  type ThumbnailVariantId,
} from "@/components/dialogue/product/thumbnail/variants";

const IDS = Object.keys(THUMBNAIL_VARIANTS) as ThumbnailVariantId[];

function DialogueThumbnailDevPage() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("variant");
  const variant: ThumbnailVariantId = IDS.includes(raw as ThumbnailVariantId) ? (raw as ThumbnailVariantId) : "product";
  const reduced = params.get("poster") === "1";
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
        Same story in each cut. The cursor opens the 75 unsure side, Mei&rsquo;s quote lands, then the 225 opens again.
        Poster is the 225 with Ana&rsquo;s quote and the Preview badge.{" "}
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
      </div>
      <p data-timing="" style={{ margin: "0 0 16px", color: "var(--color-text-muted)", fontSize: "var(--fs-caption)" }}>
        {timing.label}: rest {timing.restMs}ms, move {timing.moveMs}ms, hover {timing.hoverMs}ms, press {timing.pressMs}ms, hold {timing.payoffMs}ms.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <div data-demo-frame={variant}>
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 3",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "var(--color-placeholder)",
            }}
          >
            <DialogueThumbnailDemo variant={variant} playing={!reduced} showPreview />
          </div>
        </div>
        <div data-card-frame={variant}>
          <DialogueThumbnailCard
            title={DIALOGUE_PROJECT.title}
            label={DIALOGUE_PROJECT.label}
            variant={variant}
            active
            playing={!reduced}
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
