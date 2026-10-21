export default function StudyPageChrome() {
  return (
    <div className="dp-study-page">
      <nav className="dp-study-nav" aria-hidden>
        <div className="dp-study-nav__logo">dialogue</div>
        <div className="dp-study-nav__item dp-study-nav__item--active">Insights summary</div>
        <div className="dp-study-nav__item">Research plan</div>
        <div className="dp-study-nav__item">Sections</div>
        <div className="dp-study-nav__item">Participants</div>
      </nav>
      <div className="dp-study-main">
        <h4>Checkout usability study, Q3</h4>
        <div className="dp-study-cards">
          <div className="dp-mini-stat">Completion rate</div>
          <div className="dp-mini-stat">Address friction</div>
          <div className="dp-mini-stat">Payment trust</div>
        </div>
        <p className="dp-text-meta" style={{ margin: 0 }}>Key insights from moderated sessions</p>
      </div>
    </div>
  );
}
