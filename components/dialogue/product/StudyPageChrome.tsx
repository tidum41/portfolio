import { dialogueCopy } from "@/components/dialogue/product/tokens";

export default function StudyPageChrome({ placement }: { placement?: boolean }) {
  const nav = dialogueCopy.nav;
  return (
    <div className="dp-study-page" aria-hidden>
      <nav className="dp-study-nav">
        <div className="dp-study-nav__logo">dialogue</div>
        <div className="dp-study-nav__item dp-study-nav__item--active">
          {placement ? "Insights" : nav.insightsSummary}
        </div>
        <div className="dp-study-nav__item">{placement ? "Plan" : nav.researchPlan}</div>
        <div className="dp-study-nav__item">{nav.sections}</div>
        <div className="dp-study-nav__item">{placement ? "People" : nav.participants}</div>
      </nav>
      <div className="dp-study-main">
        <h4>{placement ? "Checkout" : dialogueCopy.studyPageTitle}</h4>
        <div className="dp-study-cards">
          <div className="dp-mini-stat">
            {placement ? "Complete" : dialogueCopy.statTiles.completion}
          </div>
          <div className="dp-mini-stat">
            {placement ? "Address" : dialogueCopy.statTiles.address}
          </div>
          <div className="dp-mini-stat">
            {placement ? "Payment" : dialogueCopy.statTiles.payment}
          </div>
        </div>
      </div>
    </div>
  );
}
