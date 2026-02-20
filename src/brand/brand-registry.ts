// src/brand/brand-assets.ts
import type { Theme } from "../stores/useThemeStore";
import { ALGORITHMS, type AlgorithmId, Algorithm } from "../generators/algorithms/registry";

// import logoTokyo from "../assets/tokyo-night/logo-tokyo.png";
// import logoLight from "../assets/light/logo-light.png";
// import logoDark from "../assets/dark/logo-dark.png";

// import logoTopLight from "../assets/light/logo-top-light.png";

// import mergeLight from "../assets/tokyo-night/mergesort-palm.png";
// import mergeDark from "../assets/tokyo-night/mergesort-palm.png";
// import mergeTokyo from "../assets/tokyo-night/mergesort-palm.png";

// import quickLight from "../assets/tokyo-night/mergesort-palm.png";
// import quickDark from "../assets/tokyo-night/mergesort-palm.png";
// import quickTokyo from "../assets/tokyo-night/mergesort-palm.png";

import { } from "../generators/algorithms/registry";

export type ThemedAsset = Partial<Record<Theme, string>>;

export type BrandAssets = {
  appLogo: ThemedAsset;
  algoLogos: Record<string, ThemedAsset>;
};

export const BRAND_ASSETS: {
  appLogo: ThemedAsset;
  algoLogos: Record<string, ThemedAsset>;
} = {
  appLogo: {
    light: '',
    dark: '',
    "tokyo-night": '',
    ember: '',
  },

  algoLogos: {
    "merge-sort": { light: '', dark: '', "tokyo-night": '', ember: '' },
    "quick-sort": { light: '', dark: '', "tokyo-night": '', ember: '' },
  },
};