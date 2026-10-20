import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DialogueSimpleViewer from "./DialogueSimpleViewer";
import { DIALOGUE_CANVAS_SECTIONS } from "@/lib/caseStudies/dialogueCanvas";

export const metadata: Metadata = {
  title: "Dialogue canvas",
  robots: { index: false, follow: false },
};

export default function DialogueCanvasPage() {
  const allowLab =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  return <DialogueSimpleViewer sections={DIALOGUE_CANVAS_SECTIONS} />;
}
