import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DialogueArchiveCanvas from "./DialogueArchiveCanvas";
import type { DialogueArchiveManifest } from "@/lib/caseStudies/dialogueArchiveTypes";
import manifestJson from "@/lib/caseStudies/dialogueArchiveManifest.json";

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

  return <DialogueArchiveCanvas manifest={manifest} />;
}
