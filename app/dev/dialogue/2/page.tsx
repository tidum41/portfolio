import { redirect } from "next/navigation";
import DialogueIsolatedChrome from "../_components/DialogueIsolatedChrome";
import Frame2ChatTranscript from "../_components/generated/Frame2ChatTranscript";

export default function DialogueFrame2Page() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";
  if (!allow) redirect("/");

  return (
    <DialogueIsolatedChrome width={474} height={6005}>
      <Frame2ChatTranscript />
    </DialogueIsolatedChrome>
  );
}
