/** Shared copy for approval queue prototype and production admin screen. */
export function ApprovalQueueIntro() {
  return (
  <>
    <h1>Approval queue</h1>
    <p className="page-lede">
      Orders over credit limit that need your decision. Select a row to approve,
      or reject when the account cannot cover the order.
    </p>
    <div className="aq-buyer" role="note">
      <span>Buyer sees</span>
      <span className="aq-pill aq-pill--pending">Pending approval</span>
      <span>Your JOOLA rep needs to approve it before a ship date can be confirmed.</span>
    </div>
  </>
  );
}
