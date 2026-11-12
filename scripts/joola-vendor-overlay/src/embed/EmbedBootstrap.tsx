import { useEffect, useLayoutEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { setDevConfig, type ScreenKey } from "../api/mock";
import { setPaused } from "../api/clock";
import { DEFAULT_CART } from "../data/ledger";
import { useStore } from "../state/Store";
import {
  attachCaseStudyEmbedMode,
  caseStudyEmbedFromSearch,
} from "./caseStudyEmbedMode";
import { attachEmbedHeightReporter } from "./reportEmbedHeight";

/** Portfolio iframe mode: seed session + mock config; no login or playground chrome. */
export function EmbedBootstrap() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { session, bootstrapSession, switchAccount, replaceCart, cart } = useStore();

  useLayoutEffect(() => {
    document.documentElement.classList.add("is-embed");
    const stopHeight = attachEmbedHeightReporter();
    const stopCs = caseStudyEmbedFromSearch(params)
      ? attachCaseStudyEmbedMode()
      : () => {};
    return () => {
      stopCs();
      stopHeight();
      document.documentElement.classList.remove("is-embed");
    };
  }, [params]);

  useEffect(() => {
    const view =
      params.get("view") === "admin" ? ("admin" as const) : ("portal" as const);
    const screen = (params.get("screen") ?? "quick-order") as ScreenKey;
    const accountId = params.get("account") ?? "dicks";
    setDevConfig({
      view,
      screen,
      state: "default",
      accountId,
      latencyMs: 0,
      failureRate: 0,
    });
    setPaused(false);
  }, [params]);

  useEffect(() => {
    const wantAdmin = params.get("view") === "admin";
    const accountId = params.get("account") ?? "dicks";
    const roleOk = wantAdmin
      ? session?.role === "admin"
      : Boolean(session && session.role === "buyer");

    if (!roleOk) {
      bootstrapSession(
        wantAdmin ? "admin@joola.com" : "maya.okonkwo@dicks.com",
        wantAdmin,
      );
      switchAccount(accountId);
    } else if (session && session.accountId !== accountId) {
      switchAccount(accountId);
    }
  }, [params, session, bootstrapSession, switchAccount]);

  useEffect(() => {
    if (!pathname.includes("/review")) return;
    if (cart.length === 0) replaceCart(DEFAULT_CART);
  }, [pathname, cart.length, replaceCart]);

  return null;
}
