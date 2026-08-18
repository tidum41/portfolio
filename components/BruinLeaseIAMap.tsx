/**
 * The Structure — static sitemap.
 *
 * Story, from the case-study copy: the hop across Facebook / Reddit /
 * Instagram / texts becomes one place. Browse, save, and message are
 * the jobs, so those became the tabs. List stays in the header.
 *
 * Desktop used to put 4 channels over 4 tabs, which read as
 * Facebook → Home. Channels are now a cluster that collapse into
 * BruinLease; only then does the app fan into jobs.
 *
 * Mobile stacks the same beats with arrows. Square dashed plate,
 * type nodes, a little UCLA blue on the flow.
 */

const SOURCES = ["Facebook", "Reddit", "Instagram", "Texts"] as const;

const JOBS = [
  {
    job: "Browse",
    tab: "Home",
    flow: ["Search", "Listing", "Save"],
  },
  {
    job: "Save",
    tab: "Saved",
    flow: ["Bookmarks", "Listing"],
  },
  {
    job: "Message",
    tab: "Chat",
    flow: ["Inbox", "Thread"],
  },
  {
    job: "Profile",
    tab: "Profile",
    flow: ["Listings", "Settings"],
    join: "dot" as const,
  },
] as const;

export default function BruinLeaseIAMap() {
  return (
    <figure className="bl-ia" aria-label="How the hop across platforms became BruinLease">
      <style>{CSS}</style>
      <div className="bl-ia-plate">
        <span className="bl-ia-plus bl-ia-plus-tl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-tr" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-bl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-br" aria-hidden>+</span>

        <ul className="bl-ia-from">
          {SOURCES.map((name) => (
            <li key={name}>
              <Cross />
              <s>{name}</s>
            </li>
          ))}
        </ul>

        <p className="bl-ia-arrow" aria-hidden>
          <ArrowDown />
        </p>

        <div className="bl-ia-app">
          <span className="bl-ia-app-name">BruinLease</span>
          <span className="bl-ia-arrow bl-ia-arrow-h" aria-hidden>
            <ArrowRight />
          </span>
          <span className="bl-ia-list">
            <span>List</span>
            <em>header</em>
          </span>
        </div>

        <p className="bl-ia-arrow bl-ia-into" aria-hidden>
          <ArrowDown />
        </p>

        <div className="bl-ia-fan" aria-hidden>
          <span className="bl-ia-fan-stem" />
          <span className="bl-ia-fan-rail" />
        </div>

        <ul className="bl-ia-jobs">
          {JOBS.map((j) => (
            <li key={j.tab}>
              <span className="bl-ia-job">{j.job}</span>
              {j.job !== j.tab ? <span className="bl-ia-tab">{j.tab}</span> : null}
              <p className="bl-ia-flow">
                {j.flow.map((step, i) => (
                  <span key={step}>
                    {i > 0 ? (
                      <span className="bl-ia-sep" aria-hidden>
                        {"join" in j && j.join === "dot" ? "·" : "→"}
                      </span>
                    ) : null}
                    {step}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

function Cross() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
      <path
        d="M1.5 1.5l5 5M6.5 1.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
      <path
        d="M5 1v8M2.2 6.8L5 11l2.8-4.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden>
      <path
        d="M1 5h8M6.8 2.2L11 5 6.8 7.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const CSS = `
.bl-ia{
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-mute: var(--color-text-tertiary);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 28%, transparent);
  --bl-ia-rule: color-mix(in srgb, var(--color-text-primary) 22%, transparent);
  --bl-ia-blue: var(--color-ucla-blue);
  --bl-ia-wrong: #C62828;
  margin: 8px 0 0;
  color: var(--bl-ia-ink);
  -webkit-font-smoothing: antialiased;
}
.bl-ia-plate{
  position: relative;
  margin: 0;
  padding: 24px 18px 20px;
  background: var(--color-placeholder);
  border: 1px dashed var(--bl-ia-rule);
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.45;
}
.bl-ia-plus{
  position: absolute;
  z-index: 2;
  font-size: 12px;
  line-height: 1;
  color: var(--bl-ia-mute);
  pointer-events: none;
  user-select: none;
}
.bl-ia-plus-tl{ top: -7px; left: -5px; }
.bl-ia-plus-tr{ top: -7px; right: -5px; }
.bl-ia-plus-bl{ bottom: -8px; left: -5px; }
.bl-ia-plus-br{ bottom: -8px; right: -5px; }

.bl-ia-from,
.bl-ia-jobs{
  list-style: none;
  margin: 0;
  padding: 0;
}
.bl-ia-from{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
}
.bl-ia-from li{
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--bl-ia-wrong);
}
.bl-ia-from s{
  text-decoration: line-through;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--bl-ia-mute);
}

.bl-ia-arrow{
  display: flex;
  justify-content: center;
  margin: 8px 0;
  color: var(--bl-ia-blue);
  line-height: 0;
}
.bl-ia-arrow-h{
  margin: 0;
  flex-shrink: 0;
}

.bl-ia-app{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.bl-ia-app-name{
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--bl-ia-blue);
}
.bl-ia-list{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
  font-weight: 500;
}
.bl-ia-list em{
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--bl-ia-mute);
}

.bl-ia-fan{ display: none; }

.bl-ia-jobs{
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 2px;
}
.bl-ia-jobs > li{
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1px;
}
.bl-ia-job{
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--bl-ia-blue);
}
.bl-ia-tab{
  font-size: 11px;
  color: var(--bl-ia-mute);
}
.bl-ia-flow{
  margin: 2px 0 0;
  color: color-mix(in srgb, var(--bl-ia-ink) 62%, transparent);
}
.bl-ia-flow > span{ white-space: nowrap; }
.bl-ia-sep{
  display: inline-block;
  margin: 0 6px;
  color: var(--bl-ia-blue);
  font-weight: 400;
}

@media (min-width: 768px){
  .bl-ia-plate{
    padding: 32px 24px 28px;
    font-size: 13px;
  }
  .bl-ia-from{ gap: 8px 28px; }
  .bl-ia-app-name{ font-size: 15px; }
  .bl-ia-arrow{ margin: 10px 0; }
  .bl-ia-into{ margin-bottom: 0; }

  .bl-ia-fan{
    display: block;
    position: relative;
    height: 12px;
    margin: 0 auto;
    width: 100%;
  }
  .bl-ia-fan-stem{ display: none; }
  .bl-ia-fan-rail{
    position: absolute;
    left: 12.5%;
    right: 12.5%;
    top: 0;
    border-top: 1px solid var(--bl-ia-blue);
  }

  .bl-ia-jobs{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px 12px;
    text-align: center;
  }
  .bl-ia-jobs > li{
    align-items: center;
    position: relative;
    padding: 12px 0 0;
  }
  .bl-ia-jobs > li::before{
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 12px;
    background: var(--bl-ia-blue);
    transform: translateX(-0.5px);
  }
  .bl-ia-tab{ font-size: 12px; }
  .bl-ia-flow{ margin-top: 4px; }
}
`;
