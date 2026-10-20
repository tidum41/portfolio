"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  DialogueCaseStudyContent,
  type RasterAnnotator,
} from "@/components/dialogue/DialogueCaseStudyContent";
import {
  DIALOGUE_CANVAS_ASSETS,
  DIALOGUE_CANVAS_BY_ID,
  PRIVATE_EXPORT_COMMIT,
  PRIVATE_EXPORT_REPO,
} from "@/lib/caseStudies/dialogueCanvasCatalog";
import RasterAnnotation from "./RasterAnnotation";

const EXPORT_REPO_REACHABLE = false;

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
        <p className="dcv2__page-lede">fcc87a2 case study, round-18 exports, and source artifacts (pre-cutoff).</p>
      </header>

      <section className="dcv2__section" aria-labelledby="dcv2-case-study">
        <h2 id="dcv2-case-study" className="dcv2__section-title">1. Case study</h2>
        <p className="dcv2__section-intro">
          Restored Dialogue draft exactly as on <code>/dialogue</code>. Raster frames include ID, status, and a one-line note.
        </p>
        <div className="dcv2__case-study">
          <DialogueCaseStudyContent annotateRaster={annotateRaster} backHref="/dev/dialogue-canvas-v2" />
        </div>
      </section>

      <section className="dcv2__section" aria-labelledby="dcv2-live">
        <h2 id="dcv2-live" className="dcv2__section-title">2. Live components</h2>
        {EXPORT_REPO_REACHABLE ? null : (
          <p className="dcv2__skip">
            Skipped: the private export repo at{" "}
            <a href={PRIVATE_EXPORT_REPO} className="dcv2__link">
              {PRIVATE_EXPORT_REPO}
            </a>{" "}
            @ <code>{PRIVATE_EXPORT_COMMIT}</code> is not reachable from this environment (git clone requires
            authentication). Round-18 <code>/export/&lt;id&gt;</code> components were not ported.
          </p>
        )}
      </section>

      <section className="dcv2__section" aria-labelledby="dcv2-sources">
        <h2 id="dcv2-sources" className="dcv2__section-title">3. Source artifacts</h2>
        <p className="dcv2__section-intro">
          Paper JSX and HTML/CSS for each graphic live in the export repo; this portfolio checkout only has the
          committed PNGs.
        </p>
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
                {asset.pngSrc ? (
                  <Image
                    src={asset.pngSrc}
                    alt=""
                    width={120}
                    height={75}
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                  />
                ) : (
                  <span className="dcv2-artifacts__pending">Visual pending</span>
                )}
              </div>
              <div className="dcv2-artifacts__links">
                <p>
                  <span className="dcv2-artifacts__label">Export route</span>
                  <code>/export/{asset.exportRoute}</code>
                </p>
                <p>
                  <span className="dcv2-artifacts__label">Paper JSX</span>
                  <span className="dcv2-artifacts__missing">Not in portfolio repo</span>
                </p>
                <p>
                  <span className="dcv2-artifacts__label">HTML / CSS</span>
                  <span className="dcv2-artifacts__missing">Not in portfolio repo</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
