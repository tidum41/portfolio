import { redirect } from "next/navigation";
import DialogueIsolatedChrome from "../_components/DialogueIsolatedChrome";
import Frame4ChatPanel from "../_components/generated/Frame4ChatPanel";

export default function DialogueFrame4Page() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";
  if (!allow) redirect("/");

  return (
    <DialogueIsolatedChrome width={582} height={1303}>
      <Frame4ChatPanel />
    </DialogueIsolatedChrome>
  );
}
