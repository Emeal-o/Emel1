import { useState, useEffect } from "react";

export type Theme = "dark" | "light" | "monaco";

const THEMES: Theme[] = ["dark", "light", "monaco"];
const STORAGE_KEY = "f1-theme";

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  // Remove all theme classes first
  el.classList.remove(...THEMES);
  el.classList.add(theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored && THEMES.includes(stored) ? stored : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
  }

  return { theme, setTheme, themes: THEMES };
}
