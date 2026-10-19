import { redirect } from "next/navigation";
import DialogueIsolatedChrome from "../_components/DialogueIsolatedChrome";
import Frame1DashboardWithChat from "../_components/generated/Frame1DashboardWithChat";

export default function DialogueFrame1Page() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";
  if (!allow) redirect("/");

  return (
    <DialogueIsolatedChrome width={1512} height={709}>
      <Frame1DashboardWithChat />
    </DialogueIsolatedChrome>
  );
}
