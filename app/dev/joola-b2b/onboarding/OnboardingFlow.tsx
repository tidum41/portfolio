"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { copy } from "../copy";

const TOTAL_STEPS = 4;

type ShipToId = (typeof copy.shipTos)[number]["id"] | null;

/** Buyer POs in this portal look like ENG-9812 (letters, hyphen, digits). */
const PO_PATTERN = /^[A-Za-z]{2,6}-\d{3,6}$/;

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [shipToId, setShipToId] = useState<ShipToId>(null);
  const [shipMenuOpen, setShipMenuOpen] = useState(false);
  const [po, setPo] = useState("");
  const [shipBy, setShipBy] = useState("");
  const [selectedPath, setSelectedPath] = useState<"search" | "csv" | "saved" | null>(
    null,
  );
  const [shipToError, setShipToError] = useState<string | null>(null);
  const [poError, setPoError] = useState<string | null>(null);
  const [shipByError, setShipByError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shipMenuId = useId();
  const poHelpId = useId();
  const poErrorId = useId();
  const shipHelpId = useId();
  const shipErrorId = useId();
  const shipByHelpId = useId();
  const shipByErrorId = useId();

  const selectedShip = copy.shipTos.find((s) => s.id === shipToId) ?? null;
  const isFinish = step === TOTAL_STEPS;

  useEffect(() => {
    // Move focus for screen readers without flashing a mouse focus ring.
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setShipMenuOpen(false);
  }

  function validatePo(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (!PO_PATTERN.test(trimmed)) return copy.defaults.po.errorFormat;
    return null;
  }

  function validateShipBy(value: string): string | null {
    if (!value) return null;
    if (value < todayISO()) return copy.defaults.shipBy.errorPast;
    return null;
  }

  function handlePoBlur() {
    setPoError(validatePo(po));
  }

  function handleShipByBlur() {
    setShipByError(validateShipBy(shipBy));
  }

  function handleContinue() {
    if (step === 1) {
      const nextPoError = validatePo(po);
      const nextShipByError = validateShipBy(shipBy);
      const nextShipError = shipToId ? null : copy.defaults.shipTo.errorMissing;
      setPoError(nextPoError);
      setShipByError(nextShipByError);
      setShipToError(nextShipError);
      if (nextPoError || nextShipByError || nextShipError) return;
    }
    if (step < TOTAL_STEPS) {
      go(step + 1);
    }
  }

  function handleFinish() {
    try {
      sessionStorage.setItem(
        "joola-b2b-onboarding",
        JSON.stringify({
          shipToId,
          po: po.trim(),
          shipBy,
          path: selectedPath,
          completedAt: new Date().toISOString(),
        }),
      );
    } catch {
      /* prototype only */
    }
    router.push("/dev/joola-b2b/dashboard");
  }

  function handleSkip() {
    router.push("/dev/joola-b2b/dashboard");
  }

  function pickShipTo(id: (typeof copy.shipTos)[number]["id"]) {
    setShipToId(id);
    setShipToError(null);
    setShipMenuOpen(false);
  }

  const progressCurrent = Math.min(step + 1, TOTAL_STEPS);

  return (
    <div className="ob-shell">
      <header className="ob-top">
        <div className="ob-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dev/joola-b2b/joola-logo.png"
            alt="JOOLA"
            width={100}
            height={22}
          />
          <span className="ob-wholesale">{copy.brand.wholesale}</span>
        </div>
        {!isFinish && (
          <button type="button" className="ob-skip" onClick={handleSkip}>
            {copy.chrome.skip}
          </button>
        )}
      </header>

      {!isFinish && (
        <div className="ob-progress-wrap">
          <ol
            className="ob-progress"
            aria-label={copy.chrome.progressLabel}
          >
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <li
                key={i}
                className={
                  i < step ? "is-done" : i === step ? "is-current" : undefined
                }
                aria-current={i === step ? "step" : undefined}
              >
                <span />
              </li>
            ))}
          </ol>
          <p className="ob-progress-label">
            {copy.chrome.stepOf(progressCurrent, TOTAL_STEPS)}
          </p>
        </div>
      )}

      <main className="ob-main">
        <div
          key={`${step}-${direction}`}
          className="ob-step"
          aria-live="polite"
        >
          {step === 0 && <WelcomeStep headingRef={headingRef} />}
          {step === 1 && (
            <DefaultsStep
              headingRef={headingRef}
              shipToId={shipToId}
              selectedShip={selectedShip}
              shipMenuOpen={shipMenuOpen}
              setShipMenuOpen={setShipMenuOpen}
              shipMenuId={shipMenuId}
              shipHelpId={shipHelpId}
              shipErrorId={shipErrorId}
              shipToError={shipToError}
              pickShipTo={pickShipTo}
              po={po}
              setPo={(v) => {
                setPo(v);
                if (poError) setPoError(null);
              }}
              poHelpId={poHelpId}
              poErrorId={poErrorId}
              poError={poError}
              onPoBlur={handlePoBlur}
              shipBy={shipBy}
              setShipBy={(v) => {
                setShipBy(v);
                if (shipByError) setShipByError(null);
              }}
              shipByHelpId={shipByHelpId}
              shipByErrorId={shipByErrorId}
              shipByError={shipByError}
              onShipByBlur={handleShipByBlur}
            />
          )}
          {step === 2 && <TermsStep headingRef={headingRef} />}
          {step === 3 && (
            <FirstOrderStep
              headingRef={headingRef}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
            />
          )}
          {isFinish && <FinishStep headingRef={headingRef} />}
        </div>
      </main>

      <footer className="ob-footer">
        {step > 0 && !isFinish ? (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => go(step - 1)}
          >
            {copy.chrome.back}
          </button>
        ) : (
          <span />
        )}
        <div className="ob-footer-actions">
          {isFinish ? (
            <button
              type="button"
              className="btn-primary btn-success"
              style={{ backgroundColor: "#12824a" }}
              onClick={handleFinish}
            >
              {copy.finish.cta}
            </button>
          ) : step === 1 ? (
            <button type="button" className="btn-primary" onClick={handleContinue}>
              {copy.chrome.saveDefaults}
            </button>
          ) : step === 0 ? (
            <button type="button" className="btn-primary" onClick={handleContinue}>
              {copy.welcome.cta}
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => go(TOTAL_STEPS)}
            >
              {copy.chrome.finish}
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleContinue}>
              {copy.chrome.continue}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function WelcomeStep({
  headingRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <section aria-labelledby="ob-welcome-title">
      <h1
        id="ob-welcome-title"
        className="ob-title"
        ref={headingRef}
        tabIndex={-1}
      >
        {copy.welcome.title}
      </h1>
      <p className="ob-lede">{copy.welcome.lede}</p>
      <ul className="benefit-list">
        {copy.welcome.benefits.map((b, i) => (
          <li key={b.title}>
            <span className="benefit-num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <p className="benefit-title">{b.title}</p>
              <p className="benefit-body">{b.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="rep-chip">
        <span className="rep-avatar" aria-hidden="true">
          CJ
        </span>
        <div>
          <div className="rep-name">{copy.brand.repName}</div>
          <div className="rep-role">{copy.brand.repRole}</div>
        </div>
      </div>
    </section>
  );
}

function DefaultsStep({
  headingRef,
  shipToId,
  selectedShip,
  shipMenuOpen,
  setShipMenuOpen,
  shipMenuId,
  shipHelpId,
  shipErrorId,
  shipToError,
  pickShipTo,
  po,
  setPo,
  poHelpId,
  poErrorId,
  poError,
  onPoBlur,
  shipBy,
  setShipBy,
  shipByHelpId,
  shipByErrorId,
  shipByError,
  onShipByBlur,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  shipToId: ShipToId;
  selectedShip: (typeof copy.shipTos)[number] | null;
  shipMenuOpen: boolean;
  setShipMenuOpen: (open: boolean) => void;
  shipMenuId: string;
  shipHelpId: string;
  shipErrorId: string;
  shipToError: string | null;
  pickShipTo: (id: (typeof copy.shipTos)[number]["id"]) => void;
  po: string;
  setPo: (v: string) => void;
  poHelpId: string;
  poErrorId: string;
  poError: string | null;
  onPoBlur: () => void;
  shipBy: string;
  setShipBy: (v: string) => void;
  shipByHelpId: string;
  shipByErrorId: string;
  shipByError: string | null;
  onShipByBlur: () => void;
}) {
  return (
    <section aria-labelledby="ob-defaults-title">
      <h1
        id="ob-defaults-title"
        className="ob-title"
        ref={headingRef}
        tabIndex={-1}
      >
        {copy.defaults.title}
      </h1>
      <p className="ob-lede">{copy.defaults.lede}</p>

      <div className="field-stack">
        <div
          className={`field${shipToError ? " is-invalid" : ""}`}
          data-field="ship-to"
        >
          <span className="field-label" id={`${shipHelpId}-label`}>
            {copy.defaults.shipTo.label}
          </span>
          <p className="field-helper" id={shipHelpId}>
            {copy.defaults.shipTo.helper}
          </p>
          <button
            type="button"
            className={`ship-card${shipMenuOpen ? " is-open" : ""}`}
            aria-labelledby={`${shipHelpId}-label`}
            aria-describedby={
              shipToError ? `${shipHelpId} ${shipErrorId}` : shipHelpId
            }
            aria-expanded={shipMenuOpen}
            aria-controls={shipMenuId}
            onClick={() => setShipMenuOpen(!shipMenuOpen)}
          >
            <div className="ship-card-body">
              {selectedShip ? (
                <>
                  <div className="ship-name">
                    {selectedShip.name}
                    <span className="ship-tag">{selectedShip.site}</span>
                  </div>
                  <div className="ship-addr">{selectedShip.detail}</div>
                </>
              ) : (
                <>
                  <div className="ship-name">
                    {copy.defaults.shipTo.emptyPrompt}
                  </div>
                  <div className="ship-addr">
                    {copy.defaults.shipTo.emptyHint}
                  </div>
                </>
              )}
            </div>
            <span className="ship-change">{copy.defaults.shipTo.change}</span>
          </button>
          {shipMenuOpen && (
            <div
              className="ship-menu"
              id={shipMenuId}
              role="listbox"
              aria-label={copy.defaults.shipTo.menuLabel}
            >
              {copy.shipTos.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  role="option"
                  aria-selected={shipToId === addr.id}
                  className={`ship-option${shipToId === addr.id ? " is-selected" : ""}`}
                  onClick={() => pickShipTo(addr.id)}
                >
                  <div className="ship-name">
                    {addr.name}
                    <span className="ship-tag">{addr.site}</span>
                  </div>
                  <div className="ship-addr">{addr.detail}</div>
                </button>
              ))}
            </div>
          )}
          <div aria-live="polite" aria-atomic="true">
            {shipToError && (
              <p className="field-error" id={shipErrorId} role="alert">
                {shipToError}
              </p>
            )}
          </div>
        </div>

        <div className={`field${poError ? " is-invalid" : ""}`}>
          <div className="field-label-row">
            <label htmlFor="ob-po">{copy.defaults.po.label}</label>
            <span className="field-optional">{copy.defaults.po.optional}</span>
          </div>
          <p className="field-helper" id={poHelpId}>
            {copy.defaults.po.helper}
          </p>
          <input
            id="ob-po"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={copy.defaults.po.placeholder}
            value={po}
            onChange={(e) => {
              setPo(e.target.value);
            }}
            onBlur={onPoBlur}
            aria-invalid={!!poError}
            aria-describedby={poError ? `${poHelpId} ${poErrorId}` : poHelpId}
          />
          <div aria-live="polite" aria-atomic="true">
            {poError && (
              <p className="field-error" id={poErrorId} role="alert">
                {poError}
              </p>
            )}
          </div>
        </div>

        <div className={`field${shipByError ? " is-invalid" : ""}`}>
          <label htmlFor="ob-ship-by">{copy.defaults.shipBy.label}</label>
          <p className="field-helper" id={shipByHelpId}>
            {copy.defaults.shipBy.helper}
          </p>
          <input
            id="ob-ship-by"
            type="date"
            min={todayISO()}
            value={shipBy}
            onChange={(e) => {
              setShipBy(e.target.value);
            }}
            onBlur={onShipByBlur}
            aria-invalid={!!shipByError}
            aria-describedby={
              shipByError ? `${shipByHelpId} ${shipByErrorId}` : shipByHelpId
            }
          />
          <div aria-live="polite" aria-atomic="true">
            {shipByError && (
              <p className="field-error" id={shipByErrorId} role="alert">
                {shipByError}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TermsStep({
  headingRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <section aria-labelledby="ob-terms-title">
      <h1
        id="ob-terms-title"
        className="ob-title"
        ref={headingRef}
        tabIndex={-1}
      >
        {copy.terms.title}
      </h1>
      <p className="ob-lede">{copy.terms.lede}</p>

      <div className="term-blocks">
        <article className="term-block">
          <p className="term-kicker">{copy.terms.net30.label}</p>
          <h2 className="term-title">{copy.terms.net30.title}</h2>
          <p className="term-body">{copy.terms.net30.body}</p>
        </article>

        <article className="term-block">
          <p className="term-kicker">{copy.terms.credit.label}</p>
          <h2 className="term-title">{copy.terms.credit.title}</h2>
          <p className="term-body">{copy.terms.credit.body}</p>
          <div className="credit-meter">
            <div className="credit-meter-label">
              <span>Net 30</span>
              <span className="avail tnum">{copy.terms.credit.meter}</span>
            </div>
            <div className="credit-bar" aria-hidden="true">
              <span />
            </div>
          </div>
        </article>

        <article className="term-block">
          <p className="term-kicker">{copy.terms.shipDate.label}</p>
          <span className="pending-tag">{copy.terms.shipDate.pendingTag}</span>
          <p className="confirm-lede">
            {copy.terms.shipDate.confirmLedeBefore}
            <button type="button" className="inline-link">
              {copy.terms.shipDate.confirmLedeLink}
            </button>
            {copy.terms.shipDate.confirmLedeAfter}
          </p>
          <p className="term-body">{copy.terms.shipDate.body}</p>
        </article>
      </div>
    </section>
  );
}

function FirstOrderStep({
  headingRef,
  selectedPath,
  setSelectedPath,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  selectedPath: "search" | "csv" | "saved" | null;
  setSelectedPath: (p: "search" | "csv" | "saved") => void;
}) {
  const paths = [
    { id: "search" as const, ...copy.firstOrder.paths.search },
    { id: "csv" as const, ...copy.firstOrder.paths.csv },
    { id: "saved" as const, ...copy.firstOrder.paths.saved },
  ];

  return (
    <section aria-labelledby="ob-first-title">
      <h1
        id="ob-first-title"
        className="ob-title"
        ref={headingRef}
        tabIndex={-1}
      >
        {copy.firstOrder.title}
      </h1>
      <p className="ob-lede">{copy.firstOrder.lede}</p>

      <div className="path-grid" role="group" aria-label={copy.firstOrder.title}>
        {paths.map((path) => (
          <button
            key={path.id}
            type="button"
            className={`path-card${selectedPath === path.id ? " is-selected" : ""}`}
            aria-pressed={selectedPath === path.id}
            onClick={() => setSelectedPath(path.id)}
          >
            <span className="path-title">{path.title}</span>
            <span className="path-body">{path.body}</span>
            <span className="path-cta">{path.cta}</span>
          </button>
        ))}
      </div>

      <div className="empty-state">
        <h3>{copy.firstOrder.empty.title}</h3>
        <p>{copy.firstOrder.empty.body}</p>
        <span className="example-cta">{copy.firstOrder.empty.exampleCta}</span>
      </div>
    </section>
  );
}

function FinishStep({
  headingRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <section aria-labelledby="ob-finish-title">
      <div className="finish-check" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5 10 17.5 19 7.5" />
        </svg>
      </div>
      <h1
        id="ob-finish-title"
        className="ob-title"
        ref={headingRef}
        tabIndex={-1}
      >
        {copy.finish.title}
      </h1>
      <p className="ob-lede">{copy.finish.lede}</p>
    </section>
  );
}
