"use client";

import JoolaProtoIframe from "./JoolaProtoIframe";
import { JOOLA_EMBED_HEIGHT, JOOLA_FIGURE_URLS } from "@/lib/joola/protoEmbed";

/** Case-study hero: live quick-order portal (Dick's) in preview mode. */
export default function JoolaPreviewHero() {
  return (
    <JoolaProtoIframe
      figureId="quick-order-hero"
      src={JOOLA_FIGURE_URLS["quick-order-portal"]}
      designWidth={1280}
      designHeight={JOOLA_EMBED_HEIGHT["quick-order-portal"]}
    />
  );
}
