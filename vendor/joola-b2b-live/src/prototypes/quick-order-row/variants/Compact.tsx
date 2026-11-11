import { usePlay, type PlayRow } from "../context";
import {
  LineTotal,
  ProductBlock,
  PrototypePage,
  QoCell,
  QoLine,
  QtyField,
  Thumb,
  UnitPrice,
  productMetaId,
} from "../shared";
import { FieldTable } from "./table";

function CompactRow({ row }: { row: PlayRow }) {
  const { mode, onQty } = usePlay();
  const { sku, qty, notice } = row;
  return (
    <QoLine id={sku.id}>
      <QoCell col="thumb" id={sku.id}>
        <Thumb sku={sku} />
      </QoCell>
      <QoCell col="product" id={sku.id}>
        <ProductBlock
          sku={sku}
          noticeId={productMetaId(sku.id)}
          notice={notice}
          detail={<div className="qo-sku">SKU {sku.sku}</div>}
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

export function CompactVariant() {
  const { rows } = usePlay();
  return (
    <PrototypePage
      table={
        <FieldTable qtyLabel="Qty">
          {rows.map((row) => (
            <CompactRow key={row.sku.id} row={row} />
          ))}
        </FieldTable>
      }
    />
  );
}
