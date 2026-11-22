/**
 * Playground clock: pause holds pending work; step releases one event.
 * Used by the mock API and toast duration helpers.
 */

type Waiter = {
  id: number;
  resolve: () => void;
  label?: string;
};

let paused = false;
let nextId = 1;
const waiters: Waiter[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function isPaused() {
  return paused;
}

export function setPaused(next: boolean) {
  paused = next;
  document.documentElement.classList.toggle("is-paused", next);
  document.body.classList.toggle("is-paused", next);
  if (!next) {
    // Drain all waiters when unpausing so the flow resumes.
    while (waiters.length) {
      const w = waiters.shift();
      w?.resolve();
    }
  }
  emit();
}

export function subscribePause(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Resolves immediately unless paused; then waits for step or unpause. */
export function waitIfPaused(label?: string): Promise<void> {
  if (!paused) return Promise.resolve();
  return new Promise((resolve) => {
    waiters.push({ id: nextId++, resolve, label });
    emit();
  });
}

/** Advance one held event. Returns whether a waiter was released. */
export function stepForward(): boolean {
  const w = waiters.shift();
  if (!w) return false;
  w.resolve();
  emit();
  return true;
}

export function pendingCount() {
  return waiters.length;
}

export function getPauseSnapshot() {
  return { paused, pending: waiters.length };
}
