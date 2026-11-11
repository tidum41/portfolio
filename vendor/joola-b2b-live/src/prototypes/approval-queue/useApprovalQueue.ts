/**
 * Shared queue behavior for the approval prototypes.
 * Forced states come from `protoState` so the playground dial's `state`
 * param cannot collapse them. `clean=1` still applies the forced state;
 * it only zeroes mock latency.
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { mockRequest } from "../../api/mock";
import { QUEUE, type QueueOrder } from "./data";

export type ProtoForce =
  | "default"
  | "empty"
  | "approve-override"
  | "reject-with-reason"
  | "loading";

export function readProtoForce(raw: string | null): ProtoForce {
  switch (raw) {
    case "empty":
    case "empty-queue":
      return "empty";
    case "approve-override":
      return "approve-override";
    case "reject-with-reason":
    case "reject-with-reason-error":
      return "reject-with-reason";
    case "loading":
      return "loading";
    default:
      return "default";
  }
}

type Notice = { message: string; undo: () => void };

type Snapshot = {
  orders: QueueOrder[];
  openId: string;
  reasons: Record<string, string>;
};

function seed(force: ProtoForce): QueueOrder[] {
  if (force === "empty") return [];
  if (force === "approve-override") {
    return QUEUE.filter((order) => order.id !== "dicks");
  }
  return QUEUE.slice();
}

export function useApprovalQueue(forceOverride?: ProtoForce) {
  const [params] = useSearchParams();
  const force = forceOverride ?? readProtoForce(params.get("protoState"));
  const [orders, setOrders] = useState(() => seed(force));
  const [openId, setOpenId] = useState(() => seed(force)[0]?.id ?? "");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [reasonError, setReasonError] = useState<string | null>(
    force === "reject-with-reason" ? "dicks" : null,
  );
  const [busy, setBusy] = useState<{
    id: string;
    kind: "approve" | "reject";
  } | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showForcedToast, setShowForcedToast] = useState(
    force === "approve-override",
  );

  function select(id: string) {
    setOpenId(id);
    setReasonError((current) => (current === id ? current : null));
  }

  function setReason(id: string, value: string) {
    setReasons((current) => ({ ...current, [id]: value }));
    if (value.trim()) {
      setReasonError((current) => (current === id ? null : current));
    }
  }

  function restore(prev: Snapshot) {
    setOrders(prev.orders);
    setOpenId(prev.openId);
    setReasons(prev.reasons);
    setReasonError(null);
    setNotice(null);
    setShowForcedToast(false);
  }

  async function decide(order: QueueOrder, kind: "approve" | "reject") {
    if (busy) return;
    if (kind === "reject" && !(reasons[order.id] || "").trim()) {
      setOpenId(order.id);
      setReasonError(order.id);
      return;
    }
    const prev: Snapshot = { orders, openId, reasons: { ...reasons } };
    setBusy({ id: order.id, kind });
    try {
      await mockRequest("approvals", () => null, { latencyMs: 400 });
      const rest = orders.filter((item) => item.id !== order.id);
      setOrders(rest);
      setOpenId(rest[0]?.id ?? "");
      setReasonError(null);
      setShowForcedToast(false);
      setNotice({
        message: kind === "approve" ? "Order approved" : "Order rejected",
        undo: () => restore(prev),
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not update the order. It is still in the queue.";
      setNotice({ message, undo: () => setNotice(null) });
    } finally {
      setBusy(null);
    }
  }

  const toast: Notice | null = notice
    ? notice
    : showForcedToast
      ? {
          message: "Order approved",
          undo: () => {
            setOrders(QUEUE.slice());
            setOpenId("dicks");
            setReasonError(null);
            setShowForcedToast(false);
          },
        }
      : null;

  return {
    force,
    loading: force === "loading",
    orders: force === "loading" ? [] : orders,
    openId,
    select,
    reasons,
    setReason,
    reasonError,
    busyId: busy?.id ?? null,
    busyKind: busy?.kind ?? null,
    toast,
    dismissToast: () => {
      setNotice(null);
      setShowForcedToast(false);
    },
    approve: (order: QueueOrder) => decide(order, "approve"),
    reject: (order: QueueOrder) => decide(order, "reject"),
  };
}
