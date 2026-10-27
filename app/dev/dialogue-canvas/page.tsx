import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DialogueCanvas from "@/components/dev/canvas/DialogueCanvas";
import { buildLiveManifest } from "@/components/dev/canvas/liveManifest";

export const metadata: Metadata = {
  title: "Dialogue canvas",
  robots: { index: false, follow: false },
};

// The gate is evaluated per request, not baked in at build time, so a
// production deployment 404s even though the route exists in the bundle.
export const dynamic = "force-dynamic";

/**
 * Component canvas for the Dialogue case study. Mounted only outside
 * production, with the same gate AgentationSlot uses (NEXT_PUBLIC_VERCEL_ENV),
 * plus the server-side VERCEL_ENV spelling.
 */
export default function DialogueCanvasPage() {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    notFound();
  }
  // Discovered per request from the case study's import graph, so the canvas
  // tracks added and removed components without a registry edit.
  return <DialogueCanvas manifest={buildLiveManifest()} />;
}
