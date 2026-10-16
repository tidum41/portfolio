"use client";

import Link from "next/link";
import { copy } from "../copy";

export default function DashboardClient() {
  return (
    <div className="dash-shell">
      <header className="dash-top">
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
        <Link href="/dev/joola-b2b/onboarding" className="btn-outline">
          {copy.dashboard.onboardingLink}
        </Link>
      </header>

      <main className="dash-main">
        <div className="dash-banner" role="status">
          {copy.dashboard.banner}
        </div>
        <h1 className="ob-title" style={{ marginTop: 24 }}>
          {copy.dashboard.title}
        </h1>
        <p className="ob-lede">{copy.dashboard.lede}</p>

        <div className="dash-toolbar">
          <input
            className="dash-search"
            type="search"
            placeholder={copy.dashboard.searchPlaceholder}
            aria-label={copy.dashboard.searchPlaceholder}
          />
          <button type="button" className="btn-outline">
            {copy.dashboard.uploadCsv}
          </button>
          <button type="button" className="btn-outline">
            {copy.dashboard.savedOrders}
          </button>
        </div>

        <p className="dash-credit tnum">{copy.dashboard.creditLeft}</p>

        <div className="empty-state" style={{ marginTop: 28 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-ui)",
              fontWeight: 500,
            }}
          >
            {copy.firstOrder.empty.title}
          </h2>
          <p>{copy.firstOrder.empty.body}</p>
          <span className="example-cta">{copy.firstOrder.empty.exampleCta}</span>
        </div>
      </main>
    </div>
  );
}
