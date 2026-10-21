export default function StudyPageChrome({ placement }: { placement?: boolean }) {
  return (
    <div className="dp-study-page" aria-hidden>
      <nav className="dp-study-nav">
        <div className="dp-study-nav__logo">dialogue</div>
        <div className="dp-study-nav__item dp-study-nav__item--active">Insights</div>
        <div className="dp-study-nav__item">{placement ? "Plan" : "Research plan"}</div>
        <div className="dp-study-nav__item">Sections</div>
        <div className="dp-study-nav__item">{placement ? "People" : "Participants"}</div>
      </nav>
      <div className="dp-study-main">
        <h4>{placement ? "Checkout" : "Checkout study"}</h4>
        <div className="dp-study-cards">
          <div className="dp-mini-stat">{placement ? "Complete" : "Completion rate"}</div>
          <div className="dp-mini-stat">{placement ? "Address" : "Address friction"}</div>
          <div className="dp-mini-stat">{placement ? "Payment" : "Payment trust"}</div>
        </div>
      </div>
    </div>
  );
}
