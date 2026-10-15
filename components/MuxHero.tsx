"use client";

import MuxMediaSlot from "@/components/MuxMediaSlot";

/** Case-study hero Mux — sized by the video, never entrance-animated. */
export default function MuxHero({
  playbackId,
  posterWidth,
  posterHeight,
}: {
  playbackId: string;
  posterWidth?: number;
  posterHeight?: number;
}) {
  if (!playbackId) return null;
  return (
    <MuxMediaSlot
      playbackId={playbackId}
      posterWidth={posterWidth}
      posterHeight={posterHeight}
    />
  );
}
