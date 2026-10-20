import {
  PLACEMENT_COMPOSITION_HEIGHT,
  PLACEMENT_COMPOSITION_WIDTH,
  PLACEMENT_TILE_BG,
  PLACEMENT_TILE_HEIGHT,
  PLACEMENT_TILE_MARGIN_LEFT,
  PLACEMENT_TILE_MARGIN_TOP,
  PLACEMENT_TILE_WIDTH,
  PLACEMENT_COMPOSITION_SCALE,
  type PlacementVariant,
} from "@/lib/caseStudies/dialoguePlacementExport";
import { DialoguePlacementScene } from "@/components/dialogue/DialoguePlacementScene";
import { DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { notFound } from "next/navigation";

/** Always render fresh so placement layout edits show up in capture without stale SSG. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ variant: "docked" }, { variant: "floating" }];
}

function parseVariant(raw: string): PlacementVariant | null {
  if (raw === "docked" || raw === "floating") return raw;
  return null;
}

export default async function DialoguePlacementExportPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: raw } = await params;
  const variant = parseVariant(raw);
  if (!variant) notFound();

  return (
    <div
      id="export-root"
      data-variant={variant}
      style={{
        width: PLACEMENT_TILE_WIDTH,
        height: PLACEMENT_TILE_HEIGHT,
        minHeight: PLACEMENT_TILE_HEIGHT,
        background: PLACEMENT_TILE_BG,
        position: "fixed",
        left: 0,
        top: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
        zIndex: 2147483646,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PLACEMENT_TILE_MARGIN_LEFT,
          top: PLACEMENT_TILE_MARGIN_TOP,
          width: PLACEMENT_COMPOSITION_WIDTH,
          height: PLACEMENT_COMPOSITION_HEIGHT,
        }}
      >
        <DialoguePlacementScene variant={variant} scale={PLACEMENT_COMPOSITION_SCALE} />
      </div>
    </div>
  );
}
