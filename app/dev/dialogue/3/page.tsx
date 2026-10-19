import { redirect } from "next/navigation";
import DialogueIsolatedChrome from "../_components/DialogueIsolatedChrome";
import Frame3DashboardFab from "../_components/generated/Frame3DashboardFab";

export default function DialogueFrame3Page() {
  const allow =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview";
  if (!allow) redirect("/");

  return (
    <DialogueIsolatedChrome width={1512} height={709}>
      <Frame3DashboardFab />
    </DialogueIsolatedChrome>
  );
}
