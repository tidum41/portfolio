import {
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button, SearchField } from "../../components/ui/primitives";
import { usePlay } from "./context";
import {
  caseCount,
  caseWord,
  commitCases,
  commitQty,
  money,
  moneyLine,
  stepCases,
  stepQty,
  unitWord,
  type Mode,
  type Sku,
} from "./logic";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
      <rect x="5.25" y="2" width="1.5" height="8" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function QoGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("qo-grid", "qo-grid--fields", className)} data-qo-table="">
      {children}
    </div>
  );
}

export function QoHead({ children }: { children: ReactNode }) {
  return <div className="qo-head">{children}</div>;
}

export function QoLine({
  id,
  band = false,
  className,
  children,
  ...rest
}: {
  id: string;
  band?: boolean;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("qo-line", band && "qo-line--band", className)}
      data-qo-line={id}
      {...rest}
    >
      {children}
    </div>
  );
}

export function QoCell({
  col,
  id,
  end = false,
  className,
  children,
  style,
}: {
  col: string;
  id: string;
  end?: boolean;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("qo-cell", `qo-cell--${col}`, end && "qo-end", className)}
      data-qo-cell=""
      data-qo-col={col}
      data-qo-key={`${id}:${col}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function Thumb({ sku }: { sku: Sku }) {
  return (
    <div className="qo-thumb">
      <img src={sku.image} alt="" />
    </div>
  );
}

export function UnitPrice({ sku, loading }: { sku: Sku; loading: boolean }) {
  if (loading) return <span className="qo-skel qo-skel--price" />;
  return (
    <span className="qo-unit tnum" data-qo-fit="">
      {money(sku.price)}
      <span className="qo-ea"> ea</span>
    </span>
  );
}

export function LineTotal({
  sku,
  qty,
  loading,
}: {
  sku: Sku;
  qty: number;
  loading: boolean;
}) {
  if (loading) return <span className="qo-skel qo-skel--total" />;
  if (qty <= 0) {
    return (
      <span className="qo-total tnum is-empty" data-qo-fit="">
        –
      </span>
    );
  }
  return (
    <span className="qo-total tnum" data-qo-fit="">
      {money(moneyLine(sku, qty))}
    </span>
  );
}

function noticeClass(notice: string) {
  return /only/i.test(notice) ? "is-warn" : "is-muted";
}

export function ProductBlock({
  sku,
  detail,
  after,
  notice,
  noticeId,
}: {
  sku: Sku;
  detail?: ReactNode;
  after?: ReactNode;
  notice?: string;
  noticeId?: string;
}) {
  return (
    <div className="qo-product">
      <div className="qo-name" data-qo-fit="">
        {sku.fullName}
      </div>
      {detail}
      <div className="qo-case">Case of {sku.pack}</div>
      {after}
      {notice ? (
        <p id={noticeId} className={cx("qo-meta", noticeClass(notice))} data-qo-fit="">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

export function QtyField({
  sku,
  qty,
  mode,
  describedBy,
  onCommit,
}: {
  sku: Sku;
  qty: number;
  mode: Mode;
  describedBy?: string;
  onCommit: (qty: number, notice: string) => void;
}) {
  const disabled = mode !== "edit";
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(qty);

  function commit(raw: string) {
    const result = commitQty(raw, sku.pack, sku.stock);
    onCommit(result.qty, result.notice);
    setDraft(null);
  }

  function step(dir: 1 | -1) {
    const base = draft != null && draft !== "" ? Number(draft) : qty;
    onCommit(stepQty(base, dir, sku.pack, sku.stock), "");
    setDraft(null);
  }

  return (
    <div
      className={cx("qo-step", disabled && "is-disabled")}
      data-qo-control=""
      role="group"
      aria-label={`Quantity for ${sku.fullName}, case of ${sku.pack}`}
    >
      <button
        type="button"
        data-qo-minus=""
        aria-label={`Decrease ${sku.fullName} by ${sku.pack}`}
        disabled={disabled || qty <= 0}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => step(-1)}
      >
        <MinusIcon />
      </button>
      <input
        className="tnum"
        data-qo-fit=""
        inputMode="numeric"
        autoComplete="off"
        aria-label={`${sku.fullName} quantity`}
        aria-describedby={describedBy}
        disabled={disabled}
        value={shown}
        onFocus={(event) => {
          setDraft(String(qty));
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setDraft(event.target.value.replace(/\D/g, "").slice(0, 4));
        }}
        onBlur={() => {
          if (draft != null) commit(shown);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            step(event.key === "ArrowUp" ? 1 : -1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            commit(shown);
          }
        }}
      />
      <button
        type="button"
        data-qo-plus=""
        aria-label={`Increase ${sku.fullName} by ${sku.pack}`}
        disabled={disabled || qty >= sku.stock}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => step(1)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export function CaseField({
  sku,
  qty,
  mode,
  describedBy,
  onCommit,
}: {
  sku: Sku;
  qty: number;
  mode: Mode;
  describedBy?: string;
  onCommit: (qty: number, notice: string) => void;
}) {
  const disabled = mode !== "edit";
  const cases = caseCount(qty, sku.pack);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(cases);
  const word = caseWord(draft != null && draft !== "" ? Number(draft) || 0 : cases);

  function commit(raw: string) {
    const result = commitCases(raw, sku.pack, sku.stock);
    onCommit(result.qty, result.notice);
    setDraft(null);
  }

  function step(dir: 1 | -1) {
    onCommit(stepCases(qty, dir, sku.pack, sku.stock), "");
    setDraft(null);
  }

  return (
    <div className="qo-caseqty">
      <div
        className={cx("qo-step", "qo-step--cases", disabled && "is-disabled")}
        data-qo-control=""
        role="group"
        aria-label={`Cases for ${sku.fullName}, ${sku.pack} units each`}
      >
        <button
          type="button"
          data-qo-minus=""
          aria-label={`Decrease ${sku.fullName} by 1 case`}
          disabled={disabled || qty <= 0}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => step(-1)}
        >
          <MinusIcon />
        </button>
        <span className="qo-step__mid">
          <input
            className="tnum"
            data-qo-fit=""
            inputMode="numeric"
            autoComplete="off"
            aria-label={`${sku.fullName} cases`}
            aria-describedby={describedBy}
            disabled={disabled}
            value={shown}
            onFocus={(event) => {
              setDraft(String(cases));
              event.currentTarget.select();
            }}
            onChange={(event) => {
              setDraft(event.target.value.replace(/\D/g, "").slice(0, 3));
            }}
            onBlur={() => {
              if (draft != null) commit(shown);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                event.stopPropagation();
                step(event.key === "ArrowUp" ? 1 : -1);
              } else if (event.key === "Enter") {
                event.preventDefault();
                commit(shown);
              }
            }}
          />
          <span className="qo-step__suffix">{word}</span>
        </span>
        <button
          type="button"
          data-qo-plus=""
          aria-label={`Increase ${sku.fullName} by 1 case`}
          disabled={disabled || qty >= sku.stock}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => step(1)}
        >
          <PlusIcon />
        </button>
      </div>
      <p className="qo-units tnum">
        {qty} {unitWord(qty)}
      </p>
    </div>
  );
}

export function PrototypePage({ table }: { table: ReactNode }) {
  const play = usePlay();
  const waiting = play.readyCount === 0;
  let footer = "Set quantities to enable Add to cart";
  if (play.mode === "loading") footer = "Prices are loading";
  else if (play.mode === "oos") footer = "These lines are out of stock";
  else if (!waiting) {
    const lineBit =
      play.readyCount === 1 ? "Adds 1 line" : `Adds ${play.readyCount} lines`;
    const unitBit = play.readyUnits === 1 ? "1 unit" : `${play.readyUnits} units`;
    footer = `${lineBit}, ${unitBit}`;
  }

  return (
    <div className="qo-frame" data-w={play.width} data-qo-state={play.line}>
      <div className="app proto-root qo-proto" data-qo-ready="">
        <div className="proto-shell">
          <aside className="proto-shell__side">
            <img className="proto-shell__logo" src="/joola-logo.svg" alt="JOOLA" />
            <span className="proto-shell__chip">Wholesale</span>
            <nav className="proto-shell__nav" aria-label="Buyer">
              <span className="is-active">Quick order</span>
              <span>Catalog</span>
              <span>Saved orders</span>
              <span>Order history</span>
              <span>Invoices</span>
              <span>Messages</span>
            </nav>
          </aside>
          <div className="proto-shell__main">
            <div className="proto-shell__top">
              <span className="qo-cart tnum">
                Cart · {play.cart.lines} · {money(play.cart.total)} · Dick&apos;s
                Sporting Goods
              </span>
            </div>
            <h1>Quick order</h1>
            <p className="proto-shell__lede">
              One account price per SKU. Quantities move by the case.
            </p>
            <div className="qo-search">
              <SearchField
                value={play.query}
                onChange={(event) => play.setQuery(event.target.value)}
              />
            </div>
            {play.rows.length === 0 ? (
              <div className="qo-empty">
                <p>No results for “{play.query}”. Try a SKU or a shorter product name.</p>
                <button type="button" className="qo-textbtn" onClick={() => play.setQuery("")}>
                  Clear search
                </button>
              </div>
            ) : (
              table
            )}
            <div className="qo-footer">
              <span
                className={cx("qo-footer__meta", waiting && "is-waiting")}
                aria-live="polite"
              >
                {footer}
              </span>
              <Button
                variant="primary"
                disabled={waiting || play.mode !== "edit"}
                onClick={play.add}
              >
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function productMetaId(id: string) {
  return `qo-meta-${id}`;
}
