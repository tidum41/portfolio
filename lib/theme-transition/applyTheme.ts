export type SiteTheme = "light" | "dark";

export function applyThemeInstant(theme: SiteTheme): void {
  const html = document.documentElement;
  html.classList.add("theme-switching");
  void html.offsetWidth;
  html.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode */
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      html.classList.remove("theme-switching");
    });
  });
}
