"use client";

import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuoteCard from "@/components/dialogue/product/QuoteCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { CLIPS, COVERAGE_ADDRESS } from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/**
 * Round O hero: the real study chat answer. The count is text ("18 of 24
 * interviews"), with one grey quote card under it. No bar.
 */
export default function DialogueHeroMoment() {
  return (
    <div
      className={`dialogue-hero-moment dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <StudyChatShell>
        <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
        <p className="dp-summary dp-text-body" data-annotate-part="summary">
          {COVERAGE_ADDRESS.headline}
        </p>
        <QuoteCard
          name={CLIPS[0].participant}
          time="14:03"
          text={CLIPS[0].transcript}
        />
      </StudyChatShell>
    </div>
  );
}
