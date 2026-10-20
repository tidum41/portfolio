import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DialogueTldrawLoader from "./DialogueTldrawLoader";
import { DIALOGUE_CANVAS_SECTIONS } from "@/lib/caseStudies/dialogueCanvas";
import dialogueCanvasSizes from "@/lib/caseStudies/dialogueCanvasSizes.json";
import type { DialogueImageSize } from "@/lib/caseStudies/dialogueCanvasImageMeta";

export const metadata: Metadata = {
  title: "Dialogue canvas",
  robots: { index: false, follow: false },
};

const imageMeta = dialogueCanvasSizes as Record<string, DialogueImageSize>;

export default function DialogueCanvasPage() {
  const allowLab =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return (
    <DialogueTldrawLoader sections={DIALOGUE_CANVAS_SECTIONS} imageMeta={imageMeta} />
  );
}
