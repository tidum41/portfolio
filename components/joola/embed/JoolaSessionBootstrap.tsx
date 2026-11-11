"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { setDevConfig } from "@/vendor/joola-b2b-live/src/api/mock";
import { setPaused } from "@/vendor/joola-b2b-live/src/api/clock";
import { DEFAULT_CART } from "@/vendor/joola-b2b-live/src/data/ledger";
import { useStore } from "@/vendor/joola-b2b-live/src/state/Store";

export default function JoolaSessionBootstrap({
  role = "buyer",
  accountId = "dicks",
  screen = "quick-order",
  preloadCart = false,
}: {
  role?: "buyer" | "admin";
  accountId?: string;
  screen?: string;
  preloadCart?: boolean;
}) {
  const { session, bootstrapSession, switchAccount, replaceCart, cart } =
    useStore();
  useLayoutEffect(() => {
    if (preloadCart && cart.length === 0) {
      replaceCart(DEFAULT_CART);
    }
  }, [preloadCart, replaceCart, cart.length]);

  useEffect(() => {
    setDevConfig({
      view: role === "admin" ? "admin" : "portal",
      screen: screen as import("@/vendor/joola-b2b-live/src/api/mock").ScreenKey,
      state: "default",
      accountId,
      latencyMs: 0,
      failureRate: 0,
    });
    setPaused(false);

    if (!session || session.role !== role || session.accountId !== accountId) {
      bootstrapSession(
        role === "admin" ? "admin@joola.com" : "maya.okonkwo@dicks.com",
        role === "admin",
      );
      switchAccount(accountId);
    }

  }, [
    role,
    accountId,
    screen,
    session,
    bootstrapSession,
    switchAccount,
    preloadCart,
    replaceCart,
    cart.length,
  ]);

  return null;
}
