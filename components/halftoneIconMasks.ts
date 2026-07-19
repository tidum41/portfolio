// Mask-only copies of the nav icon SVGs, used solely to rasterize an alpha
// mask for the halftone dot bake (components/halftoneMask.ts buildIconMask).
// `stroke="currentColor"` isn't resolvable on a detached, unattached Image,
// and color is discarded anyway (only alpha is sampled) — so each is a
// literal copy of the real icon's markup with stroke hardcoded to opaque
// black instead.
//
// KEEP IN SYNC WITH ThemeToggle.tsx (SunIcon/MoonIcon) and
// VolumeControl.tsx (VolumeIcon/MutedIcon) — if a ray/line/path is ever
// added, removed, or moved on the real icon, this file must be updated by
// hand or the dot silhouette will silently drift from the real icon.

export const SUN_MASK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>`;

export const MOON_MASK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>`;

export const VOLUME_MASK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>`;

export const MUTED_MASK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>`;

// Inner-markup-only twins of the above (no outer <svg>, no hardcoded stroke)
// — used by HalftoneDotField to render a live "clone" of the icon *inside*
// the same goo-filtered <g> as the dots, so the crisp shape and the growing
// dots blur/threshold together as one mass instead of two independent
// layers crossfading. The clone inherits stroke/fill from its wrapping <g>
// (see HalftoneDotField.tsx), which is why these omit paint attributes
// entirely. Same KEEP IN SYNC obligation as the mask constants above.
export const SUN_CLONE_INNER =
  `<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />`;

export const MOON_CLONE_INNER =
  `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />`;

export const VOLUME_CLONE_INNER =
  `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />`;

export const MUTED_CLONE_INNER =
  `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />`;
