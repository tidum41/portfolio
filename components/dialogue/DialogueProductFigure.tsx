"use client";

import { useLayoutEffect, useRef, useState } from "react";
import CaseStudyLightbox from "@/components/CaseStudyLightbox";
import DialogueProductScenario, {
  type DialogueProductScenario as Scenario,
} from "@/components/dialogue/product/DialogueProductScenario";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";

type Props = {
  scenario: Scenario;
  title: string;
  assetId?: string;
  className?: string;
  /** Overrides the figure name used in data-annotate="<figure>/<part>". */
  annotate?: string;
};

function figureName(scenario: Scenario): string {
  return scenario;
}

/** Live study-chat panel width (t384: ~447.78px → 448). */
const CHAT_W = 448;
/** Callout rail 220 + gutter 72 + chat 448. The rail holds 14px labels counter-scaled to real size. */
const ANATOMY_W = 740;
/** Answer column + clip drawer cluster. Round L widened the panels and
    raised the width so the two screens read at near full size. */
const FULL_ANSWER_W = 704;
/** Below 480px: crop instead of shrinking past this (12px labels stay >= 11px). */
const PHONE_MIN_SCALE = Math.max(0.85, 11 / 12);
const DESKTOP_MIN_SCALE = 0.94;
/** Desktop figures scale down to at most this tall, so figure plus caption fit an 844px viewport. */
const FIGURE_MAX_H = 640;
/** The anatomy figure is zoomed in a little (about 12%) so the chat reads larger. */
const ANATOMY_MAX_H = 720;

function useNarrow(query = "(max-width: 600px)") {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return narrow;
}

function usePhone(query = "(max-width: 480px)") {
  const [phone, setPhone] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return phone;
}

function scaleProps(
  scenario: Scenario,
  narrow: boolean,
  phone: boolean,
): {
  innerWidth: number;
  maxScale?: number;
  minScale?: number;
  maxOuterHeight?: number;
  maxHeight?: number;
  fit?: "scale" | "reflow";
  fade?: boolean;
} | null {
  const minScale = phone ? PHONE_MIN_SCALE : DESKTOP_MIN_SCALE;
  if (phone) {
    switch (scenario) {
      case "anatomy":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 1100, fade: true };
      case "hero":
        return { innerWidth: CHAT_W, fit: "reflow" };
      case "clip-player":
        return { innerWidth: CHAT_W, fit: "reflow" };
      case "full-answer":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 600, fade: true };
      case "problem-paragraphs":
      case "inline-clip":
      case "thin-data-slim":
      case "thin-data-prompt":
      case "counts":
        /* Round O fix: on phones the chat figures scale the 448px panel
           down to fit the column (transform scale) instead of reflowing
           taller. The clip figure caps at about 560px with the fade. */
        return scenario === "inline-clip"
          ? { innerWidth: CHAT_W, maxScale: 1, maxOuterHeight: 500, fade: true }
          : { innerWidth: CHAT_W, maxScale: 1 };
      default:
        return { innerWidth: CHAT_W, fit: "reflow" };
    }
  }
  switch (scenario) {
    case "hero":
      return narrow
        ? { innerWidth: CHAT_W, fit: "reflow" }
        : { innerWidth: 774, minScale: 0.8, maxScale: 1 };
    case "anatomy":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1, maxOuterHeight: 440 }
        : { innerWidth: ANATOMY_W, minScale: 0.84, maxScale: 1, maxHeight: ANATOMY_MAX_H };
    case "full-answer":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1 }
        : { innerWidth: FULL_ANSWER_W, minScale: 0.88, maxScale: 1, maxHeight: 1600 };
    case "clip-player":
      return narrow
        ? { innerWidth: 656, fit: "reflow" }
        : { innerWidth: 656, minScale: DESKTOP_MIN_SCALE, maxScale: 1, maxHeight: FIGURE_MAX_H };
    case "problem-paragraphs":
    case "decision-paragraphs":
    case "decision-quotes":
    case "decision-structured":
      return { innerWidth: CHAT_W, minScale, maxScale: 1 };
    default:
      return { innerWidth: CHAT_W, minScale, maxScale: 1 };
  }
}

/** In-page Dialogue product UI (no iframe). Click opens a bounded lightbox. */
export default function DialogueProductFigure({ scenario, title, assetId, className, annotate }: Props) {
  const name = annotate ?? figureName(scenario);
  const narrow = useNarrow();
  const phone = usePhone();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scale = scaleProps(scenario, narrow, phone);

  const render = (zoomed: boolean) => {
    const inner = <DialogueProductScenario scenario={scenario} className={className} />;
    const block = (
      <StaticFigure
        figure={zoomed ? `${name}-lightbox` : name}
        className="dialogue-product-block dialogue-product-block--static"
        data-dialogue-asset-id={zoomed ? undefined : assetId}
        aria-label={title}
      >
        {scale ? (
          <ScaledChatViewport
            innerWidth={scale.innerWidth}
            maxScale={zoomed && scale.fit !== "reflow" ? Math.max(scale.maxScale ?? 1, 1.2) : scale.maxScale}
            minScale={scale.minScale}
            maxOuterHeight={zoomed ? undefined : scale.maxOuterHeight}
            maxHeight={zoomed ? undefined : scale.maxHeight}
            fitViewport={zoomed}
            fit={scale.fit}
            fade={zoomed ? false : scale.fade}
            uncapOnMobile={!zoomed && (scenario === "anatomy" || scenario === "full-answer")}
          >
            {inner}
          </ScaledChatViewport>
        ) : (
          inner
        )}
      </StaticFigure>
    );
    return block;
  };

  return (
    <div
      className="dp-zoom"
      onClick={(e) => {
        if (narrow || !(e.target instanceof Element) || !e.currentTarget.contains(e.target)) return;
        if (e.target.closest("[data-interactive]") || e.target.closest(".dp-zoom__trigger")) return;
        setOpen(true);
      }}
    >
      {render(false)}
      {narrow ? null : (
      <button
        ref={triggerRef}
        type="button"
        className="dp-zoom__trigger"
        aria-label={`Enlarge figure: ${title}`}
        data-annotate={`dialogue-${name}/zoom`}
        onClick={() => setOpen(true)}
      />
      )}
      <CaseStudyLightbox
        alt={title}
        annotate={`dialogue-${name}`}
        open={open && !narrow}
        onClose={() => setOpen(false)}
        returnFocusRef={triggerRef}
      >
        {open ? render(true) : null}
      </CaseStudyLightbox>
    </div>
  );
}
