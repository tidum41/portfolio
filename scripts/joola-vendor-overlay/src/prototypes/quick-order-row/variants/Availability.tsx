import { usePlay, type PlayRow } from "../context";
import type { Mode, Sku } from "../logic";
import {
  LineTotal,
  ProductBlock,
  PrototypePage,
  QoCell,
  QoLine,
  QtyField,
  Thumb,
  UnitPrice,
  cx,
  productMetaId,
} from "../shared";
import { FieldTable } from "./table";

function stockView(sku: Sku, mode: Mode) {
  if (mode === "oos") return { inline: "Out of stock", warn: true as const };
  if (sku.availability === "in") return { inline: "In stock", warn: false as const };
  return { line: sku.stockLabel, warn: true as const };
}

function AvailabilityRow({ row }: { row: PlayRow }) {
  const { mode, onQty } = usePlay();
  const { sku, qty, notice } = row;
  const stock = stockView(sku, mode);
  return (
    <QoLine id={sku.id} data-qo-availability={sku.availability}>
      <QoCell col="thumb" id={sku.id}>
        <Thumb sku={sku} />
      </QoCell>
      <QoCell col="product" id={sku.id}>
        <ProductBlock
          sku={sku}
          noticeId={productMetaId(sku.id)}
          notice={notice}
          detail={
            <div className="qo-sku-row">
              <div className="qo-sku">SKU {sku.sku}</div>
              {stock.inline ? (
                <span className={cx("qo-stock", stock.warn && "is-warn")}>
                  {stock.inline}
                </span>
              ) : null}
            </div>
          }
          after={
            stock.line ? (
              <div className={cx("qo-stock-line", stock.warn && "is-warn")}>
                {stock.line}
              </div>
            ) : null
          }
        />
      </QoCell>
      <QoCell col="price" id={sku.id} end>
        <UnitPrice sku={sku} loading={mode === "loading"} />
      </QoCell>
      <QoCell col="qty" id={sku.id}>
        <QtyField
          sku={sku}
          qty={qty}
          mode={mode}
          describedBy={notice ? productMetaId(sku.id) : undefined}
          onCommit={(next, note) => onQty(sku.id, next, note)}
        />
      </QoCell>
      <QoCell col="total" id={sku.id} end>
        <LineTotal sku={sku} qty={qty} loading={mode === "loading"} />
      </QoCell>
    </QoLine>
  );
}

export function AvailabilityVariant() {
  const { rows } = usePlay();
  return (
    <PrototypePage
      table={
        <FieldTable qtyLabel="Qty">
          {rows.map((row) => (
            <AvailabilityRow key={row.sku.id} row={row} />
          ))}
        </FieldTable>
      }
    />
  );
}
