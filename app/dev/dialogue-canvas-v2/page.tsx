import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DialogueCanvasV2 from "./DialogueCanvasV2";
import "./dialogue-canvas-v2.css";

export const dynamic = "force-dynamic";

export default async function DialogueCanvasV2Page() {
  await connection();
  const host = (await headers()).get("host") ?? "";
  const vercelEnv = process.env.VERCEL_ENV;
  const allowLab =
    process.env.NODE_ENV === "development" ||
    process.env.DIALOGUE_REVIEW_LAB === "1" ||
    vercelEnv === "preview" ||
    (vercelEnv !== "production" && host.endsWith(".vercel.app"));

  if (!allowLab) redirect("/");

  return <DialogueCanvasV2 />;
}
