/**
 * The Structure — static sitemap.
 *
 * Desktop: 4-column funnel (channels collapse into BruinLease, then
 * fan into tabs). Sources and tabs share one grid so the rails actually
 * line up — the usual failure in org-chart sitemaps.
 *
 * Mobile: file-tree outline. Case-study sitemaps (NN/g, Linear/Stripe
 * docs) switch to an indented tree on a phone instead of squashing the
 * org chart into a 2×2.
 *
 * Craft: dashed plate, + corners, [ STRUCTURE ] in the rule, type nodes
 * (no pills, no rounding). Mono inside the artifact.
 */

const SOURCES = ["Facebook", "Reddit", "Instagram", "Texts"] as const;

const BRANCHES = [
  { tab: "Home", screens: ["Search", "Listing", "Save"] },
  { tab: "Saved", screens: ["Bookmarks", "Listing"] },
  { tab: "Chat", screens: ["Inbox", "Thread"] },
  { tab: "Profile", screens: ["Listings", "Settings"] },
] as const;

export default function BruinLeaseIAMap() {
  return (
    <figure className="bl-ia" aria-label="How BruinLease is structured">
      <style>{CSS}</style>
      <div className="bl-ia-plate">
        <span className="bl-ia-plus bl-ia-plus-tl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-tr" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-bl" aria-hidden>+</span>
        <span className="bl-ia-plus bl-ia-plus-br" aria-hidden>+</span>
        <span className="bl-ia-kicker">[ STRUCTURE ]</span>

        <div className="bl-ia-board">
          <ul className="bl-ia-from">
            {SOURCES.map((name) => (
              <li key={name}>
                <s>{name}</s>
              </li>
            ))}
          </ul>

          <div className="bl-ia-rails bl-ia-converge" aria-hidden>
            <span className="bl-ia-h" />
            <span className="bl-ia-mid" />
            <div className="bl-ia-vs">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <p className="bl-ia-join" aria-hidden>
            +
          </p>

          <p className="bl-ia-app">
            <span className="bl-ia-app-name">BruinLease</span>
            <span className="bl-ia-app-rail" aria-hidden />
            <span className="bl-ia-list">List</span>
          </p>

          <div className="bl-ia-rails bl-ia-diverge" aria-hidden>
            <span className="bl-ia-h" />
            <span className="bl-ia-mid" />
            <div className="bl-ia-vs">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <ul className="bl-ia-tree">
            {BRANCHES.map((b) => (
              <li key={b.tab}>
                <span className="bl-ia-tab">{b.tab}</span>
                <ul>
                  {b.screens.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}

const CSS = `
.bl-ia{
  --bl-ia-ink: var(--color-text-primary);
  --bl-ia-mute: var(--color-text-tertiary);
  --bl-ia-line: color-mix(in srgb, var(--color-text-primary) 28%, transparent);
  --bl-ia-rule: color-mix(in srgb, var(--color-text-primary) 22%, transparent);
  margin: 8px 0 0;
  color: var(--bl-ia-ink);
  -webkit-font-smoothing: antialiased;
}
.bl-ia-plate{
  position: relative;
  margin: 0;
  padding: 28px 18px 22px;
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
.bl-ia-kicker{
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 8px;
  background: var(--color-placeholder);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--bl-ia-mute);
  white-space: nowrap;
}

/* ── mobile: left-aligned file tree ── */
.bl-ia-board{ display: block; }
.bl-ia-from,
.bl-ia-tree,
.bl-ia-tree ul{
  list-style: none;
  margin: 0;
  padding: 0;
}
.bl-ia-from{
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.bl-ia-from s{
  text-decoration: line-through;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--bl-ia-mute);
}
.bl-ia-rails{ display: none; }
.bl-ia-join{
  width: 1px;
  height: 14px;
  margin: 6px 0 6px 3px;
  padding: 0;
  overflow: hidden;
  color: transparent;
  background: var(--bl-ia-line);
}
.bl-ia-app{
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 13px;
  position: relative;
}
.bl-ia-app::after{
  content: "";
  position: absolute;
  left: 3px;
  top: calc(100% + 2px);
  height: 6px;
  border-left: 1px solid var(--bl-ia-line);
}
.bl-ia-app-name{ font-weight: 600; letter-spacing: 0.04em; }
.bl-ia-app-rail{
  width: 18px;
  height: 0;
  border-top: 1px solid var(--bl-ia-line);
}
.bl-ia-list{
  font-weight: 500;
  color: color-mix(in srgb, var(--bl-ia-ink) 62%, transparent);
}
.bl-ia-tree{
  margin: 8px 0 0;
  padding: 0;
}
.bl-ia-tree > li{
  position: relative;
  padding: 0 0 8px 16px;
}
.bl-ia-tree > li:last-child{ padding-bottom: 0; }
.bl-ia-tree > li::before{
  content: "";
  position: absolute;
  left: 3px;
  top: 0;
  bottom: 0;
  border-left: 1px solid var(--bl-ia-line);
}
.bl-ia-tree > li:last-child::before{
  bottom: auto;
  height: 0.72em;
}
.bl-ia-tree > li::after{
  content: "";
  position: absolute;
  left: 3px;
  top: 0.72em;
  width: 11px;
  border-top: 1px solid var(--bl-ia-line);
}
.bl-ia-tab{
  font-weight: 600;
  letter-spacing: 0.04em;
}
.bl-ia-tree ul{
  margin: 1px 0 0;
  color: color-mix(in srgb, var(--bl-ia-ink) 58%, transparent);
}
.bl-ia-tree ul li{ padding: 1px 0; }

/* ── desktop: 4-column funnel, sources and tabs share columns ── */
@media (min-width: 768px){
  .bl-ia-plate{
    padding: 36px 24px 28px;
    font-size: 13px;
  }
  .bl-ia-board{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    justify-items: center;
    text-align: center;
  }
  .bl-ia-from{ display: contents; }
  .bl-ia-from li{ min-width: 0; }
  .bl-ia-join{ display: none; }

  .bl-ia-rails{
    display: block;
    grid-column: 1 / -1;
    position: relative;
    width: 100%;
    height: 28px;
  }
  .bl-ia-vs{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    height: 100%;
    justify-items: center;
  }
  .bl-ia-vs span{
    width: 1px;
    background: var(--bl-ia-line);
  }
  .bl-ia-h,
  .bl-ia-mid{
    position: absolute;
    pointer-events: none;
  }
  .bl-ia-h{
    left: 12.5%;
    right: 12.5%;
    height: 0;
    border-top: 1px solid var(--bl-ia-line);
  }
  .bl-ia-mid{
    left: 50%;
    width: 1px;
    background: var(--bl-ia-line);
    transform: translateX(-0.5px);
  }

  .bl-ia-converge .bl-ia-vs span{ height: 12px; }
  .bl-ia-converge .bl-ia-h{ top: 12px; }
  .bl-ia-converge .bl-ia-mid{ top: 12px; height: 16px; }

  .bl-ia-diverge .bl-ia-mid{ top: 0; height: 12px; }
  .bl-ia-diverge .bl-ia-h{ top: 12px; }
  .bl-ia-diverge .bl-ia-vs span{
    height: 16px;
    margin-top: 12px;
  }

  .bl-ia-app{
    grid-column: 1 / -1;
    justify-content: center;
    margin: 2px 0;
    font-size: 14px;
  }
  .bl-ia-app::after{ content: none; }
  .bl-ia-tree{ display: contents; }
  .bl-ia-tree > li{
    padding: 0;
    width: 100%;
  }
  .bl-ia-tree > li::before,
  .bl-ia-tree > li::after{ content: none; }
  .bl-ia-tree ul{ margin: 6px 0 0; }
}
`;
