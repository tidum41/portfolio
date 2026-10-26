"use client";

import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import SourcesScaleRow from "@/components/dialogue/product/scenarios/SourcesScaleRow";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/**
 * Round N hero: a cropped study chat inside the whole product chrome. The
 * question, a one-sentence answer, and one row of source avatars. No bar
 * here; the count bar belongs to the Counts section alone.
 */
export default function DialogueHeroMoment() {
  return (
    <div
      className={`dialogue-hero-moment dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <StudyPageChrome>
        <StudyChatShell hideHeader hideComposer>
          <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
          <p className="dp-summary dp-text-body" data-annotate-part="summary">
            {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
            <span className="dp-summary__emph" data-annotate-part="summary-emphasis">
              {CHECKOUT_FUNNEL.emphasis}
            </span>
            {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
          </p>
          <SourcesScaleRow />
        </StudyChatShell>
      </StudyPageChrome>
    </div>
  );
}
