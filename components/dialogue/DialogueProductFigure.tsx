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
  return typeof scenario === "object" ? `chart-${scenario.gallery}` : scenario;
}

/** Live study-chat panel width (t384: ~447.78px → 448). */
const CHAT_W = 448;
/** Callout rail 122 + gutter 48 + chat 448 */
const ANATOMY_W = 618;
/** Answer column + clip drawer cluster */
const FULL_ANSWER_W = 688;
/** Below 480px: crop instead of shrinking past this (12px labels stay >= 11px). */
const PHONE_MIN_SCALE = Math.max(0.85, 11 / 12);
const DESKTOP_MIN_SCALE = 0.94;

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
  fit?: "scale" | "reflow";
  fade?: boolean;
} | null {
  const minScale = phone ? PHONE_MIN_SCALE : DESKTOP_MIN_SCALE;
  if (typeof scenario === "object" && "gallery" in scenario) {
    return { innerWidth: CHAT_W, fit: "reflow" };
  }
  if (phone) {
    switch (scenario) {
      case "anatomy":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 592, fade: true };
      case "hero":
        return { innerWidth: CHAT_W, fit: "reflow" };
      case "clip-player":
        return { innerWidth: CHAT_W, fit: "reflow" };
      case "full-answer":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 600, fade: true };
      case "problem-paragraphs":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 652, fade: true };
      default:
        return { innerWidth: CHAT_W, fit: "reflow" };
    }
  }
  switch (scenario) {
    case "hero":
      return narrow
        ? { innerWidth: CHAT_W, fit: "reflow" }
        : { innerWidth: 750, minScale: 0.8, maxScale: 1 };
    case "anatomy":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1, maxOuterHeight: 440 }
        : { innerWidth: ANATOMY_W, minScale: DESKTOP_MIN_SCALE, maxScale: 1 };
    case "full-answer":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1 }
        : { innerWidth: FULL_ANSWER_W, minScale: DESKTOP_MIN_SCALE, maxScale: 1 };
    case "clip-player":
      return { innerWidth: 312, minScale, maxScale: 1 };
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
            fit={scale.fit}
            fade={zoomed ? false : scale.fade}
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
    <div className="dp-zoom">
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
