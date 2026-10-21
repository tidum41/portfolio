import { DialogueAsteriskIcon } from "@/components/dialogue/product/icons";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  placement?: boolean;
  /** Scale Paper app shell (922×540) to fit narrow parity captures. */
  paperScale?: boolean;
};

export default function StudyPageChrome({ placement, paperScale }: Props) {
  const nav = dialogueCopy.nav;
  const tabs = dialogueCopy.tabs;
  const title = placement ? "Checkout" : dialogueCopy.studyPageTitle;

  if (placement && !paperScale) {
    return (
      <div className="dp-app-shell dp-app-shell--placement" aria-hidden>
        <aside className="dp-app-sidebar dp-app-sidebar--placement">
          <div className="dp-app-sidebar__brand">
            <DialogueAsteriskIcon className="dp-app-sidebar__logo" />
            <span className="dp-app-sidebar__wordmark">{dialogueCopy.wordmark}</span>
          </div>
          <nav className="dp-app-sidebar__nav">
            <div className="dp-app-sidebar__nav-item dp-app-sidebar__nav-item--active">Insights</div>
            <div className="dp-app-sidebar__nav-item">Plan</div>
            <div className="dp-app-sidebar__nav-item">{nav.sections}</div>
            <div className="dp-app-sidebar__nav-item">People</div>
          </nav>
        </aside>
        <div className="dp-app-main dp-app-main--placement">
          <header className="dp-app-main__head">
            <p className="dp-app-main__title">{title}</p>
            <div className="dp-app-tabs">
              <span className="dp-app-tab dp-app-tab--active">{tabs.insights}</span>
              <span className="dp-app-tab">People</span>
              <span className="dp-app-tab">Sec.</span>
            </div>
          </header>
          <div className="dp-app-main__body" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={["dp-study-page-wrap", paperScale ? "dp-study-page-wrap--paper-scale" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <div className="dp-app-shell" data-export-app-shell="true">
        <aside className="dp-app-sidebar">
          <div className="dp-app-sidebar__brand">
            <DialogueAsteriskIcon className="dp-app-sidebar__logo" />
            <span className="dp-app-sidebar__wordmark">{dialogueCopy.wordmark}</span>
          </div>
          <div className="dp-app-sidebar__skeleton" />
          <nav className="dp-app-sidebar__nav">
            <div className="dp-app-sidebar__nav-item dp-app-sidebar__nav-item--active">
              {placement ? "Insights" : nav.insightsSummary}
            </div>
            <div className="dp-app-sidebar__nav-item">
              {placement ? "Plan" : nav.researchPlan}
            </div>
            <div className="dp-app-sidebar__nav-item">{nav.sections}</div>
            <div className="dp-app-sidebar__nav-item">
              {placement ? "People" : nav.participants}
            </div>
          </nav>
        </aside>
        <div className="dp-app-main">
          <header className="dp-app-main__head">
            <p className="dp-app-main__title">{title}</p>
            <div className="dp-app-tabs">
              <span className="dp-app-tab dp-app-tab--active">{tabs.insights}</span>
              <span className="dp-app-tab">{tabs.participants}</span>
              <span className="dp-app-tab">{tabs.sections}</span>
            </div>
          </header>
          <div className="dp-app-main__body">
            <div className="dp-app-stat-grid">
              {[
                placement ? "Complete" : dialogueCopy.statTiles.completion,
                placement ? "Address" : dialogueCopy.statTiles.address,
                placement ? "Payment" : dialogueCopy.statTiles.payment,
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
              <span className="dp-app-chip">{dialogueCopy.mixedSentiment}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
