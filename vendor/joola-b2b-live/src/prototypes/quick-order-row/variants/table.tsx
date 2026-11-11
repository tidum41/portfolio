import type { ReactNode } from "react";
import { QoCell, QoGrid, QoHead } from "../shared";

export function FieldTable({
  qtyLabel,
  wide = false,
  children,
}: {
  qtyLabel: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <QoGrid className={wide ? "qo-grid--cases" : undefined}>
      <QoHead>
        <QoCell col="thumb" id="head" />
        <QoCell col="product" id="head">
          Product
        </QoCell>
        <QoCell col="price" id="head" end>
          Price
        </QoCell>
        <QoCell col="qty" id="head">
          {qtyLabel}
        </QoCell>
        <QoCell col="total" id="head" end>
          Total
        </QoCell>
      </QoHead>
      {children}
    </QoGrid>
  );
}
