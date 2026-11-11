"use client";

import JoolaProtoIframe from "./JoolaProtoIframe";
import { JOOLA_EMBED_HEIGHT, qoHeroCompactUrl } from "@/lib/joola/protoEmbed";

/** Case-study hero: Compact quick-order row (stepper only), five visible lines. */
export default function JoolaPreviewHero() {
  return (
    <JoolaProtoIframe
      figureId="quick-order-hero"
      src={qoHeroCompactUrl()}
      designWidth={1280}
      designHeight={JOOLA_EMBED_HEIGHT["quick-order-hero"]}
    />
  );
}
