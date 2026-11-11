import { PRODUCTS, FULFILLMENT, money as moneyUsd, type Product } from "../../../data/ledger";
import { QtyStepper } from "../../../components/ui/primitives";
import { usePlay, type PlayRow } from "../context";
import { money as moneyFmt } from "../logic";
import {
  LineTotal,
  PrototypePage,
} from "../shared";

function PresetsRow({ row }: { row: PlayRow }) {
  const { mode, onQty } = usePlay();
  const { sku, qty } = row;
  const product = PRODUCTS[sku.id] as Product | undefined;
  const loading = mode === "loading";
  const lineTotal =
    qty > 0 && product
      ? (Math.round(product.buyerPrice * 100) * qty) / 100
      : 0;
  const fulfill = FULFILLMENT[sku.id];

  return (
    <div className="qo-table__row" key={sku.id}>
      <div className="qo-thumb">
        <img src={sku.image} alt="" />
      </div>
      <div className="prod-block">
        <div className="prod-name" title={sku.fullName}>
          {sku.fullName}
        </div>
        <div className="prod-sku">SKU {sku.sku}</div>
        {fulfill ? (
          <span className="avail-tag">
            {fulfill.warehouse} · {fulfill.availability}
          </span>
        ) : null}
      </div>
      <div className="price-block end">
        <div className="unit tnum">
          {loading ? "–" : moneyFmt(sku.price)}
          <span className="ea"> ea</span>
        </div>
      </div>
      <QtyStepper
        value={qty}
        onChange={(n) => onQty(sku.id, n, "")}
        presets={product?.presets ?? [sku.pack, sku.pack * 2, sku.pack * 4]}
        moq={product?.moq ?? sku.pack}
        disabled={mode !== "edit"}
      />
      <div className={`line-total tnum end${qty === 0 ? " is-empty" : ""}`}>
        {loading || qty === 0 ? "–" : moneyUsd(lineTotal)}
      </div>
    </div>
  );
}

export function PresetsVariant() {
  const { rows } = usePlay();
  const visible = rows.slice(0, 5);
  return (
    <PrototypePage
      table={
        <div className="qo-table">
          <div className="qo-table__head" aria-hidden>
            <div />
            <div>Product</div>
            <div className="end">Price</div>
            <div>Qty</div>
            <div className="end">Total</div>
          </div>
          {visible.map((row) => (
            <PresetsRow key={row.sku.id} row={row} />
          ))}
        </div>
      }
    />
  );
}
