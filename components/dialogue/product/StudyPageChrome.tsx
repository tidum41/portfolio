import DialogueWordmark from "@/components/dialogue/product/DialogueWordmark";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  placement?: boolean;
};

export default function StudyPageChrome({ placement }: Props) {
  const nav = dialogueCopy.nav;
  const tabs = dialogueCopy.tabs;
  const title = placement ? "Checkout" : dialogueCopy.studyPageTitle;

  if (placement) {
    return (
      <div className="dp-app-shell dp-app-shell--placement" aria-hidden>
        <aside className="dp-app-sidebar dp-app-sidebar--placement">
          <div className="dp-app-sidebar__brand">
            <DialogueWordmark className="dp-app-sidebar__wordmark-img" />
          </div>
          <nav className="dp-app-sidebar__nav">
            <div className="dp-app-sidebar__nav-item dp-app-sidebar__nav-item--active">Insights</div>
            <div className="dp-app-sidebar__nav-item">Plan</div>
            <div className="dp-app-sidebar__nav-item">Sec.</div>
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
    <div className="dp-study-page-wrap" aria-hidden>
      <div className="dp-app-shell" data-export-app-shell="true">
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
              <span className="dp-app-chip">{dialogueCopy.mixedSentiment}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
