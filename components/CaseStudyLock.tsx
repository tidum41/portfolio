"use client";

import { useState, type FormEvent } from "react";

/**
 * Quiet NDA gate. Any submitted password is rejected on the client.
 * There is no unlocked state and no hidden case-study body.
 */
export default function CaseStudyLock({
  title = "This case study is under NDA.",
  prompt = "Enter the password or email me for access.",
  email = "Mudit14.mahajan@gmail.com",
}: {
  title?: string;
  prompt?: string;
  email?: string;
}) {
  const [password, setPassword] = useState("");
  const [rejected, setRejected] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRejected(true);
  }

  const emailAt = prompt.indexOf("email me");
  const before = emailAt === -1 ? prompt : prompt.slice(0, emailAt);
  const after = emailAt === -1 ? "" : prompt.slice(emailAt + "email me".length);

  return (
    <div className="cs-lock" data-case-lock>
      <LockIcon />
      <p
        style={{
          fontFamily: "var(--font-sans-medium)",
          fontSize: 18,
          fontWeight: 500,
          lineHeight: 1.35,
          letterSpacing: "-0.2px",
          color: "var(--color-text-primary)",
          margin: "12px 0 8px",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "var(--fs-body)",
          lineHeight: "var(--lh-body)",
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        {emailAt === -1 ? (
          prompt
        ) : (
          <>
            {before}
            <a className="cs-person-link" href={`mailto:${email}`}>
              email me
            </a>
            {after}
          </>
        )}
      </p>
      <form className="cs-lock-form" onSubmit={onSubmit}>
        <input
          type="password"
          name="password"
          value={password}
          autoComplete="off"
          aria-label="Password"
          placeholder="Password"
          onChange={(event) => {
            setPassword(event.target.value);
            if (rejected) setRejected(false);
          }}
        />
        <button type="submit">Unlock</button>
      </form>
      {rejected && (
        <p role="alert" style={{ fontSize: 14, lineHeight: 1.45, color: "var(--color-text-secondary)", margin: "10px 0 0" }}>
          Incorrect password
        </p>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ color: "var(--color-text-tertiary)", display: "block" }}>
      <rect x="3.25" y="8" width="11.5" height="7.25" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6 8V5.75a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
