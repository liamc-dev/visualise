// src/brand/BrandLogo.tsx
import { useBrand } from "./useBrand";
import { useStyleStore } from "../stores/useStyleStore";
import { useThemeStore } from "../stores/useThemeStore";

const ASCII_VISUALISER = `\
  _   ___               ___
 | | / (_)__ __ _____ _/ (_)__ ___ ____
 | |/ / (_-</ // / _ \`/ / (_-</ -_) __/
 |___/_/___/\\_,_/\\_,_/_/_/___/\\__/_/`;

export function BrandLogo() {
  const { appLogoSrc, appLogoAlt } = useBrand();
  const style = useStyleStore((s) => s.style);
  const theme = useThemeStore((s) => s.theme);
  const label = appLogoAlt ?? "App";

  if (appLogoSrc) {
    return (
      <img
        src={appLogoSrc}
        alt={label}
        className="h-7 w-auto select-none pointer-events-none opacity-95"
      />
    );
  }

  if (style === "terminal" && theme === "tokyo-night") {
    return (
      <pre
        className="tn-brand-ascii text-tn-text select-none leading-none"
        aria-label={label}
      >
        {ASCII_VISUALISER}
      </pre>
    );
  }

  if (style === "terminal") {
    return (
      <span className="tn-brand-text text-ui text-tn-text select-none">
        {label}
        <span className="tn-terminal-cursor">{"\u2588"}</span>
      </span>
    );
  }

  return (
    <span className="tn-brand-text text-ui text-tn-text">
      {label}
    </span>
  );
}
