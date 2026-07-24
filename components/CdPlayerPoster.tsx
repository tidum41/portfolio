"use client";

import Image from "next/image";
import { useState } from "react";

/** Static grid-tile stand-in while the live CDPlayer is portaled into the modal. */
export default function CdPlayerPoster() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div style={{ width: "100%", height: "100%", background: "var(--color-modal-bg)" }} />;
  }

  return (
    <Image
      src="/images/cd-player-poster.webp"
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      style={{ objectFit: "cover" }}
      onError={() => setFailed(true)}
      priority={false}
    />
  );
}
