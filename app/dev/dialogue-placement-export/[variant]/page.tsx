import {
  PLACEMENT_MARGIN_LR,
  PLACEMENT_MARGIN_TB,
  PLACEMENT_TILE_BG,
  PLACEMENT_TILE_HEIGHT,
  PLACEMENT_TILE_WIDTH,
  type PlacementVariant,
} from "@/lib/caseStudies/dialoguePlacementExport";
import { DialoguePlacementScene } from "@/components/dialogue/DialoguePlacementScene";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ variant: "docked" }, { variant: "floating" }];
}

function parseVariant(raw: string): PlacementVariant | null {
  if (raw === "docked" || raw === "floating") return raw;
  return null;
}

export default function DialoguePlacementExportPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  return <PlacementExport params={params} />;
}

async function PlacementExport({ params }: { params: Promise<{ variant: string }> }) {
  const { variant: raw } = await params;
  const variant = parseVariant(raw);
  if (!variant) notFound();

  return (
    <div
      id="export-root"
      data-variant={variant}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: PLACEMENT_TILE_WIDTH,
        height: PLACEMENT_TILE_HEIGHT,
        background: PLACEMENT_TILE_BG,
        boxSizing: "border-box",
        padding: `${PLACEMENT_MARGIN_TB}px ${PLACEMENT_MARGIN_LR}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 2147483646,
      }}
    >
      <DialoguePlacementScene variant={variant} />
    </div>
  );
}
