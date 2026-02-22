// src/components/ui/AsciiText.tsx
import type { ReactNode } from "react";
import { useStyleStore } from "../../stores/useStyleStore";
import { useThemeStore } from "../../stores/useThemeStore";
import type { Theme } from "../../stores/useThemeStore";

type AsciiTextProps = {
  ascii: string | undefined;
  cssClass: string;
  fallback: ReactNode;
  ariaLabel?: string;
  /** When set, only render ASCII art on this specific theme. */
  onlyTheme?: Theme;
};

export function AsciiText({ ascii, cssClass, fallback, ariaLabel, onlyTheme }: AsciiTextProps) {
  const style = useStyleStore((s) => s.style);
  const theme = useThemeStore((s) => s.theme);

  if (style !== "terminal" || !ascii) return <>{fallback}</>;
  if (onlyTheme && theme !== onlyTheme) return <>{fallback}</>;

  return (
    <pre className={`${cssClass} text-tn-text select-none leading-none`} aria-label={ariaLabel}>
      {ascii}
    </pre>
  );
}
