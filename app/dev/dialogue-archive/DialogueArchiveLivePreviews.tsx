"use client";

import { DialogueChatLauncher } from "@/components/dialogue/graphics/DialogueChatLauncher";
import {
  ChevronDownIcon,
  CounterEvidenceIcon,
  DialogueAssistantMark,
  DialogueSparkleIcon,
  ShareExportIcon,
} from "@/components/dialogue/graphics/DialogueIcons";
import { CheckoutFunnelChart } from "@/components/dialogue/graphics/CheckoutFunnelChart";
import { ClipThumbnailRow } from "@/components/dialogue/graphics/ClipThumbnailRow";
import { CounterEvidenceSection } from "@/components/dialogue/graphics/CounterEvidenceSection";
import { DerivedEvidenceLabel } from "@/components/dialogue/graphics/DerivedEvidenceLabel";
import { EvidenceAnswerCard } from "@/components/dialogue/graphics/EvidenceAnswerCard";
import { DropoffChart } from "@/components/dialogue/graphics/DropoffChart";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { DialoguePlayerControlBar } from "@/components/dialogue/DialoguePlayerControlBar";
import { DialogueResearchAssistantPanel } from "@/components/dialogue/DialogueResearchAssistantPanel";
import { DialogueStudyTranscript } from "@/components/dialogue/DialogueStudyTranscript";
import { DialoguePlacementScene } from "@/components/dialogue/DialoguePlacementScene";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_COMPOSITION_SCALE } from "@/lib/caseStudies/dialoguePlacementExport";

const AREAL = '"ABC Areal Archive", ' + DIALOGUE_GRAPHICS_FONT;

function PreviewFrame({
  title,
  width,
  children,
}: {
  title: string;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(title)}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          margin: "0 0 8px",
          cursor: "default",
          fontFamily: "var(--font-sans-medium, system-ui)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-text-primary, #1a1816)",
          textAlign: "left",
        }}
      >
        {title}
      </button>
      <div
        style={{
          width: width ?? "auto",
          fontFamily: AREAL,
          background: DIALOGUE_GRAPHICS_COLORS.surface,
          border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogueArchiveLivePreviews() {
  const scale = PLACEMENT_COMPOSITION_SCALE;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
      <PreviewFrame title="Evidence answer card · default" width={400}>
        <EvidenceAnswerCard compact />
      </PreviewFrame>
      <PreviewFrame title="Counter evidence section" width={360}>
        <div style={{ padding: 12 }}>
          <CounterEvidenceSection compact />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Checkout funnel chart" width={360}>
        <div style={{ padding: 12 }}>
          <CheckoutFunnelChart compact />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Clip thumbnail row (3)" width={360}>
        <div style={{ padding: 12 }}>
          <ClipThumbnailRow compact max={3} />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Derived evidence footer" width={360}>
        <DerivedEvidenceLabel>Based on 24 of 24 interviews</DerivedEvidenceLabel>
      </PreviewFrame>
      <PreviewFrame title="Copy-as-card affordance" width={120}>
        <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
          <ShareExportIcon size={16} />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Chat launcher · 48px" width={80}>
        <div style={{ padding: 16 }}>
          <DialogueChatLauncher size={48} />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Chat launcher · 52px default" width={84}>
        <div style={{ padding: 16 }}>
          <DialogueChatLauncher size={52} />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Assistant mark + transcript icons" width={200}>
        <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <DialogueAssistantMark size={22} />
          <DialogueAssistantMark size={24} />
          <DialogueSparkleIcon size={16} />
          <CounterEvidenceIcon size={16} />
          <ChevronDownIcon size={16} />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Interview player" width={620}>
        <div style={{ padding: 12 }}>
          <DialogueInterviewPlayer />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Player control bar" width={400}>
        <DialoguePlayerControlBar />
      </PreviewFrame>
      <PreviewFrame title="Study transcript" width={587}>
        <div style={{ height: 320, display: "flex", flexDirection: "column" }}>
          <DialogueStudyTranscript />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Research assistant panel · compact" width={400}>
        <div style={{ height: 640 }}>
          <DialogueResearchAssistantPanel compact />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Dropoff chart (legacy)" width={360}>
        <div style={{ padding: 12 }}>
          <DropoffChart />
        </div>
      </PreviewFrame>
      <PreviewFrame title="Placement scene · docked" width={Math.round(987 * scale)}>
        <DialoguePlacementScene variant="docked" scale={scale} />
      </PreviewFrame>
      <PreviewFrame title="Placement scene · floating" width={Math.round(987 * scale)}>
        <DialoguePlacementScene variant="floating" scale={scale} />
      </PreviewFrame>
    </div>
  );
}
