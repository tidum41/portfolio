import type { ReactNode } from "react";
import DialogueWordmark from "@/components/dialogue/product/DialogueWordmark";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  /** Paper export frame (`section-6.html`: 922×540, 188px sidebar) for DS parity. */
  paperFrame?: boolean;
  /** Round N: live content for the main body (the hero's chat). When given,
      it replaces the skeleton stat grid and insights card. */
  children?: ReactNode;
};

export default function StudyPageChrome({ paperFrame, children }: Props) {
  const nav = dialogueCopy.nav;
  const tabs = dialogueCopy.tabs;

  return (
    <div className="dp-study-page-wrap" aria-hidden={children ? undefined : true}>
      <div
        className={["dp-app-shell", paperFrame ? "dp-app-shell--paper-frame" : ""]
          .filter(Boolean)
          .join(" ")}
        data-export-app-shell="true"
      >
        <aside className="dp-app-sidebar">
          <div className="dp-app-sidebar__brand">
            <DialogueWordmark className="dp-app-sidebar__wordmark-img" />
          </div>
          <div className="dp-app-sidebar__skeleton" />
          <nav className="dp-app-sidebar__nav">
            <div className="dp-app-sidebar__nav-item dp-app-sidebar__nav-item--active">
              {nav.insightsSummary}
            </div>
            <div className="dp-app-sidebar__nav-item">{nav.researchPlan}</div>
            <div className="dp-app-sidebar__nav-item">{nav.sections}</div>
            <div className="dp-app-sidebar__nav-item">{nav.participants}</div>
          </nav>
        </aside>
        <div className="dp-app-main">
          <header className="dp-app-main__head">
            <p className="dp-app-main__title">{dialogueCopy.studyPageTitle}</p>
            <div className="dp-app-tabs" role="tablist" aria-hidden>
              <div className="dp-app-tab dp-app-tab--active" role="presentation">
                {tabs.insights}
              </div>
              <div className="dp-app-tab" role="presentation">{tabs.participants}</div>
              <div className="dp-app-tab" role="presentation">{tabs.sections}</div>
            </div>
          </header>
          <div className="dp-app-main__body">
            {children ? (
              <div className="dp-app-main__live">{children}</div>
            ) : (
              <>
            <div className="dp-app-stat-grid">
              {[
                dialogueCopy.statTiles.completion,
                dialogueCopy.statTiles.address,
                dialogueCopy.statTiles.payment,
              ].map((label) => (
                <div key={label} className="dp-app-stat-card">
                  <p className="dp-app-stat-card__label">{label}</p>
                  <div className="dp-app-stat-card__bars">
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
            <div className="dp-app-insights-card">
              <p className="dp-app-insights-card__title">{dialogueCopy.keyInsights}</p>
              <div className="dp-app-insights-card__bars">
                <span />
                <span />
                <span />
              </div>
              <div className="dp-app-chip" role="presentation">{dialogueCopy.mixedSentiment}</div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
