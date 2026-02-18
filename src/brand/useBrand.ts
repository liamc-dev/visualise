import { useCallback } from "react";
import { useThemeStore, type Theme } from "../stores/useThemeStore";
import { BRAND_ASSETS } from "./brand-registry";
import { type AlgorithmId } from "../generators/algorithms/registry";

function resolveThemedAsset(themed: Record<string, string | undefined> | undefined, theme: Theme) {
  if (!themed) return undefined;
  return themed[theme] ?? themed.dark ?? themed.light ?? Object.values(themed)[0];
}

export function useBrand() {
  const theme = useThemeStore((s) => s.theme);

  const appLogoSrc = resolveThemedAsset(BRAND_ASSETS.appLogo, theme);

  const appLogoAlt =
    theme === "tokyo-night" ? "Visualiser" : "";

  const getAlgoLogoSrc = useCallback(
    (algorithmKey: AlgorithmId) =>
      resolveThemedAsset(BRAND_ASSETS.algoLogos[algorithmKey], theme),
    [theme]
  );

  return { theme, appLogoSrc, appLogoAlt, getAlgoLogoSrc };
}
