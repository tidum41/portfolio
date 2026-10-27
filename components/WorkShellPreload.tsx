"use client";

// Rendered by app/page.tsx only. It puts the Work shell's code into "/"'s own
// first-load scripts and registers it, so PersistentWorkShellGate renders it
// directly instead of through the lazy chunk it requests on every other route
// (on Slow 3G that request was a whole extra round trip before "/" hydrated).
import PersistentWorkShellImpl from "@/components/PersistentWorkShell";
import { registerWorkShell } from "@/lib/workShellRegistry";

registerWorkShell(PersistentWorkShellImpl);

export default function WorkShellPreload() {
  return null;
}
