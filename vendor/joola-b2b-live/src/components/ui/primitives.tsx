import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "danger"
  | "quiet"
  | "reject";

export function Button({
  variant = "primary",
  className,
  type = "button",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      type={type}
      className={cx(
        "btn",
        `btn--${variant}`,
        loading && "is-loading",
        isDisabled && variant === "primary" && "is-waiting",
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden /> : null}
      <span className={cx(loading && "btn__label--busy")}>{children}</span>
    </button>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("input", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("textarea", className)} {...props} />;
}

export function SearchField({
  className,
  label = "Search by name, category, or SKU",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={cx("search-wrap", className)}>
      <span className="visually-hidden">{label}</span>
      <input
        className="search-field"
        type="search"
        placeholder={label}
        {...props}
      />
    </label>
  );
}

/**
 * Qty 0 is a normal untouched state: neutral border, no hint.
 * After the user sets a value below MOQ, show a muted "Minimum is N" hint.
 * Pass `error` when they tried to add below MOQ (red border + red hint).
 */
export function QtyStepper({
  value,
  onChange,
  presets = [],
  presetPrices,
  moq = 1,
  disabled = false,
  id,
  error = false,
}: {
  value: number;
  onChange: (n: number) => void;
  presets?: number[];
  /** Formatted unit price per preset qty (shown on chips). */
  presetPrices?: Record<number, string>;
  moq?: number;
  disabled?: boolean;
  id?: string;
  /** True after a failed add-below-MOQ attempt. */
  error?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const belowMoq = value > 0 && value < moq;
  const showMutedHint = touched && (value === 0 || belowMoq) && !error;
  const showErrorHint = error && (value === 0 || value < moq);

  function setSafe(n: number) {
    setTouched(true);
    onChange(Math.max(0, Math.min(9999999, Math.round(n))));
  }

  return (
    <div className="qty-cell">
      <div className={cx("qty-group", showErrorHint && "is-error")}>
        <div className="qty-stepper">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={disabled || value <= 0}
            onClick={() => setSafe(value - 1)}
          >
            <StepIcon kind="minus" />
          </button>
          <input
            id={id}
            className="qty"
            type="text"
            inputMode="numeric"
            aria-label="Quantity"
            disabled={disabled}
            value={value}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setSafe(raw === "" ? 0 : Number(raw));
            }}
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={disabled}
            onClick={() => setSafe(value + 1)}
          >
            <StepIcon kind="plus" />
          </button>
        </div>
        {presets.length > 0 ? (
          <div className="qty-presets">
            {presets.slice(0, 3).map((p) => {
              const price = presetPrices?.[p];
              return (
                <button
                  key={p}
                  type="button"
                  className={value === p ? "on" : undefined}
                  disabled={disabled}
                  title={price ? `${p} @ ${price} ea` : String(p)}
                  onClick={() => setSafe(p)}
                >
                  <span className="qty-presets__qty">
                    {p.toLocaleString("en-US")}
                  </span>
                  {price ? (
                    <span className="qty-presets__price">{price}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div
        className={cx("moq-hint", showErrorHint && "is-error", showMutedHint && "is-muted")}
        aria-live="polite"
      >
        {showErrorHint || showMutedHint ? `Minimum is ${moq}` : "\u00a0"}
      </div>
    </div>
  );
}

function StepIcon({ kind }: { kind: "plus" | "minus" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      {kind === "minus" ? (
        <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
      ) : (
        <>
          <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
          <rect x="5.25" y="2" width="1.5" height="8" rx="0.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function Skeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cx("skel", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skel__row" />
      ))}
    </div>
  );
}

export function EmptyState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("empty-state", className)}>{children}</div>;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  fix,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  fix?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cx("error-state", className)} role="alert">
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__msg">{message}</p>
      {fix ? <p className="error-state__fix">{fix}</p> : null}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function SyncBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="sync-banner" role="status" aria-live="polite">
      <span className="sync-banner__dot" aria-hidden />
      {children ?? "Saving…"}
    </div>
  );
}

export type StatusTone = "danger" | "amber" | "green" | "neutral" | "over" | "ar";

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("status-pill", `is-${tone}`, className)}>{children}</span>
  );
}

export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cx("avatar", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={ref}
        className={cx("modal", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className={cx("drawer", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer__head">
          {title ? (
            <h2 id={titleId} className="drawer__title">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            Close
          </Button>
        </div>
        <div className="drawer__body">{children}</div>
      </aside>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="modal__ctx">{message}</p>
      <div className="modal__actions">
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}

/** Format dates as "Sep 18" in the current year, otherwise "Sep 18, 2025". */
export function formatShortDate(input: string, nowYear = new Date().getFullYear()) {
  // "Oct 2, 2:05 PM" / "Oct 2, 2025, 2:05 PM" → keep calendar day only
  const withTime = input.match(
    /^([A-Za-z]{3}\s+\d{1,2})(?:,\s*(\d{4}))?,\s*\d{1,2}:\d{2}\s*[AP]M$/i,
  );
  if (withTime) {
    return withTime[2] && Number(withTime[2]) !== nowYear
      ? `${withTime[1]}, ${withTime[2]}`
      : withTime[1];
  }
  const parsed = Date.parse(input);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    return d.getFullYear() === nowYear
      ? `${month} ${day}`
      : `${month} ${day}, ${d.getFullYear()}`;
  }
  // Already short like "Sep 30" or "Sep 18, 2026"
  const withYear = input.match(/^([A-Za-z]{3}\s+\d{1,2}),\s*(\d{4})$/);
  if (withYear) {
    return Number(withYear[2]) === nowYear ? withYear[1] : input;
  }
  return input;
}
