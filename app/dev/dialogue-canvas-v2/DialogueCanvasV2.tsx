"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  DialogueCaseStudyContent,
  type RasterAnnotator,
} from "@/components/dialogue/DialogueCaseStudyContent";
import DataVizOptionsSection from "@/components/dialogue/drafts/DataVizOptionsSection";
import { DIALOGUE_CANVAS_ASSETS, DIALOGUE_CANVAS_BY_ID } from "@/lib/caseStudies/dialogueCanvasCatalog";
import RasterAnnotation from "./RasterAnnotation";
import LiveExportIframe from "./LiveExportIframe";
import "./data-viz-options.css";

const LIVE_ASSETS = DIALOGUE_CANVAS_ASSETS.filter((a) => a.staticExportSrc);

export default function DialogueCanvasV2() {
  const annotateRaster: RasterAnnotator = useCallback((assetId, children) => {
    const asset = DIALOGUE_CANVAS_BY_ID[assetId];
    if (!asset) return children;
    return <RasterAnnotation asset={asset}>{children}</RasterAnnotation>;
  }, []);

  return (
    <div className="dcv2">
      <header className="dcv2__page-header">
        <h1 className="dcv2__page-title">Dialogue review canvas</h1>
        <p className="dcv2__page-lede">
          Data viz options, round-34 case study rasters, static export iframes, and source artifact index.
        </p>
      </header>

      <div className="dcv2__section">
        <DataVizOptionsSection />
      </div>

      <section className="dcv2__section" aria-labelledby="dcv2-case-study">
        <h2 id="dcv2-case-study" className="dcv2__section-title">2. Case study</h2>
        <p className="dcv2__section-intro">
          Same content as <code>/dialogue</code>. Raster frames include ID, status, and a one-line note.
        </p>
        <div className="dcv2__case-study">
          <DialogueCaseStudyContent annotateRaster={annotateRaster} backHref="/dev/dialogue-canvas-v2" />
        </div>
      </section>

      <section className="dcv2__section" aria-labelledby="dcv2-live">
        <h2 id="dcv2-live" className="dcv2__section-title">3. Live components</h2>
        <p className="dcv2__section-intro">
          Round-34 static HTML exports from <code>export-static.zip</code>, embedded at intrinsic aspect ratio.
        </p>
        <ul className="dcv2-live">
          {LIVE_ASSETS.map((asset) => (
            <li key={asset.id} className="dcv2-live__row" id={`live-${asset.id}`}>
              <button
                type="button"
                className="dcv2-live__chip"
                onClick={() => navigator.clipboard.writeText(asset.id)}
              >
                {asset.id}
              </button>
              <div className="dcv2-live__parity">
                {asset.pngSrc && asset.rasterWidth && asset.rasterHeight ? (
                  <div className="dcv2-live__parity-png">
                    <Image
                      src={asset.pngSrc}
                      alt={`${asset.id} PNG reference`}
                      width={asset.rasterWidth}
                      height={asset.rasterHeight}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                ) : null}
              <div className="dcv2-live__frame">
                {asset.exportFrameWidth && asset.exportFrameHeight ? (
                  <LiveExportIframe
                    src={asset.staticExportSrc!}
                    title={`${asset.id} static export`}
                    frameWidth={asset.exportFrameWidth}
                    frameHeight={asset.exportFrameHeight}
                  />
                ) : (
                  <iframe
                    src={asset.staticExportSrc!}
                    title={`${asset.id} static export`}
                    className="dcv2-live__iframe"
                    loading="lazy"
                  />
                )}
              </div>
              </div>
              <p className="dcv2-live__path">
                <code>{asset.staticExportSrc}</code>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="dcv2__section" aria-labelledby="dcv2-sources">
        <h2 id="dcv2-sources" className="dcv2__section-title">4. Source artifacts</h2>
        <p className="dcv2__section-intro">Committed round-34 PNGs and static export paths per asset ID.</p>
        <ul className="dcv2-artifacts">
          {DIALOGUE_CANVAS_ASSETS.map((asset) => (
            <li key={asset.id} className="dcv2-artifacts__row">
              <button
                type="button"
                className="dcv2-artifacts__id"
                onClick={() => navigator.clipboard.writeText(asset.id)}
              >
                {asset.id}
              </button>
              <div className="dcv2-artifacts__thumb">
                {asset.pngSrc && asset.rasterWidth && asset.rasterHeight ? (
                  <Image
                    src={asset.pngSrc}
                    alt=""
                    width={asset.rasterWidth}
                    height={asset.rasterHeight}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <span className="dcv2-artifacts__pending">Visual pending</span>
                )}
              </div>
              <div className="dcv2-artifacts__links">
                <p>
                  <span className="dcv2-artifacts__label">Static export</span>
                  {asset.staticExportSrc ? (
                    <code>{asset.staticExportSrc}</code>
                  ) : (
                    <span className="dcv2-artifacts__missing">Not available</span>
                  )}
                </p>
                <p>
                  <span className="dcv2-artifacts__label">PNG</span>
                  {asset.pngSrc ? <code>{asset.pngSrc}</code> : <span className="dcv2-artifacts__missing">Pending</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
