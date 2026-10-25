import AboutPageContent from "@/components/AboutPageContent";
import { albums } from "@/components/embeds/cd-player/data/albums";
import {
  ABOUT_BIO,
  ABOUT_INTERESTS,
  EXPERIENCE,
  ORGS,
  SOCIALS,
} from "@/lib/about";
import "./about-variants.css";

/*
 * Static About layout variants for review (no animation, no hover states).
 * All copy comes from lib/about and the album data, word for word. Media are
 * neutral placeholders with fixed ratios; no repo photos, nothing rotated.
 */

const album = albums[0];
const experience = EXPERIENCE.filter((e) => !("hidden" in e && e.hidden));
const HELLO = "Hello, I\u2019m Mudit";
const DEGREE = "B.S. Cognitive Science | UCLA \u201927";

function Ph({ ratio, className }: { ratio: "4:5" | "1:1" | "3:2"; className?: string }) {
  const [w, h] = ratio.split(":");
  return (
    <div
      className={`av-ph ${className ?? ""}`}
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-hidden
    >
      <span>photo {ratio}</span>
    </div>
  );
}

function Socials() {
  return (
    <ul className="av-links">
      {SOCIALS.map((s) => (
        <li key={s.label}>
          {"href" in s && s.href ? <a href={s.href}>{s.label}</a> : <span>{s.label}</span>}
        </li>
      ))}
    </ul>
  );
}

function VariantLabel({ id, name }: { id: string; name: string }) {
  return (
    <div className="av-label">
      <span>{id}</span>
      <span>{name}</span>
    </div>
  );
}

/* A: spec sheet, cleaned. Same rows as the live page, no hover, one row rhythm. */
function VariantA() {
  return (
    <section className="av av-a">
      <header className="av-grid av-a-hero">
        <div className="av-a-main">
          <h1 className="av-h1">{HELLO}</h1>
          <p className="av-serif">{DEGREE}</p>
        </div>
        <Ph ratio="4:5" className="av-a-portrait" />
      </header>
      <div className="av-grid av-a-row">
        <p className="av-a-l" />
        <p className="av-a-c av-body">{ABOUT_BIO}</p>
      </div>
      {ABOUT_INTERESTS.map((t, i) => (
        <div className="av-grid av-a-row" key={t}>
          <p className="av-a-l av-muted">{i === 0 ? "You can find me" : ""}</p>
          <p className="av-a-c av-body">{t}</p>
        </div>
      ))}
      <div className="av-grid av-a-row">
        <p className="av-a-l av-muted">Favorite Albums</p>
        <div className="av-a-c av-a-media">
          <Ph ratio="1:1" className="av-thumb" />
          <div>
            <p className="av-body av-strong">{album.title}</p>
            <p className="av-muted">{album.artist}</p>
          </div>
        </div>
      </div>
      <div className="av-grid av-a-row">
        <p className="av-a-l av-muted">Social links</p>
        <div className="av-a-c"><Socials /></div>
      </div>
      {experience.map((e, i) => (
        <div className="av-grid av-a-row" key={e.company}>
          <p className="av-a-l av-muted">{i === 0 ? "Experience" : ""}</p>
          <div className="av-a-c">
            <p className="av-body av-strong">{e.company}</p>
            <p className="av-muted">{e.role}</p>
            <p className="av-body av-sec">{e.description}</p>
          </div>
          <p className="av-a-m av-muted">{e.dates}</p>
        </div>
      ))}
      {ORGS.map((o, i) => (
        <div className="av-grid av-a-row" key={o.name}>
          <p className="av-a-l av-muted">{i === 0 ? "Organizations" : ""}</p>
          <p className="av-a-c av-body av-strong">{o.name}</p>
          <p className="av-a-m av-muted">{o.role}</p>
        </div>
      ))}
    </section>
  );
}

/* B: editorial column. One measure for text and figures, 120px between sections. */
function VariantB() {
  return (
    <section className="av av-b">
      <div className="av-b-col">
        <div className="av-b-sec">
          <h1 className="av-h1">{HELLO}</h1>
          <p className="av-serif">{DEGREE}</p>
          <figure className="av-card"><Ph ratio="3:2" /></figure>
          <p className="av-body">{ABOUT_BIO}</p>
        </div>
        <div className="av-b-sec">
          <h2 className="av-h2">You can find me</h2>
          <ul className="av-b-list">
            {ABOUT_INTERESTS.map((t) => <li key={t} className="av-body">{t}</li>)}
          </ul>
          <div className="av-b-pair">
            <figure className="av-card"><Ph ratio="4:5" /></figure>
            <figure className="av-card"><Ph ratio="4:5" /></figure>
          </div>
        </div>
        <div className="av-b-sec">
          <h2 className="av-h2">Experience</h2>
          {experience.map((e) => (
            <div className="av-b-item" key={e.company}>
              <div className="av-b-itemhead">
                <p className="av-body av-strong">{e.company}</p>
                <p className="av-muted">{e.dates}</p>
              </div>
              <p className="av-muted">{e.role}</p>
              <p className="av-body av-sec">{e.description}</p>
            </div>
          ))}
        </div>
        <div className="av-b-sec">
          <h2 className="av-h2">Organizations</h2>
          {ORGS.map((o) => (
            <div className="av-b-item av-b-itemhead" key={o.name}>
              <p className="av-body av-strong">{o.name}</p>
              <p className="av-muted">{o.role}</p>
            </div>
          ))}
        </div>
        <div className="av-b-sec">
          <h2 className="av-h2">Favorite Albums</h2>
          <div className="av-a-media">
            <figure className="av-card av-b-album"><Ph ratio="1:1" /></figure>
            <div>
              <p className="av-body av-strong">{album.title}</p>
              <p className="av-muted">{album.artist}</p>
            </div>
          </div>
          <h2 className="av-h2 av-b-gap">Social links</h2>
          <Socials />
        </div>
      </div>
    </section>
  );
}

/* C: quiet 12 column grid. One strip of 4 equal placeholders, facts in columns. */
function VariantC() {
  return (
    <section className="av av-c">
      <header className="av-grid">
        <div className="av-c-title">
          <h1 className="av-h1">{HELLO}</h1>
          <p className="av-serif">{DEGREE}</p>
        </div>
        <p className="av-c-bio av-body">{ABOUT_BIO}</p>
      </header>
      <div className="av-c-strip">
        {[0, 1, 2, 3].map((i) => <Ph key={i} ratio="4:5" />)}
      </div>
      <div className="av-grid av-c-facts">
        <div className="av-c-col">
          <p className="av-muted av-c-head">Experience</p>
          {experience.map((e) => (
            <div className="av-c-item" key={e.company}>
              <p className="av-body av-strong">{e.company}</p>
              <p className="av-muted">{e.role}, {e.dates}</p>
            </div>
          ))}
        </div>
        <div className="av-c-col">
          <p className="av-muted av-c-head">Organizations</p>
          {ORGS.map((o) => (
            <div className="av-c-item" key={o.name}>
              <p className="av-body av-strong">{o.name}</p>
              <p className="av-muted">{o.role}</p>
            </div>
          ))}
        </div>
        <div className="av-c-col">
          <p className="av-muted av-c-head">You can find me</p>
          {ABOUT_INTERESTS.map((t) => (
            <p className="av-body av-c-item" key={t}>{t}</p>
          ))}
        </div>
        <div className="av-c-col">
          <p className="av-muted av-c-head">Favorite Albums</p>
          <div className="av-c-item">
            <p className="av-body av-strong">{album.title}</p>
            <p className="av-muted">{album.artist}</p>
          </div>
          <p className="av-muted av-c-head av-c-gap">Social links</p>
          <Socials />
        </div>
      </div>
    </section>
  );
}

export default function AboutVariantsPage() {
  return (
    <main className="av-page">
      <VariantLabel id="A" name="Spec sheet, cleaned" />
      <VariantA />
      <VariantLabel id="B" name="Editorial column" />
      <VariantB />
      <VariantLabel id="C" name="Quiet grid" />
      <VariantC />
      <VariantLabel id="Ref" name="Current About (spec sheet, live)" />
      <AboutPageContent />
    </main>
  );
}
