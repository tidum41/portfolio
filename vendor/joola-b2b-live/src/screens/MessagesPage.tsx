import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  SyncBanner,
  Textarea,
  formatShortDate,
} from "../components/ui/primitives";

export function MessagesPage() {
  const { threads, sendMessage, account } = useStore();
  const [activeId, setActiveId] = useState(threads[0]?.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [draft, setDraft] = useState("");

  const { status, error, reload, syncing } = useScreenQuery(
    "messages",
    () => threads,
    [threads.length],
  );

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  async function onSend() {
    if (!active || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    try {
      await sendMessage(active.id, body);
      toast.success("Message sent");
    } catch {
      setDraft(body);
      toast.error("Could not send. Your draft was restored.");
    }
  }

  if (status === "loading") {
    return (
      <section className="page page--messages">
        <h1>Messages</h1>
        <Skeleton rows={4} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--messages">
        <h1>Messages</h1>
        <ErrorState
          title="Messages did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty" || threads.length === 0) {
    return (
      <section className="page page--messages">
        <h1>Messages</h1>
        <EmptyState>
          No conversations yet. Message your JOOLA rep after placing an order.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="page page--messages">
      <h1>Messages</h1>
      <p className="page-lede">
        Threads with JOOLA sales for {account?.name ?? "your account"}.
      </p>
      {syncing ? <SyncBanner>Sending…</SyncBanner> : null}

      <div className={`msg-layout${sidebarOpen ? "" : " is-sidebar-collapsed"}`}>
        <aside className="msg-list" aria-label="Conversations">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === active?.id ? "is-active" : undefined}
              onClick={() => setActiveId(t.id)}
            >
              <strong>{t.name}</strong>
              <span className="role">{t.role}</span>
              <span className="preview">{t.preview}</span>
              <span className="time">{formatShortDate(t.time)}</span>
            </button>
          ))}
        </aside>

        <div className="msg-thread">
          {active ? (
            <>
              <header className="msg-thread__head">
                <div>
                  <strong>{active.name}</strong>
                  <span>{active.role}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSidebarOpen((v) => !v)}
                  aria-pressed={sidebarOpen}
                >
                  {sidebarOpen ? "Hide order" : "Show order"}
                </Button>
              </header>
              <div className="msg-thread__body">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`msg-bubble${m.from === "buyer" ? " is-mine" : ""}`}
                  >
                    <div className="msg-bubble__meta">
                      {m.author}, {formatShortDate(m.time)}
                    </div>
                    <div className="msg-bubble__text">{m.body}</div>
                  </div>
                ))}
              </div>
              <form
                className="msg-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSend();
                }}
              >
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${active.name.split(" ")[0]}`}
                  rows={3}
                />
                <Button type="submit" variant="primary" disabled={!draft.trim()}>
                  Send
                </Button>
              </form>
            </>
          ) : null}
        </div>

        <aside className="msg-order" aria-label="Related order">
          {active?.orderId ? (
            <>
              <h2>Order</h2>
              <div className="msg-order__id">{active.orderId}</div>
              <div className="msg-order__lines">
                {active.lineCount ?? 0} line
                {(active.lineCount ?? 0) === 1 ? "" : "s"}
              </div>
              <p className="muted">
                Collapse this panel when you need more room for the thread.
              </p>
            </>
          ) : (
            <p className="muted">No linked order for this thread.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default MessagesPage;
