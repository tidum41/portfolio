/**
 * Hover/idle intent to premount primary keep-alive shells without always
 * mounting About (CD/Geist) + Archive (BentoGallery) on every Work session.
 */

type Shell = "about" | "archive";

const listeners = new Set<(shell: Shell) => void>();
const requested = new Set<Shell>();

export function requestPrimaryShellPremount(shell: Shell) {
  if (requested.has(shell)) return;
  requested.add(shell);
  for (const cb of listeners) cb(shell);
}

export function subscribePrimaryShellPremount(cb: (shell: Shell) => void) {
  listeners.add(cb);
  for (const shell of requested) cb(shell);
  return () => {
    listeners.delete(cb);
  };
}
