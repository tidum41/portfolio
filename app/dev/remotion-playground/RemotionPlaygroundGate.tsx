"use client";

import type { ComponentType } from "react";

/**
 * Compile-time DialKit gate — mirrors DevChrome. Production builds set
 * NEXT_PUBLIC_DIALKIT="" so webpack drops the remotion player client chunk.
 */
let Live: ComponentType = function RemotionPlaygroundUnavailable() {
  return null;
};

if (process.env.NEXT_PUBLIC_DIALKIT === "1") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Live = require("./RemotionPlaygroundClient").default;
}

export default function RemotionPlaygroundGate() {
  return <Live />;
}
