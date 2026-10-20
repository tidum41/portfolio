import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DialogueReviewCanvas from "./DialogueReviewCanvas";
import {
  REVIEW_LAYOUT,
  REVIEW_TOOLBAR_H,
  computeDialogueReviewLayout,
  computeReviewFitCamera,
} from "@/lib/caseStudies/computeDialogueReviewLayout";
import type { DialogueReviewManifest } from "@/lib/caseStudies/dialogueReviewTypes";
import manifestJson from "@/lib/caseStudies/dialogueReviewManifest.json";

export const dynamic = "force-dynamic";

const VIEW_W = 1440;
const VIEW_H = 900;

export default async function DialogueReviewCanvasPage() {
  // Read VERCEL_ENV at request time (preview builds must not bake in production).
  await connection();
  const host = (await headers()).get("host") ?? "";
  const vercelEnv = process.env.VERCEL_ENV;
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.DIALOGUE_REVIEW_LAB === "1" ||
    vercelEnv === "preview" ||
    (vercelEnv !== "production" && host.endsWith(".vercel.app"));

  if (!allowLab) redirect("/");

  const manifest = manifestJson as DialogueReviewManifest;
  const layout = computeDialogueReviewLayout(manifest);
  const initialView = computeReviewFitCamera({
    viewportW: VIEW_W,
    viewportH: VIEW_H - REVIEW_TOOLBAR_H,
    bounds: layout.fitBounds,
    pad: REVIEW_LAYOUT.CONTENT_PAD,
  });

  return <DialogueReviewCanvas manifest={manifest} initialView={initialView} />;
}
