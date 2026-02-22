// src/components/ui/AsciiText.tsx
import type { ReactNode } from "react";
import { useStyleStore } from "../../stores/useStyleStore";

type AsciiTextProps = {
  ascii: string | undefined;
  cssClass: string;
  fallback: ReactNode;
  ariaLabel?: string;
};

export function AsciiText({ ascii, cssClass, fallback, ariaLabel }: AsciiTextProps) {
  const style = useStyleStore((s) => s.style);

  if (style !== "terminal" || !ascii) return <>{fallback}</>;

  return (
    <pre className={`${cssClass} text-tn-text select-none leading-none`} aria-label={ariaLabel}>
      {ascii}
    </pre>
  );
}
