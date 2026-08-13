"use client";

import MuxMediaSlot from "@/components/MuxMediaSlot";

/** Case-study hero Mux — layout and poster/video crossfade live in MuxMediaSlot. */
export default function MuxHero({
  playbackId,
  aspectRatio,
}: {
  playbackId: string;
  aspectRatio?: string;
}) {
  if (!playbackId) return null;
  return <MuxMediaSlot playbackId={playbackId} aspectRatio={aspectRatio} />;
}
