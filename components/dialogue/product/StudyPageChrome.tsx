import DialogueWordmark from "@/components/dialogue/product/DialogueWordmark";
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
            <DialogueWordmark className="dp-app-sidebar__wordmark-img" />
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

  const sidebarNav = paperScale
    ? [
        { label: "Insights", active: true },
        { label: "Plan", active: false },
        { label: nav.sections, active: false },
        { label: "People", active: false },
      ]
    : [
        { label: placement ? "Insights" : nav.insightsSummary, active: true },
        { label: placement ? "Plan" : nav.researchPlan, active: false },
        { label: nav.sections, active: false },
        { label: placement ? "People" : nav.participants, active: false },
      ];

  return (
    <div
      className={["dp-study-page-wrap", paperScale ? "dp-study-page-wrap--paper-scale" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <div
        className={["dp-app-shell", paperScale ? "dp-app-shell--parity-400" : ""]
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
            {sidebarNav.map((item) => (
              <div
                key={item.label}
                className={[
                  "dp-app-sidebar__nav-item",
                  item.active ? "dp-app-sidebar__nav-item--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </div>
            ))}
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
