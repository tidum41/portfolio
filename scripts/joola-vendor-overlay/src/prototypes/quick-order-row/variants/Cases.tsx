import { usePlay, type PlayRow } from "../context";
import {
  CaseField,
  LineTotal,
  ProductBlock,
  PrototypePage,
  QoCell,
  QoLine,
  Thumb,
  UnitPrice,
  productMetaId,
} from "../shared";
import { FieldTable } from "./table";

function CasesRow({ row }: { row: PlayRow }) {
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
        <CaseField
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

export function CasesVariant() {
  const { rows } = usePlay();
  return (
    <PrototypePage
      table={
        <FieldTable qtyLabel="Cases" wide>
          {rows.map((row) => (
            <CasesRow key={row.sku.id} row={row} />
          ))}
        </FieldTable>
      }
    />
  );
}
