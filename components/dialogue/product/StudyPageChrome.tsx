export default function StudyPageChrome() {
  return (
    <div className="dp-study-page" aria-hidden>
      <nav className="dp-study-nav">
        <div className="dp-study-nav__logo">dialogue</div>
        <div className="dp-study-nav__item dp-study-nav__item--active">Insights</div>
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
        <p className="dp-study-main__insight">Key insights from moderated sessions</p>
      </div>
    </div>
  );
}
