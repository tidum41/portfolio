"use client";

import { useEffect } from "react";
import {
  FILM_CONTROL_LABELS,
  FILM_CONTROL_NOTES,
} from "./film-control-meta";

const NOTE_ATTR = "data-rpg-note";
const PATH_ATTR = "data-rpg-path";
const ACTIVE_CLASS = "rpg-dial-active";
const DIM_CLASS = "rpg-dial-dimmed";
const NOTE_CLASS = "rpg-dial-note";
const NOTE_SLOT_CLASS = "rpg-dial-note-slot";
const ROW_CLASS = "rpg-dial-row";

function labelText(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim();
  const labeled = el.querySelector(
    ".dialkit-slider-label, .dialkit-labeled-control-label, .dialkit-select-label, .dialkit-folder-title",
  );
  return (labeled?.textContent || "").replace(/\s+/g, " ").trim();
}

function nearestFolderTitle(el: Element): string | null {
  let node: Element | null = el.parentElement;
  while (node) {
    if (
      node.classList.contains("dialkit-folder") &&
      !node.classList.contains("dialkit-folder-root") &&
      !node.classList.contains("dialkit-folder-section")
    ) {
      const title = node.querySelector(
        ":scope > .dialkit-folder-header .dialkit-folder-title",
      );
      const text = (title?.textContent || "").trim();
      if (text) return text;
    }
    if (node.classList.contains("dialkit-folder-section")) {
      return null;
    }
    node = node.parentElement;
  }
  return null;
}

function resolvePath(el: Element): string | null {
  const label = labelText(el);
  if (!label) return null;
  const folder = nearestFolderTitle(el);
  for (const [path, meta] of Object.entries(FILM_CONTROL_LABELS)) {
    if (meta.label !== label) continue;
    if ((meta.folder || null) === folder) return path;
  }
  for (const [path, meta] of Object.entries(FILM_CONTROL_LABELS)) {
    if (!meta.folder && meta.label === label) return path;
  }
  return null;
}

function controlRoots(panel: Element): HTMLElement[] {
  const roots: HTMLElement[] = [];
  panel
    .querySelectorAll<HTMLElement>(
      ".dialkit-slider-wrapper, .dialkit-labeled-control, .dialkit-text-control, .dialkit-select-row",
    )
    .forEach((el) => {
      // Skip nodes already moved inside a shell's control slot
      if (el.closest(`.${ROW_CLASS}`) && !el.parentElement?.classList.contains(ROW_CLASS)) {
        return;
      }
      roots.push(el);
    });
  return roots;
}

/**
 * Wrap the DialKit control in an outer shell so the note can sit *under*
 * the row in normal flow. DialKit sliders are position:absolute inside a
 * fixed-height wrapper — putting the note inside that wrapper painted it
 * over the Zoom track.
 */
function ensureShell(control: HTMLElement): HTMLElement {
  if (control.parentElement?.classList.contains(ROW_CLASS)) {
    return control.parentElement;
  }
  const shell = document.createElement("div");
  shell.className = ROW_CLASS;
  control.parentElement!.insertBefore(shell, control);
  shell.appendChild(control);
  return shell;
}

function ensureNote(shell: HTMLElement, text: string) {
  let slot = shell.querySelector<HTMLElement>(`:scope > .${NOTE_SLOT_CLASS}`);
  if (!slot) {
    slot = document.createElement("div");
    slot.className = NOTE_SLOT_CLASS;
    const note = document.createElement("div");
    note.className = NOTE_CLASS;
    note.setAttribute("role", "note");
    slot.appendChild(note);
    shell.appendChild(slot);
  }
  const note = slot.querySelector<HTMLElement>(`:scope > .${NOTE_CLASS}`);
  if (note && note.textContent !== text) note.textContent = text;
}

function clearActive(panel: HTMLElement) {
  panel.classList.remove(DIM_CLASS);
  panel.querySelectorAll(`.${ACTIVE_CLASS}`).forEach((el) => {
    el.classList.remove(ACTIVE_CLASS);
  });
}

function activateRow(panel: HTMLElement, row: HTMLElement) {
  panel.classList.add(DIM_CLASS);
  panel.querySelectorAll(`.${ACTIVE_CLASS}`).forEach((el) => {
    el.classList.remove(ACTIVE_CLASS);
  });
  row.classList.add(ACTIVE_CLASS);
}

/**
 * Hover / focus explanations on Film* DialKit rows, plus keep conditional
 * folders annotated for CSS slide show/hide driven by camEase.
 */
export function useFilmDialExtras(camEase: string) {
  useEffect(() => {
    const bindPanel = (panel: HTMLElement) => {
      const controls = controlRoots(panel);
      for (const control of controls) {
        const path = resolvePath(control);
        if (!path) continue;
        const note = FILM_CONTROL_NOTES[path];
        if (!note) continue;

        const shell = ensureShell(control);
        shell.setAttribute(PATH_ATTR, path);
        shell.setAttribute(NOTE_ATTR, note);
        ensureNote(shell, note);

        if (shell.dataset.rpgBound === "1") continue;
        shell.dataset.rpgBound = "1";

        const onEnter = () => activateRow(panel, shell);
        const onLeave = (e: FocusEvent | MouseEvent) => {
          const next = (e as FocusEvent).relatedTarget as Node | null;
          if (next && shell.contains(next)) return;
          if (next && panel.contains(next)) {
            const nextRow = (next as Element).closest?.(
              "." + ROW_CLASS,
            ) as HTMLElement | null;
            if (nextRow && nextRow !== shell) return;
          }
          clearActive(panel);
        };

        shell.addEventListener("pointerenter", onEnter);
        shell.addEventListener("focusin", onEnter);
        shell.addEventListener("pointerleave", onLeave);
        shell.addEventListener("focusout", onLeave);
      }
    };

    const annotateConditionalFolders = () => {
      document
        .querySelectorAll<HTMLElement>(".dialkit-folder-section")
        .forEach((section) => {
          const title = (
            section.querySelector(
              ":scope > .dialkit-folder-header .dialkit-folder-title",
            )?.textContent || ""
          ).trim();
          if (title !== "Film Timing") return;

          section
            .querySelectorAll<HTMLElement>(
              ":scope .dialkit-folder:not(.dialkit-folder-section):not(.dialkit-folder-root)",
            )
            .forEach((folder) => {
              const name = (
                folder.querySelector(
                  ":scope > .dialkit-folder-header .dialkit-folder-title",
                )?.textContent || ""
              ).trim();
              if (name === "Open Push") {
                folder.dataset.rpgWhen = "cam";
                folder.classList.add("rpg-dial-conditional");
              } else if (name === "Mid Film") {
                folder.dataset.rpgWhen = "flow";
                folder.classList.add("rpg-dial-conditional");
              } else if (name === "Confirm") {
                folder.dataset.rpgWhen = "move";
                folder.classList.add("rpg-dial-conditional");
              }
            });
        });
    };

    const sync = () => {
      document.querySelectorAll<HTMLElement>(".dialkit-panel").forEach(bindPanel);
      annotateConditionalFolders();
      document.documentElement.dataset.rpgCamEase = camEase;
    };

    sync();
    const obs = new MutationObserver(() => sync());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      obs.disconnect();
      document.querySelectorAll<HTMLElement>(".dialkit-panel").forEach((p) => {
        clearActive(p);
      });
      delete document.documentElement.dataset.rpgCamEase;
    };
  }, [camEase]);
}
