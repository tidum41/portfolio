import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { BuyerShell } from "./components/layout/BuyerShell";
import { QuickOrderPage } from "./screens/QuickOrderPage";
import { ReviewPage } from "./screens/ReviewPage";
import { StoreProvider } from "./state/Store";
import { ApprovalQueueHarness } from "./prototypes/approval-queue/ApprovalQueueHarness";
import { EmbedBootstrap } from "./embed/EmbedBootstrap";
import "./styles/embed.css";

export default function AppEmbed() {
  return (
    <StoreProvider>
      <HashRouter>
        <EmbedBootstrap />
        <Toaster position="top-right" duration={4000} />
        <Routes>
          <Route
            path="/quick-order"
            element={
              <BuyerShell>
                <QuickOrderPage />
              </BuyerShell>
            }
          />
          <Route
            path="/review"
            element={
              <BuyerShell>
                <ReviewPage />
              </BuyerShell>
            }
          />
          <Route
            path="/prototypes/approval-queue"
            element={<ApprovalQueueHarness />}
          />
          <Route path="/" element={<Navigate to="/quick-order" replace />} />
          <Route path="*" element={<Navigate to="/quick-order" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
