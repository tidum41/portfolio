export type SiteTheme = "light" | "dark";

function writeTheme(theme: SiteTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode */
  }
}

/** Drop color tweens for the next paint. Call before a theme write that is
 *  not already inside a view-transition update callback. */
export function armThemeSwitch(): void {
  const html = document.documentElement;
  html.classList.add("theme-switching");
  void html.offsetWidth;
}

export function commitTheme(theme: SiteTheme): void {
  document.documentElement.classList.add("theme-switching");
  writeTheme(theme);
}

export function releaseThemeSwitch(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("theme-switching");
    });
  });
}

export function applyThemeInstant(theme: SiteTheme): void {
  armThemeSwitch();
  writeTheme(theme);
  releaseThemeSwitch();
}
