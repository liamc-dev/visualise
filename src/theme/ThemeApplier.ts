import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";

export default function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Tailwind's dark: utilities
    if (theme === "light") root.classList.remove("dark");
    else root.classList.add("dark");

    root.dataset.theme = theme;
  }, [theme]);

  return null;
}
