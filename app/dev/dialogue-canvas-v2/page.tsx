import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DialogueStoryMap from "./DialogueStoryMap";
import { DIALOGUE_STORY_BEATS } from "@/lib/caseStudies/dialogueStoryMap";

export const dynamic = "force-dynamic";

const EXPORT_REPO_NOTE =
  "Private export repo (origin.cursor.com/muditm/tmp-2a0ae96295f1ba40 @ 483274f) was not accessible from this environment—rows use fcc87a2-approved PNGs only (no live /export renders).";

export default async function DialogueReviewCanvasPage() {
  await connection();
  const host = (await headers()).get("host") ?? "";
  const vercelEnv = process.env.VERCEL_ENV;
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.DIALOGUE_REVIEW_LAB === "1" ||
    vercelEnv === "preview" ||
    (vercelEnv !== "production" && host.endsWith(".vercel.app"));

  if (!allowLab) redirect("/");

  return <DialogueStoryMap beats={DIALOGUE_STORY_BEATS} exportRepoNote={EXPORT_REPO_NOTE} />;
}
