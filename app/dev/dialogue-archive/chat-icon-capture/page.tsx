import { DialogueChatLauncher } from "@/components/dialogue/graphics/DialogueChatLauncher";
import { SecondaryIcon } from "./ChatIconSecondary";

/** Playwright target for scripts/capture-dialogue-chat-icon-history.mjs */
export default function ChatIconCapturePage() {
  const scale = 4;
  const launcherSize = 52;
  return (
    <div
      id="chat-icon-capture-root"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 24,
        padding: 16,
        background: "#f0efed",
      }}
    >
      <div data-capture="launcher" style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <DialogueChatLauncher size={launcherSize} />
      </div>
      <div data-capture="mark" style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <SecondaryIcon />
      </div>
    </div>
  );
}
