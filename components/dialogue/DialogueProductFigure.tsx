"use client";

import { useLayoutEffect, useState } from "react";
import DialogueProductScenario, {
  type DialogueProductScenario as Scenario,
} from "@/components/dialogue/product/DialogueProductScenario";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";

type Props = {
  scenario: Scenario;
  title: string;
  assetId?: string;
  className?: string;
};

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
  if (scenario === "placement-docked" || scenario === "placement-bubble") return null;
  if (typeof scenario === "object" && "gallery" in scenario) {
    return { innerWidth: CHAT_W, fit: "reflow" };
  }
  if (phone) {
    switch (scenario) {
      case "anatomy":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 592, fade: true };
      case "hero":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 520, fade: true };
      case "clip-player":
        return { innerWidth: CHAT_W, fit: "reflow", maxOuterHeight: 440, fade: true };
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
        ? { innerWidth: CHAT_W, minScale, maxScale: 1, maxOuterHeight: 520 }
        : {
            innerWidth: 640,
            minScale: DESKTOP_MIN_SCALE,
            maxScale: 1,
            maxOuterHeight: 500,
          };
    case "anatomy":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1, maxOuterHeight: 440 }
        : { innerWidth: ANATOMY_W, minScale: DESKTOP_MIN_SCALE, maxScale: 1 };
    case "full-answer":
      return narrow
        ? { innerWidth: CHAT_W, minScale, maxScale: 1 }
        : { innerWidth: FULL_ANSWER_W, minScale: DESKTOP_MIN_SCALE, maxScale: 1 };
    case "clip-player":
    case "problem-paragraphs":
    case "decision-paragraphs":
    case "decision-quotes":
    case "decision-structured":
      return { innerWidth: CHAT_W, minScale, maxScale: 1 };
    default:
      return { innerWidth: CHAT_W, minScale, maxScale: 1 };
  }
}

/** In-page Dialogue product UI (no iframe). */
export default function DialogueProductFigure({ scenario, title, assetId, className }: Props) {
  const narrow = useNarrow();
  const phone = usePhone();
  const scale = scaleProps(scenario, narrow, phone);
  const inner = <DialogueProductScenario scenario={scenario} className={className} />;

  return (
    <div
      className="dialogue-product-block dialogue-product-block--static"
      data-dialogue-asset-id={assetId}
      aria-label={title}
      aria-hidden
      inert
    >
      {scale ? (
        <ScaledChatViewport
          innerWidth={scale.innerWidth}
          maxScale={scale.maxScale}
          minScale={scale.minScale}
          maxOuterHeight={scale.maxOuterHeight}
          fit={scale.fit}
          fade={scale.fade}
        >
          {inner}
        </ScaledChatViewport>
      ) : (
        inner
      )}
    </div>
  );
}
