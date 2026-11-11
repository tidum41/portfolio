"use client";

import JoolaProtoIframe from "./JoolaProtoIframe";
import { JOOLA_EMBED_HEIGHT, qoHeroPresetsUrl } from "@/lib/joola/protoEmbed";

/** Case-study hero: QO presets row (pack chips), capped at five lines in the prototype. */
export default function JoolaPreviewHero() {
  return (
    <JoolaProtoIframe
      figureId="quick-order-hero"
      src={qoHeroPresetsUrl()}
      designWidth={1280}
      designHeight={JOOLA_EMBED_HEIGHT["quick-order-hero"]}
    />
  );
}
