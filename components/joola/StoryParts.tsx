import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Small story figures for the JOOLA case study (v10). Each makes one point and uses
 * site tokens only (see the `.jo-cs` block in globals.css).
 */

/* Preview strip: the two moments a skimmer should leave with. */
export type Preview = { side: string; title: string; href: string };

export function PreviewCards({ items }: { items: readonly Preview[] }) {
  return (
    <nav className="jo-preview" aria-label="Two moments on this page">
      {items.map((p, i) => (
        <a key={p.href} href={p.href} className="jo-preview__card">
          <span className="jo-preview__n jo-tnum">{String(i + 1).padStart(2, "0")}</span>
          <span className="jo-preview__side">{p.side}</span>
          <span className="jo-preview__title">{p.title}</span>
        </a>
      ))}
    </nav>
  );
}

/* Phase marker between the buyer's and the rep's halves of the page. */
export function PhaseMarker({ children }: { children: ReactNode }) {
  return (
    <p className="jo-phase">
      <span className="jo-phase__rule" aria-hidden="true" />
      <span>{children}</span>
      <span className="jo-phase__rule" aria-hidden="true" />
    </p>
  );
}

/* Impact: the order flow before the portal and with it, as two matching three-step panels. */
export type FlowPanel = {
  title: string;
  steps: readonly [string, string, string];
  /** Label on the dashed line that sends the order back to the first step. */
  back?: string;
  caption: string;
};

function DownArrow() {
  return (
    <svg className="jo-ba__arrow" width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
      <path d="M6 1v16M1.5 12.5 6 17l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BeforeAfter({ before, after, label }: { before: FlowPanel; after: FlowPanel; label: string }) {
  return (
    <figure className="jo-ba" aria-label={label}>
      {[before, after].map((p, pi) => (
        <div key={p.title} className={`jo-ba__panel${pi === 1 ? " is-after" : ""}`}>
          <p className="jo-ba__title">{p.title}</p>
          <div
            className={`jo-ba__flow${p.back ? " has-back" : ""}`}
            role="img"
            aria-label={`${p.title}: ${p.steps.join(", then ")}.${p.back ? ` Problems go back by ${p.back}.` : ""}`}
          >
            <ol className="jo-ba__steps" aria-hidden="true">
              {p.steps.map((step, i) => (
                <li key={step} className="jo-ba__step">
                  <span className={`jo-ba__node${i === 1 ? " is-key" : ""}`}>{step}</span>
                  {i < p.steps.length - 1 ? <DownArrow /> : null}
                </li>
              ))}
            </ol>
            {p.back ? (
              <div className="jo-ba__back" aria-hidden="true">
                <svg className="jo-ba__backline" viewBox="0 0 20 100" preserveAspectRatio="none">
                  <path d="M1 100H14V0H1" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
                </svg>
                <svg className="jo-ba__backhead" width="8" height="10" viewBox="0 0 8 10">
                  <path d="M6.5 1 1.5 5l5 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="jo-ba__backlabel">{p.back}</span>
              </div>
            ) : null}
          </div>
          <figcaption className="cs-figcaption jo-ba__caption">{p.caption}</figcaption>
        </div>
      ))}
    </figure>
  );
}

/* Quotes become rules: blurred quote snippets, an arrow, and the rule they led to. */
export type QuoteRule = { theme: string; quotes: readonly string[]; who: string; rule: string };

export function QuoteRules({ items, label }: { items: readonly QuoteRule[]; label: string }) {
  return (
    <div className="jo-qr" role="list" aria-label={label}>
      {items.map((q) => (
        <div key={q.theme} className="jo-qr__row" role="listitem">
          <div className="jo-qr__quotes">
            <p className="jo-qr__theme">{q.theme}</p>
            <div className="jo-qr__snips">
              {q.quotes.map((id) => (
                <span key={id} className="jo-qr__snip">
                  <Image className="jo-theme-light" src={`/images/joola/v10/quote-${id}-light.webp`} alt="" width={560} height={290} sizes="200px" />
                  <Image className="jo-theme-dark" src={`/images/joola/v10/quote-${id}-dark.webp`} alt="" width={560} height={290} sizes="200px" />
                </span>
              ))}
            </div>
          </div>
          <svg className="jo-qr__arrow" width="32" height="14" viewBox="0 0 32 14" aria-hidden="true">
            <path d="M1 7h28M23.5 1.5 29 7l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="jo-qr__rule">
            <p className="jo-qr__who">{q.who}</p>
            <p className="jo-qr__text">{q.rule}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* The decision as a question, answered in one or two lines. */
export function DecisionQA({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="jo-qa">
      <p className="jo-qa__q">{q}</p>
      <p className="jo-qa__a">{children}</p>
    </div>
  );
}

/* Options as plus and minus cards, the chosen one marked. */
export type OptionCard = { title: string; plus: string; minus: string; chosen?: boolean };

export function OptionCards({ options, label }: { options: readonly OptionCard[]; label: string }) {
  return (
    <ol className="jo-opts" aria-label={label}>
      {options.map((o, i) => (
        <li key={o.title} className={`jo-opts__card${o.chosen ? " is-chosen" : ""}`}>
          <p className="jo-opts__tag">{o.chosen ? "Chosen" : `Try ${i + 1}`}</p>
          <p className="jo-opts__title">{o.title}</p>
          <p className="jo-opts__line"><span className="jo-opts__sign" aria-label="Plus">+</span>{o.plus}</p>
          <p className="jo-opts__line"><span className="jo-opts__sign" aria-label="Minus">&minus;</span>{o.minus}</p>
        </li>
      ))}
    </ol>
  );
}

/* Versions as a timeline: small real captures with a one-line verdict each. */
export type TimelineItem = { tag: string; verdict: string; image: { src: string; width: number; height: number; alt: string } };

export function VersionTimeline({ items, label, children }: { items: readonly TimelineItem[]; label: string; children: ReactNode }) {
  return (
    <div className="jo-tl" aria-label={label} role="group">
      {items.map((t) => (
        <div key={t.tag} className="jo-tl__item">
          <div className="jo-tl__shot">
            <Image src={t.image.src} alt={t.image.alt} width={t.image.width} height={t.image.height} sizes="(max-width: 767px) 40vw, 160px" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <p className="jo-tl__tag">{t.tag}</p>
          <p className="jo-tl__verdict">{t.verdict}</p>
        </div>
      ))}
      <div className="jo-tl__final">{children}</div>
    </div>
  );
}

/* Two numbered callouts that sit beside a looping figure. */
export function Callouts({ items, small = false }: { items: readonly string[]; small?: boolean }) {
  return (
    <ol className={`jo-callouts${small ? " jo-callouts--sm" : ""}`}>
      {items.map((t, i) => (
        <li key={t}><span className="jo-marker jo-marker--inline" aria-hidden="true">{i + 1}</span><span>{t}</span></li>
      ))}
    </ol>
  );
}

/* The plain cost line: what is not known yet. */
export function OutcomeBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="jo-outbox">
      <p className="jo-outbox__title">{title}</p>
      <p className="jo-outbox__body">{children}</p>
    </div>
  );
}
