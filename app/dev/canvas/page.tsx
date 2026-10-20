import { existsSync, readdirSync } from "fs";
import path from "path";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DialogueTldrawLoader from "./DialogueTldrawLoader";
import {
  DIALOGUE_CANVAS_SECTIONS,
  type DialogueCanvasImage,
  type DialogueCanvasSection,
} from "@/lib/caseStudies/dialogueCanvas";
import { getDialogueCanvasImageMeta } from "@/lib/caseStudies/dialogueCanvasImageMeta.server";

export const metadata: Metadata = {
  title: "Dialogue canvas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function evidenceLabSection(): DialogueCanvasSection | null {
  const dir = path.join(process.cwd(), "public/dialogue/evidence-lab");
  if (!existsSync(dir)) return null;
  const images: DialogueCanvasImage[] = readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .sort()
    .map((f) => ({ src: `/dialogue/evidence-lab/${f}`, caption: f }));
  if (images.length === 0) return null;
  return { id: "evidence-lab", heading: "Evidence lab exports", images };
}

export default async function DialogueCanvasPage() {
  const allowLab =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  if (!allowLab) redirect("/");

  const evidence = evidenceLabSection();
  const sections = evidence ? [...DIALOGUE_CANVAS_SECTIONS, evidence] : DIALOGUE_CANVAS_SECTIONS;
  const srcs = sections.flatMap((s) => s.images.map((i) => i.src));
  const imageMeta = await getDialogueCanvasImageMeta(srcs);

  return <DialogueTldrawLoader sections={sections} imageMeta={imageMeta} />;
}
