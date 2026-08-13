"use client";

import MuxMediaSlot from "@/components/MuxMediaSlot";

/** Case-study hero Mux — sized by the video, never entrance-animated. */
export default function MuxHero({ playbackId }: { playbackId: string }) {
  if (!playbackId) return null;
  return <MuxMediaSlot playbackId={playbackId} />;
}
