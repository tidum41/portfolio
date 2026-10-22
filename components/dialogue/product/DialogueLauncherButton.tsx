import { DialogueAsteriskIcon } from "@/components/dialogue/product/icons";

type Props = {
  className?: string;
  size?: number;
};

/** Floating chat launcher (Dialogue asterisk mark). */
export default function DialogueLauncherButton({ className, size = 48 }: Props) {
  return (
    <div
      className={["dp-bubble-launcher", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      aria-hidden
      data-annotate-part="launcher"
    >
      <DialogueAsteriskIcon className="dp-bubble-launcher__icon" />
    </div>
  );
}
