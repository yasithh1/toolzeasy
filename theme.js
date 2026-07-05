(() => {
  const storageKey = "toolzeasy-theme";
  const root = document.documentElement;

  const preferredTheme = () => {
    let saved = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch (error) {
      saved = null;
    }
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const updateButtons = (theme) => {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.title = `Switch to ${nextTheme} mode`;
      button.textContent = "";
    });
  };

  const setTheme = (theme, shouldSave = true) => {
    root.dataset.theme = theme;
    if (shouldSave) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        // Ignore blocked storage. The active page still changes theme.
      }
    }
    updateButtons(theme);
  };

  setTheme(root.dataset.theme || preferredTheme(), false);

  document.addEventListener("DOMContentLoaded", () => {
    updateButtons(root.dataset.theme || preferredTheme());

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const currentTheme = root.dataset.theme === "dark" ? "dark" : "light";
        setTheme(currentTheme === "dark" ? "light" : "dark");
      });
    });
  });
})();
