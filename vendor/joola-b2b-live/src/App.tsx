import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { Toaster, toast } from "sonner";
import { isPaused, subscribePause } from "./api/clock";
import { CleanBootstrap } from "./components/CleanBootstrap";
import { GuidesMount } from "./components/GuidesMount";
import { PlaygroundDial } from "./components/PlaygroundDial";
import { ToastLiveRegion } from "./components/ToastLiveRegion";
import { AdminShell } from "./components/layout/AdminShell";
import { BuyerShell } from "./components/layout/BuyerShell";
import { StoreProvider, useStore } from "./state/Store";
import { LoginPage } from "./screens/LoginPage";
import { QuickOrderPage } from "./screens/QuickOrderPage";
import { CatalogPage } from "./screens/CatalogPage";
import { SavedOrdersPage } from "./screens/SavedOrdersPage";
import { CartPage } from "./screens/CartPage";
import { ReviewPage } from "./screens/ReviewPage";
import { OrderPlacedPage } from "./screens/OrderPlacedPage";
import { OrderHistoryPage } from "./screens/OrderHistoryPage";
import { InvoicesPage } from "./screens/InvoicesPage";
import { MessagesPage } from "./screens/MessagesPage";
import { ApprovalQueuePage } from "./screens/admin/ApprovalQueuePage";
import { AdminOrdersPage } from "./screens/admin/AdminOrdersPage";
import { BreakQtyHarness } from "./screens/dev/BreakQtyHarness";
import { BreakApprovalsHarness } from "./screens/dev/BreakApprovalsHarness";
import { StatesSheet } from "./screens/dev/StatesSheet";
import { ApprovalQueueHarness } from "./prototypes/approval-queue/ApprovalQueueHarness";
import { QuickOrderRowHarness } from "./prototypes/quick-order-row/QuickOrderRowHarness";

function searchKeep() {
  if (typeof window === "undefined") return "";
  return window.location.search || "";
}

function RequireBuyer() {
  const { session } = useStore();
  if (!session) return <Navigate to={`/login${searchKeep()}`} replace />;
  if (session.role === "admin") {
    return <Navigate to={`/admin/orders${searchKeep()}`} replace />;
  }
  return (
    <BuyerShell>
      <Outlet />
    </BuyerShell>
  );
}

function RequireAdmin() {
  const { session } = useStore();
  if (!session) return <Navigate to={`/login${searchKeep()}`} replace />;
  if (session.role !== "admin") {
    return <Navigate to={`/quick-order${searchKeep()}`} replace />;
  }
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

function PauseBridge() {
  useEffect(() => {
    const apply = () => {
      const paused = isPaused();
      document.documentElement.classList.toggle("is-paused", paused);
      document.body.classList.toggle("is-paused", paused);
      if (paused) {
        toast.getToasts().forEach((t) => {
          if (!("title" in t) || t.id == null) return;
          const title =
            typeof t.title === "string"
              ? t.title
              : typeof t.title === "number"
                ? String(t.title)
                : "Paused";
          const description =
            "description" in t && typeof t.description === "string"
              ? t.description
              : undefined;
          toast(title, {
            id: t.id,
            description,
            duration: Infinity,
          });
        });
      }
    };
    apply();
    return subscribePause(apply);
  }, []);
  return null;
}

function AppRoutes() {
  const [params] = useSearchParams();
  const clean =
    params.get("clean") === "1" || params.get("clean") === "true";

  return (
    <>
      <PauseBridge />
      <GuidesMount />
      {clean ? <CleanBootstrap /> : <PlaygroundDial />}
      <Toaster
        position="top-right"
        richColors={false}
        closeButton
        toastOptions={{
          classNames: {
            toast: "joola-toast",
            title: "joola-toast__title",
            description: "joola-toast__desc",
          },
          duration: isPaused() ? Infinity : 4000,
        }}
      />
      <ToastLiveRegion />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dev/break-qty" element={<BreakQtyHarness />} />
        <Route path="/dev/break-approvals" element={<BreakApprovalsHarness />} />
        <Route path="/dev/states-sheet" element={<StatesSheet />} />
        <Route element={<RequireBuyer />}>
          <Route
            path="/prototypes/quick-order-row"
            element={<QuickOrderRowHarness />}
          />
          <Route path="/" element={<Navigate to="/quick-order" replace />} />
          <Route path="/quick-order" element={<QuickOrderPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/saved-orders" element={<SavedOrdersPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/order-placed" element={<OrderPlacedPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/approvals" element={<ApprovalQueuePage />} />
          <Route
            path="/prototypes/approval-queue"
            element={<ApprovalQueueHarness />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/quick-order" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
