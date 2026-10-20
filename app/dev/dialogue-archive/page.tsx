import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DialogueArchiveCanvas from "./DialogueArchiveCanvas";
import {
  ARCHIVE_LAYOUT,
  ARCHIVE_TOOLBAR_H,
  computeDialogueArchiveLayout,
  computeFitCamera,
} from "@/lib/caseStudies/computeDialogueArchiveLayout";
import type { DialogueArchiveManifest } from "@/lib/caseStudies/dialogueArchiveTypes";
import manifestJson from "@/lib/caseStudies/dialogueArchiveManifest.json";

const DEFAULT_VIEWPORT_W = 1440;
const DEFAULT_VIEWPORT_H = 900;

export const metadata: Metadata = {
  title: "Dialogue archive",
  robots: { index: false, follow: false },
};

/** Avoid build-time redirect when VERCEL_ENV is not yet preview. */
export const dynamic = "force-dynamic";

export default function DialogueArchivePage() {
  const allowLab =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  const manifest = manifestJson as DialogueArchiveManifest;
  const layout = computeDialogueArchiveLayout(manifest);
  const initialView = computeFitCamera({
    viewportW: DEFAULT_VIEWPORT_W,
    viewportH: DEFAULT_VIEWPORT_H - ARCHIVE_TOOLBAR_H,
    bounds: layout.bounds,
    pad: ARCHIVE_LAYOUT.CONTENT_PAD,
  });

  return <DialogueArchiveCanvas manifest={manifest} initialView={initialView} />;
}
