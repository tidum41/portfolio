import { DialogueChatLauncher } from "@/components/dialogue/graphics/DialogueChatLauncher";

const LAUNCHER_BASE = 52;
const CAPTURE_SCALE = 4;
const PAD = 32;

/** Playwright target for scripts/capture-dialogue-chat-icon-history.mjs */
export default function ChatIconCapturePage() {
  const size = LAUNCHER_BASE * CAPTURE_SCALE;
  const box = size + PAD * 2;
  return (
    <div
      id="chat-icon-capture-root"
      style={{
        width: box,
        height: box,
        padding: PAD,
        boxSizing: "border-box",
        background: "#f0efed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        data-capture="launcher"
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DialogueChatLauncher size={size} />
      </div>
    </div>
  );
}
