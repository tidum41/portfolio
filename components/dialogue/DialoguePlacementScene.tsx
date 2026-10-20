import type { ReactNode } from "react";
import {
  PLACEMENT_SUBJECT_HEIGHT,
  PLACEMENT_SUBJECT_WIDTH,
  PLACEMENT_UI_SCALE,
  type PlacementVariant,
} from "@/lib/caseStudies/dialoguePlacementExport";
import { DialogueAssistantFab, DialogueAssistantPanel } from "./DialogueAssistantPanel";

const STUDY_W = 520;
const STUDY_H = 360;
const SIDEBAR_W = 300;

function StudyPageChrome() {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "28px 32px",
        background: "#FFFFFF",
      }}
    >
      <div
        style={{
          height: 10,
          width: "42%",
          borderRadius: 5,
          background: "#E7E2DC",
          marginBottom: 18,
        }}
      />
      <div
        style={{
          height: 8,
          width: "88%",
          borderRadius: 4,
          background: "#F0ECE7",
          marginBottom: 10,
        }}
      />
      <div
        style={{
          height: 8,
          width: "76%",
          borderRadius: 4,
          background: "#F0ECE7",
          marginBottom: 10,
        }}
      />
      <div
        style={{
          height: 8,
          width: "82%",
          borderRadius: 4,
          background: "#F0ECE7",
          marginBottom: 24,
        }}
      />
      <div
        style={{
          height: 120,
          borderRadius: 12,
          background: "#F5F2EF",
          border: "1px solid #EDE9E4",
        }}
      />
    </div>
  );
}

function ScaledStage({
  layoutWidth,
  layoutHeight,
  children,
}: {
  layoutWidth: number;
  layoutHeight: number;
  children: ReactNode;
}) {
  const w = Math.round(layoutWidth * PLACEMENT_UI_SCALE);
  const h = Math.round(layoutHeight * PLACEMENT_UI_SCALE);
  return (
    <div style={{ width: w, height: h, position: "relative", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: layoutWidth,
          height: layoutHeight,
          transform: `scale(${PLACEMENT_UI_SCALE})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function DialoguePlacementScene({ variant }: { variant: PlacementVariant }) {
  const docked = variant === "docked";

  const studyShell = (
    <div
      style={{
        display: "flex",
        width: docked ? STUDY_W + SIDEBAR_W : STUDY_W,
        height: STUDY_H,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #E0DBD5",
        background: "#FFFFFF",
        boxShadow: "0 1px 0 rgba(28, 25, 23, 0.04)",
      }}
    >
      <StudyPageChrome />
      {docked ? (
        <div
          style={{
            width: SIDEBAR_W,
            borderLeft: "1px solid #E7E2DC",
            background: "#FAFAF9",
            display: "flex",
            flexDirection: "column",
            padding: "12px 10px",
          }}
        >
          <DialogueAssistantPanel docked />
        </div>
      ) : null}
    </div>
  );

  const dockedLayoutW = STUDY_W + SIDEBAR_W;
  const dockedLayoutH = STUDY_H;
  const floatingLayoutW = STUDY_W + 48;
  const floatingLayoutH = STUDY_H + 200;

  return (
    <div
      style={{
        width: PLACEMENT_SUBJECT_WIDTH,
        height: PLACEMENT_SUBJECT_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {docked ? (
        <ScaledStage layoutWidth={dockedLayoutW} layoutHeight={dockedLayoutH}>
          {studyShell}
        </ScaledStage>
      ) : (
        <ScaledStage layoutWidth={floatingLayoutW} layoutHeight={floatingLayoutH}>
          <div style={{ position: "relative", width: floatingLayoutW, height: floatingLayoutH }}>
            <div style={{ position: "absolute", left: 0, top: 0 }}>{studyShell}</div>
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              <DialogueAssistantPanel docked={false} />
              <div style={{ marginRight: 6 }}>
                <DialogueAssistantFab />
              </div>
            </div>
          </div>
        </ScaledStage>
      )}
    </div>
  );
}
