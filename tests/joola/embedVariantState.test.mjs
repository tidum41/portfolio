import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createEmbedVariantState,
  markVariantReady,
  markVariantTimedOut,
  preloadVariants,
  retryVariant,
  selectVariant,
  shouldShowSkeleton,
} from "../../lib/joola/embedVariantState.ts";

describe("embedVariantState", () => {
  it("preloads and marks ready on switch", () => {
    let state = createEmbedVariantState(["2", "3", "4"], "2");
    state = preloadVariants(state, ["2", "3", "4"]);
    assert.equal(state.byVariant["2"], "loading");
    assert.equal(state.byVariant["3"], "loading");
    state = markVariantReady(state, "2");
    assert.equal(shouldShowSkeleton(state, "2"), false);
    state = selectVariant(state, "3");
    assert.equal(state.selected, "3");
    assert.equal(shouldShowSkeleton(state, "3"), true);
    state = markVariantReady(state, "3");
    assert.equal(shouldShowSkeleton(state, "3"), false);
  });

  it("times out and retries", () => {
    let state = createEmbedVariantState(["split", "ledger"], "split");
    state = markVariantTimedOut(state, Date.now());
    assert.equal(state.byVariant.split, "error");
    assert.equal(shouldShowSkeleton(state, "split"), true);
    state = retryVariant(state);
    assert.equal(state.byVariant.split, "loading");
    assert.equal(state.errorAt, null);
  });
});
