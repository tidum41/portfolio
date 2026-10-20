import {
  AssetRecordType,
  createShapeId,
  type Editor,
  type TLAssetId,
  toRichText,
} from "tldraw";
import type { DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import {
  DIALOGUE_CANVAS_DISPLAY_WIDTH,
  type DialogueImageSize,
  scaledDisplaySize,
} from "@/lib/caseStudies/dialogueCanvasImageMeta";

const COLUMN_GAP = 80;
const ROW_GAP = 80;
const TEXT_WIDTH = DIALOGUE_CANVAS_DISPLAY_WIDTH;
const EST_TEXT_BLOCK_H = 72;

export function resolveImageUrl(src: string, origin: string) {
  return new URL(src, origin).href;
}

export function seedDialogueTldrawBoard(
  editor: Editor,
  sections: DialogueCanvasSection[],
  sizes: Record<string, DialogueImageSize>,
  origin: string,
) {
  const assets: {
    id: TLAssetId;
    type: "image";
    typeName: "asset";
    props: {
      w: number;
      h: number;
      name: string;
      isAnimated: boolean;
      mimeType: string;
      src: string;
    };
    meta: Record<string, never>;
  }[] = [];

  const shapes: Parameters<Editor["createShapes"]>[0] = [];

  let colX = 0;

  for (const section of sections) {
    let y = 0;

    for (let i = 0; i < section.images.length; i++) {
      const img = section.images[i];
      const natural = sizes[img.src];
      if (!natural) {
        console.warn(`Missing dimensions for ${img.src}`);
        continue;
      }

      const display = scaledDisplaySize(natural);
      const assetId = AssetRecordType.createId();
      const imageUrl = resolveImageUrl(img.src, origin);

      assets.push({
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          w: natural.width,
          h: natural.height,
          name: img.src.split("/").pop() ?? "image",
          isAnimated: false,
          mimeType: "image/png",
          src: imageUrl,
        },
        meta: {},
      });

      const label = `${section.heading}\n${img.caption}`;
      shapes.push({
        id: createShapeId(`label-${section.id}-${i}`),
        type: "text",
        x: colX,
        y,
        props: {
          richText: toRichText(label),
          size: "s",
          w: TEXT_WIDTH,
          autoSize: true,
        },
      });

      y += EST_TEXT_BLOCK_H + ROW_GAP;

      shapes.push({
        id: createShapeId(`img-${section.id}-${i}`),
        type: "image",
        x: colX,
        y,
        props: {
          w: display.w,
          h: display.h,
          assetId,
          crop: null,
          flipX: false,
          flipY: false,
          altText: img.caption,
        },
      });

      y += display.h + ROW_GAP;
    }

    colX += DIALOGUE_CANVAS_DISPLAY_WIDTH + COLUMN_GAP;
  }

  editor.createAssets(assets);
  editor.createShapes(shapes);
}

export function clearDialogueBoard(editor: Editor) {
  const shapeIds = [...editor.getCurrentPageShapeIds()];
  if (shapeIds.length) editor.deleteShapes(shapeIds);
  const assetIds = editor.getAssets().map((a) => a.id);
  if (assetIds.length) editor.deleteAssets(assetIds);
}

export function reseedDialogueBoard(
  editor: Editor,
  sections: DialogueCanvasSection[],
  sizes: Record<string, DialogueImageSize>,
  origin: string,
) {
  clearDialogueBoard(editor);
  seedDialogueTldrawBoard(editor, sections, sizes, origin);
  editor.zoomToFit({ animation: { duration: 0 } });
}
