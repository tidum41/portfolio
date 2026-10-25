"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import CopyEmail from "@/components/CopyEmail";
import { albums } from "@/components/embeds/cd-player/data/albums";
import {
  ABOUT_BIO,
  ABOUT_INTERESTS,
  EXPERIENCE,
  ORGS,
  SOCIALS,
} from "@/lib/about";

/*
 * About as a spec sheet (TASTE, Oct 25 2026): a strict 12 column grid on
 * --grid-max-w, labels in cols 1 to 3, content in cols 4 to 9 at one measure,
 * meta in cols 10 to 12 right aligned. Every row is ruled with a 1px top
 * hairline in --color-border-subtle and padded --space-3 top and bottom.
 * All copy is Mudit's existing About text, word for word; only the layout
 * changed. Media slots are one system: 1:1, 64px (48px under 640px),
 * --radius-card, 1px --color-border-subtle on --color-placeholder. No
 * fitting BruinLease line glyph exists for the interest rows, so their
 * slots are empty frames, per the brief's fallback.
 */

/** Compositor fade-up. Resting opacity is 1. One fade for the whole sheet. */
function Enter({
  children,
  playEnter,
  enterEpoch,
}: {
  children: ReactNode;
  playEnter: boolean;
  enterEpoch: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Finished CSS animations do not restart on the same node. Remove → reflow
  // → add on each non-Back About arrival so keep-alive visits still enter.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("ps3-enter");
    if (!playEnter) return;
    void el.offsetWidth;
    el.classList.add("ps3-enter");
  }, [playEnter, enterEpoch]);

  return (
    <div ref={ref} className={playEnter ? "ps3-enter" : undefined}>
      {children}
    </div>
  );
}

/** Live Los Angeles time for the hero's top right meta cell. The server
 *  renders a stable placeholder so hydration never mismatches. */
function LosAngelesTime() {
  const [label, setLabel] = useState("Los Angeles --:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const tick = () => setLabel(`Los Angeles ${fmt.format(new Date())}`);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-sm)",
        color: "var(--color-text-muted)",
        margin: 0,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {label}
    </p>
  );
}

const labelStyle: CSSProperties = {
  fontSize: "var(--fs-sm)",
  lineHeight: "var(--lh-body)",
  color: "var(--color-text-muted)",
  margin: 0,
};

const metaStyle: CSSProperties = {
  fontSize: "var(--fs-sm)",
  lineHeight: "var(--lh-body)",
  color: "var(--color-text-muted)",
  margin: 0,
  fontVariantNumeric: "tabular-nums",
};

const bodyTextStyle: CSSProperties = {
  fontSize: "var(--fs-body)",
  lineHeight: "var(--lh-body)",
  letterSpacing: "var(--ls-body)",
  color: "var(--color-text-secondary)",
  margin: 0,
};

function Row({
  label,
  meta,
  media = false,
  children,
}: {
  label?: string;
  meta?: string;
  /** Media rows center the label against the 64px frame instead of
   *  baseline aligning it to the frame's bottom edge. */
  media?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="about-row"
      style={media ? { alignItems: "center" } : undefined}
    >
      <p className="about-row__label" style={labelStyle}>
        {label ?? ""}
      </p>
      <div className="about-row__content">{children}</div>
      <p className="about-row__meta" style={metaStyle}>
        {meta ?? ""}
      </p>
    </div>
  );
}

function MediaSlot({ children }: { children?: ReactNode }) {
  return (
    <span className="about-media" aria-hidden={children ? undefined : true}>
      {children}
    </span>
  );
}

const album = albums[0];

export default function AboutPageContent({
  playEnter = false,
  enterEpoch = 0,
}: {
  visible?: boolean;
  playEnter?: boolean;
  enterEpoch?: number;
}) {
  return (
    <div
      style={{
        paddingInline: "var(--page-px)",
        paddingTop: "var(--space-5)",
        paddingBottom: "var(--space-9)",
        maxWidth: "var(--grid-max-w)",
        marginInline: "auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <style>{`
        .about-hero-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: var(--grid-gutter);
          align-items: start;
          margin-bottom: var(--space-5);
        }
        .about-hero-main { grid-column: 1 / 10; min-width: 0; }
        .about-hero-meta { grid-column: 10 / 13; text-align: right; }
        .about-row {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: var(--grid-gutter);
          align-items: baseline;
          padding-top: var(--space-3);
          padding-bottom: var(--space-3);
          border-top: 1px solid var(--color-border-subtle);
        }
        .about-row:last-child { border-bottom: 1px solid var(--color-border-subtle); }
        .about-row:hover { background: var(--color-accent-subtle); }
        .about-row__label { grid-column: 1 / 4; min-width: 0; }
        .about-row__content { grid-column: 4 / 10; min-width: 0; }
        .about-row__meta { grid-column: 10 / 13; text-align: right; }
        .about-row__with-media {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .about-media {
          display: block;
          flex: none;
          width: 64px;
          height: 64px;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-card);
          background: var(--color-placeholder);
          overflow: hidden;
        }
        .about-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .about-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-3);
        }
        .about-links a,
        .about-links button {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
        }
        @media (max-width: 767px) {
          .about-hero-main { grid-column: 1 / 13; }
          .about-hero-meta { grid-column: 1 / 13; text-align: left; margin-top: var(--space-2); }
          .about-row { grid-template-columns: 1fr auto; align-items: start; }
          .about-row__label { grid-column: 1 / -1; }
          .about-row__content { grid-column: 1; margin-top: var(--space-1); }
          .about-row__meta { grid-column: 2; text-align: left; margin-top: var(--space-1); margin-left: var(--space-2); }
        }
        @media (max-width: 639px) {
          .about-media { width: 48px; height: 48px; }
        }
      `}</style>
      <Enter playEnter={playEnter} enterEpoch={enterEpoch}>
        <header className="about-hero-grid">
          <div className="about-hero-main">
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--fs-hero)",
                fontWeight: 500,
                lineHeight: "var(--lh-h2)",
                letterSpacing: "-0.8px",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-2)",
              }}
            >
              Hello, I&apos;m Mudit
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--fs-lg)",
                lineHeight: "var(--lh-body)",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              B.S. Cognitive Science | UCLA &apos;27
            </p>
          </div>
          <div className="about-hero-meta">
            <LosAngelesTime />
          </div>
        </header>

        <div>
          <Row>
            <p style={{ ...bodyTextStyle, textWrap: "pretty" }}>{ABOUT_BIO}</p>
          </Row>

          {ABOUT_INTERESTS.map((item, i) => (
            <Row key={item} label={i === 0 ? "You can find me" : undefined} media>
              <div className="about-row__with-media">
                <MediaSlot />
                <p style={bodyTextStyle}>{item}</p>
              </div>
            </Row>
          ))}

          <Row label="Favorite Albums" media>
            <div className="about-row__with-media">
              <MediaSlot>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={album.artUrl} alt="" />
              </MediaSlot>
              <div>
                <p style={{ ...bodyTextStyle, color: "var(--color-text-primary)" }}>
                  {album.title}
                </p>
                <p
                  style={{
                    fontSize: "var(--fs-sm)",
                    lineHeight: "var(--lh-body)",
                    color: "var(--color-text-muted)",
                    margin: 0,
                  }}
                >
                  {album.artist}
                </p>
              </div>
            </div>
          </Row>

          <Row label="Social links">
            <nav aria-label="Social links" className="about-links">
              {SOCIALS.map((item) =>
                "copyEmail" in item ? (
                  <CopyEmail
                    key={item.label}
                    unstyled
                    className="nav-link about-social"
                    style={{
                      fontSize: "var(--fs-body)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.label}
                  </CopyEmail>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link about-social"
                    style={{
                      fontSize: "var(--fs-body)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>
          </Row>

          {EXPERIENCE.filter((e) => !("hidden" in e && e.hidden)).map(
            (exp, i) => {
              const href = "href" in exp ? exp.href : undefined;
              return (
                <Row
                  key={exp.company}
                  label={i === 0 ? "Experience" : undefined}
                  meta={exp.dates}
                >
                  <p
                    style={{
                      ...bodyTextStyle,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link about-link"
                        style={{ color: "inherit" }}
                      >
                        {exp.company}
                      </a>
                    ) : (
                      exp.company
                    )}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--fs-sm)",
                      lineHeight: "var(--lh-body)",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    {exp.role}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--fs-meta)",
                      lineHeight: 1.5,
                      color: "var(--color-text-secondary)",
                      margin: "8px 0 0",
                    }}
                  >
                    {exp.description}
                  </p>
                </Row>
              );
            },
          )}

          {ORGS.map((org, i) => {
            const href = "href" in org ? org.href : undefined;
            return (
              <Row
                key={org.name}
                label={i === 0 ? "Organizations" : undefined}
                meta={org.role}
              >
                <p style={{ ...bodyTextStyle, color: "var(--color-text-primary)" }}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link about-link"
                      style={{ color: "inherit" }}
                    >
                      {org.name}
                    </a>
                  ) : (
                    org.name
                  )}
                </p>
              </Row>
            );
          })}
        </div>
      </Enter>
    </div>
  );
}
