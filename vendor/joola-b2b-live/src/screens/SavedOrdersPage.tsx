import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  lineAmount,
  linesTotal,
  linesUnits,
  money,
  type Line,
  type PastOrder,
  type SavedOrder,
} from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  QtyStepper,
  Skeleton,
  SyncBanner,
  formatShortDate,
} from "../components/ui/primitives";

export function SavedOrdersPage() {
  const {
    savedOrders,
    pastOrders,
    products,
    replaceCart,
    saveTemplate,
    renameSaved,
    deleteSaved,
    restoreSaved,
    updateSavedLines,
    cart,
    account,
  } = useStore();

  const { status, error, reload, syncing } = useScreenQuery(
    "saved-orders",
    () => ({ savedOrders, pastOrders }),
    [savedOrders.length, pastOrders.length],
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editLinesId, setEditLinesId] = useState<string | null>(null);
  const [lineDraft, setLineDraft] = useState<Line[]>([]);

  const templates = useMemo(
    () => savedOrders.filter((s) => s.kind === "template"),
    [savedOrders],
  );

  async function commitRename(id: string) {
    const name = draftName.trim();
    setEditingId(null);
    if (!name) return;
    try {
      await renameSaved(id, name);
      toast.success("Saved order renamed");
    } catch {
      toast.error("Could not rename. Name restored.");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    const snapshot = savedOrders.find((s) => s.id === id);
    setDeleteId(null);
    try {
      await deleteSaved(id);
      toast.message("Saved order deleted", {
        action: snapshot
          ? {
              label: "Undo",
              onClick: () => {
                restoreSaved(snapshot);
                toast.success("Saved order restored");
              },
            }
          : undefined,
      });
    } catch {
      toast.error("Could not delete. Saved order restored.");
    }
  }

  async function createFromCart() {
    if (cart.length === 0) {
      toast.error("Add lines to the cart before saving an order.");
      return;
    }
    try {
      await saveTemplate("New saved order", cart);
      toast.success("Saved order created from cart");
    } catch {
      toast.error("Could not save the order.");
    }
  }

  if (status === "loading") {
    return (
      <section className="page page--saved">
        <h1>Saved orders</h1>
        <Skeleton rows={4} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--saved">
        <h1>Saved orders</h1>
        <ErrorState
          title="Saved orders did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="page page--saved">
        <h1>Saved orders</h1>
        <EmptyState>
          No saved orders yet. Save a Quick order to create one.
        </EmptyState>
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" onClick={createFromCart}>
            Save this cart
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="page page--saved">
      <div className="page-head-row">
        <div>
          <h1>Saved orders</h1>
          <p className="page-lede">
            Saved orders belong to the account, so anyone on the team can reorder.
          </p>
        </div>
        <Button variant="primary" onClick={createFromCart}>
          Save this cart
        </Button>
      </div>
      {syncing ? <SyncBanner>Syncing saved orders…</SyncBanner> : null}

      <h2 className="section-title">Saved for reorder</h2>
      <div className="saved-list">
        {templates.map((tpl) => (
          <SavedCard
            key={tpl.id}
            order={tpl}
            open={openId === tpl.id}
            onToggle={() => setOpenId(openId === tpl.id ? null : tpl.id)}
            editing={editingId === tpl.id}
            draftName={draftName}
            onStartEdit={() => {
              setEditingId(tpl.id);
              setDraftName(tpl.name);
            }}
            onDraft={setDraftName}
            onCommitRename={() => void commitRename(tpl.id)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => setDeleteId(tpl.id)}
            onAddToCart={() => {
              replaceCart(tpl.lines);
              toast.success("Saved order added to cart");
            }}
            onEditItems={() => {
              setEditLinesId(tpl.id);
              setLineDraft(tpl.lines.map((l) => ({ ...l })));
              setOpenId(tpl.id);
            }}
            products={products}
          />
        ))}
      </div>

      <h2 className="section-title">Past purchase orders</h2>
      <div className="saved-list">
        {pastOrders.map((po) => (
          <PastOrderCard
            key={po.id}
            order={po}
            open={openId === po.id}
            onToggle={() => setOpenId(openId === po.id ? null : po.id)}
            onAddToCart={() => {
              replaceCart(po.lines);
              toast.success("Past order added to cart");
            }}
            onSaveForReorder={async () => {
              await saveTemplate(po.label, po.lines);
              toast.success("Saved order created from past order");
            }}
            products={products}
            fallbackBuyer={account?.buyer ?? "Buyer"}
          />
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete saved order?"
        message="This removes the saved order for everyone on the account."
        confirmLabel="Delete"
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />

      {editLinesId ? (
        <div className="inline-edit-panel">
          <h3>Edit lines</h3>
          {lineDraft.map((line) => {
            const p = products[line.productId];
            if (!p) return null;
            return (
              <div className="inline-edit-row" key={line.productId}>
                <span>{p.fullName}</span>
                <QtyStepper
                  value={line.qty}
                  moq={p.moq}
                  onChange={(n) =>
                    setLineDraft((prev) =>
                      prev.map((l) =>
                        l.productId === line.productId ? { ...l, qty: n } : l,
                      ),
                    )
                  }
                />
              </div>
            );
          })}
          <div className="modal__actions">
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  await updateSavedLines(
                    editLinesId,
                    lineDraft.filter((l) => l.qty > 0),
                  );
                  toast.success("Lines updated");
                  setEditLinesId(null);
                } catch {
                  toast.error("Could not update lines.");
                }
              }}
            >
              Save lines
            </Button>
            <Button variant="outline" onClick={() => setEditLinesId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SavedCard({
  order,
  open,
  onToggle,
  editing,
  draftName,
  onStartEdit,
  onDraft,
  onCommitRename,
  onCancelEdit,
  onDelete,
  onAddToCart,
  onEditItems,
  products,
}: {
  order: SavedOrder;
  open: boolean;
  onToggle: () => void;
  editing: boolean;
  draftName: string;
  onStartEdit: () => void;
  onDraft: (v: string) => void;
  onCommitRename: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onAddToCart: () => void;
  onEditItems: () => void;
  products: ReturnType<typeof useStore>["products"];
}) {
  const items = order.lines.length;
  const units = linesUnits(order.lines);
  const total = linesTotal(order.lines);

  return (
    <article className={`tpl-card${open ? " is-open" : ""}`}>
      <div className="tpl-head-row">
        <button type="button" className="tpl-head" onClick={onToggle} aria-expanded={open}>
          <span className="tpl-title">
            {editing ? (
              <Input
                value={draftName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onDraft(e.target.value)}
                onBlur={onCommitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCommitRename();
                  if (e.key === "Escape") onCancelEdit();
                }}
                aria-label="Saved order name"
                autoFocus
              />
            ) : (
              <span
                className="name"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
              >
                {order.name}
              </span>
            )}
            <span className="meta">
              Saved by {order.savedBy}, updated {formatShortDate(order.updated)}
            </span>
          </span>
          <span className="tpl-stats">
            <span>
              <b className="tnum">{items}</b> {items === 1 ? "item" : "items"}
            </span>
            <span>
              <b className="tnum">{units}</b> {units === 1 ? "unit" : "units"}
            </span>
            <span className="tnum">
              <b>{money(total)}</b>
            </span>
            <span>Last ordered {formatShortDate(order.lastOrdered)}</span>
          </span>
          <Chevron />
        </button>
      </div>
      {open ? (
        <div className="tpl-body">
          <LineList lines={order.lines} products={products} />
          <div className="tpl-actions">
            <Button variant="primary" onClick={onAddToCart}>
              Add to cart
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
            >
              Rename
            </Button>
            <Button variant="outline" onClick={onEditItems}>
              Edit lines
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PastOrderCard({
  order,
  open,
  onToggle,
  onAddToCart,
  onSaveForReorder,
  products,
  fallbackBuyer,
}: {
  order: PastOrder;
  open: boolean;
  onToggle: () => void;
  onAddToCart: () => void;
  onSaveForReorder: () => void | Promise<void>;
  products: ReturnType<typeof useStore>["products"];
  fallbackBuyer: string;
}) {
  const items = order.lines.length;
  const units = linesUnits(order.lines);
  const total = linesTotal(order.lines);
  const poLabel = order.id.replace(/^PO-?/i, "PO ");
  const placedBy = order.placedBy || fallbackBuyer;

  return (
    <article className={`tpl-card${open ? " is-open" : ""}`}>
      <div className="tpl-head-row">
        <button type="button" className="tpl-head" onClick={onToggle} aria-expanded={open}>
          <span className="tpl-title">
            <span className="name">{order.label}</span>
            <span className="meta">
              {poLabel}, placed by {placedBy}
            </span>
          </span>
          <span className="tpl-stats">
            <span>
              <b className="tnum">{items}</b> {items === 1 ? "item" : "items"}
            </span>
            <span>
              <b className="tnum">{units}</b> {units === 1 ? "unit" : "units"}
            </span>
            <span className="tnum">
              <b>{money(total)}</b>
            </span>
            <span>{formatShortDate(order.when)}</span>
          </span>
          <Chevron />
        </button>
      </div>
      {open ? (
        <div className="tpl-body">
          <LineList lines={order.lines} products={products} />
          <div className="tpl-actions">
            <Button variant="primary" onClick={onAddToCart}>
              Add to cart
            </Button>
            <Button variant="outline" onClick={() => void onSaveForReorder()}>
              Save this order
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function LineList({
  lines,
  products,
}: {
  lines: Line[];
  products: ReturnType<typeof useStore>["products"];
}) {
  return (
    <div className="tpl-inner">
      {lines.map((l) => {
        const p = products[l.productId];
        if (!p) return null;
        return (
          <div className="tpl-line" key={l.productId}>
            <div className="tpl-thumb">
              <img src={p.image} alt="" />
            </div>
            <div className="prod-block">
              <div className="prod-name">{p.fullName}</div>
              <div className="prod-sku">SKU {p.sku}</div>
            </div>
            <div className="tpl-unit tnum">
              {l.qty} × {money(lineAmount(p, l.qty, l) / l.qty)}
            </div>
            <div className="tpl-amt tnum">{money(lineAmount(p, l.qty, l))}</div>
          </div>
        );
      })}
    </div>
  );
}

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 16 16" aria-hidden>
      <polyline points="4 6 8 10 12 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default SavedOrdersPage;
