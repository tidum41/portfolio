/**
 * BruinLease sitemap — grouped by job, every screen listed.
 * Cards and lists only. No diagram chrome.
 */

type Area = {
  title: string;
  where: string;
  screens: string[];
};

const SEEK: Area[] = [
  {
    title: "Browse",
    where: "Home tab",
    screens: [
      "Search",
      "Quarter filter",
      "Results",
      "Listing — reviews, save, message",
    ],
  },
  {
    title: "Saved",
    where: "Saved tab",
    screens: ["Bookmarks", "Listing"],
  },
  {
    title: "Messages",
    where: "Chat tab",
    screens: ["Inbox", "Thread"],
  },
];

const LIST: Area = {
  title: "Create listing",
  where: "Header",
  screens: ["Stepped form", "My listings"],
};

const ACCOUNT: Area = {
  title: "Profile",
  where: "Profile tab",
  screens: ["My listings", "Settings", ".edu verification"],
};

export default function BruinLeaseIAMap() {
  return (
    <div className="bl-ia" aria-label="BruinLease information architecture">
      <style>{CSS}</style>

      <section className="bl-ia-block">
        <h3 className="bl-ia-kicker">Before</h3>
        <p className="bl-ia-before">
          Facebook groups, Reddit threads, Instagram stories, and texts —
          no shared listing format, no verification, no one inbox.
        </p>
      </section>

      <section className="bl-ia-block">
        <h3 className="bl-ia-kicker">Seek</h3>
        <p className="bl-ia-lead">
          Three tabs for the jobs people were hopping between.
        </p>
        <div className="bl-ia-grid bl-ia-grid-3">
          {SEEK.map((area) => (
            <Chunk key={area.title} area={area} />
          ))}
        </div>
      </section>

      <div className="bl-ia-grid bl-ia-grid-2">
        <section className="bl-ia-block">
          <h3 className="bl-ia-kicker">List</h3>
          <p className="bl-ia-lead">
            Header, not a fifth tab — seeking stays first.
          </p>
          <Chunk area={LIST} />
        </section>
        <section className="bl-ia-block">
          <h3 className="bl-ia-kicker">Account</h3>
          <p className="bl-ia-lead">
            Identity and the listings you already posted.
          </p>
          <Chunk area={ACCOUNT} />
        </section>
      </div>
    </div>
  );
}

function Chunk({ area }: { area: Area }) {
  return (
    <article className="bl-ia-card">
      <header className="bl-ia-card-head">
        <p className="bl-ia-card-title">{area.title}</p>
        <p className="bl-ia-card-where">{area.where}</p>
      </header>
      <ul className="bl-ia-list">
        {area.screens.map((screen) => (
          <li key={screen}>{screen}</li>
        ))}
      </ul>
    </article>
  );
}

const CSS = `
.bl-ia{
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.bl-ia-block{ margin: 0; }
.bl-ia-kicker{
  font-family: var(--font-sans-medium);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: var(--color-text-tertiary);
  margin: 0 0 8px;
}
.bl-ia-before,
.bl-ia-lead{
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}
.bl-ia-grid{
  display: grid;
  gap: 8px;
}
.bl-ia-grid-3{ grid-template-columns: repeat(3, 1fr); }
.bl-ia-grid-2{ grid-template-columns: 1fr 1fr; }
.bl-ia-card{
  background: var(--color-accent-subtle);
  border-radius: 8px;
  padding: 14px 16px 16px;
  min-width: 0;
}
.bl-ia-card-head{ margin: 0 0 10px; }
.bl-ia-card-title{
  font-family: var(--font-sans-medium);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: var(--color-text-primary);
  margin: 0;
}
.bl-ia-card-where{
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin: 2px 0 0;
}
.bl-ia-list{
  margin: 0;
  padding: 0 0 0 1.1em;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bl-ia-list li{
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
@media (max-width: 767px){
  .bl-ia-grid-3,
  .bl-ia-grid-2{ grid-template-columns: 1fr; }
}
`;
