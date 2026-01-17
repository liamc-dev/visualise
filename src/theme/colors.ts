// src/theme/colors.ts

export const TokyoNight = {
  appBg: "#1a1b26",
  surface: "#16161e",
  card: "#24283b",
  softCard: "#151728",
  border: "#1f2335",

  text: "#c0caf5",
  textMuted: "#a9b1d6",
  textSubtle: "#565f89",

  accent: "#7aa2f7",
  accentSoft: "#3b4261",
  cyan: "#7dcfff",
  magenta: "#bb9af7",

  gridbase: "#1f2335",
  grid: "#8f962fff",

  success: "#9ece6a",
  warning: "#e0af68",
  danger: "#f7768e",
};

export const GridPalette = {
  base: TokyoNight.gridbase,   // darker outer grid
  bright: TokyoNight.grid, // subtle glow lines
};
