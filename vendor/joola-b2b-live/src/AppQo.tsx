import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { StoreProvider } from "./state/Store";
import { QuickOrderRowHarness } from "./prototypes/quick-order-row/QuickOrderRowHarness";
import { EmbedBootstrap } from "./embed/EmbedBootstrap";
import "./styles/embed.css";

export default function AppQo() {
  return (
    <StoreProvider>
      <HashRouter>
        <EmbedBootstrap />
        <Routes>
          <Route
            path="/prototypes/quick-order-row"
            element={<QuickOrderRowHarness />}
          />
          <Route
            path="*"
            element={<Navigate to="/prototypes/quick-order-row" replace />}
          />
        </Routes>
        <Toaster position="top-right" duration={4000} />
      </HashRouter>
    </StoreProvider>
  );
}
