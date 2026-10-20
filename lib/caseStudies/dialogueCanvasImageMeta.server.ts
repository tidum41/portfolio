import path from "path";
import sharp from "sharp";
import type { DialogueImageSize } from "./dialogueCanvasImageMeta";

/** Natural pixel dimensions for files under `public/`. Server-only. */
export async function getPublicImageSize(src: string): Promise<DialogueImageSize> {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  const meta = await sharp(filePath).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read dimensions for ${src}`);
  }
  return { width: meta.width, height: meta.height };
}

export async function getDialogueCanvasImageMeta(
  srcs: string[],
): Promise<Record<string, DialogueImageSize>> {
  const entries = await Promise.all(
    srcs.map(async (src) => [src, await getPublicImageSize(src)] as const),
  );
  return Object.fromEntries(entries);
}
