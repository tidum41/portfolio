"use client";

import { DATA_VIZ_SPECIMENS } from "@/components/dialogue/drafts/dataVizCatalog";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/drafts/drafts.css";

export default function DataVizOptionsSection() {
  return (
    <section className="dcv2-dataviz" aria-labelledby="dcv2-dataviz">
      <h2 id="dcv2-dataviz" className="dcv2__section-title">
        1. Data viz options
      </h2>
      <p className="dcv2__section-intro">
        Every chart option explored for Dialogue answers, side by side. Specimens keep the
        Dialogue palette (stone-500 muted, cherry highlight). Rejected and draft options live
        only here, not on the case study page.
      </p>
      <ul className="dcv2-dataviz__grid">
        {DATA_VIZ_SPECIMENS.map((specimen) => {
          const Chart = specimen.Component;
          return (
            <li key={specimen.id} className="dcv2-dataviz__tile" id={`dataviz-${specimen.id}`}>
              <div className="dcv2-dataviz__frame">
                <div className="dcv2-dataviz__chart dialogue-product-root dp-chat-panel-typography">
                  <Chart />
                </div>
              </div>
              <div className="dcv2-dataviz__meta">
                <h3 className="dcv2-dataviz__name">{specimen.name}</h3>
                <p className="dcv2-dataviz__source">{specimen.source}</p>
                <p className="dcv2-dataviz__status" data-status={specimen.status}>
                  {specimen.status}
                </p>
                <p className="dcv2-dataviz__note">{specimen.note}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
