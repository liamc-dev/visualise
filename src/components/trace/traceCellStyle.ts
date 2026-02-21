// src/components/trace/traceCellStyle.ts
import type { CSSProperties } from "react";
import type { TraceNode } from "../../types/trace-types";
import { opacity, scale, backgroundColor, boxShadow } from "../../utils/styleUtil";

const BASE =
  "absolute rounded-[var(--cellRadius)] flex items-center justify-center font-semibold text-tn-text leading-none border";

const CELL_BASE = `${BASE} bg-tn-surface border-solid`;
const TEMP_BASE = `${BASE} border-dashed`;

function radius(cellSize: number) {
  return Math.max(10, cellSize * 0.22);
}

function fontSize(cellSize: number) {
  return cellSize <= 20
    ? Math.max(9, Math.round(cellSize * 0.28))
    : Math.min(18, Math.round(cellSize * 0.38));
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function emphasisOpacity(emphasis: unknown, isTemp: boolean) {
  if (emphasis === "faint") return isTemp ? 0.6 : 0.45;
  if (emphasis === "soft") return isTemp ? 0.7 : 0.55;
  return 1;
}

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function toneBorderColor(tone: unknown) {

  if (tone === "warning") return "rgb(var(--tn-warning) / 0.55)";
  if (tone === "danger") return "rgb(var(--tn-danger) / 0.55)";
  if (tone === "info") return "rgb(var(--tn-cyan) / 0.55)";
  if (tone === "accent") return "rgb(var(--tn-accent) / 0.55)";
  if (tone === "muted") return "rgb(var(--tn-subtle) / 0.28)";
  return null; // neutral: fall back to styleUtil
}

export function getTraceCellStyle(args: {
  cellSize: number;
  x: number;
  y: number;
  depth?: number;
  node: TraceNode;

  highlight?: boolean;
  trail?: boolean;
  write?: boolean;
  effects?: boolean;
}) {
  const {
    cellSize,
    x,
    y,
    depth = 0,
    node,
    highlight = false,
    trail = false,
    write = false,
    effects = true,
  } = args;

  const isTemp = node.kind === "temp";

  const emphasis = node.meta?.emphasis ?? "normal";
  const depthFade = emphasisOpacity(emphasis, isTemp);

  const metaOpacity = node.meta?.opacity;
  const metaOpacityMul =
    typeof node.meta?.opacityMul === "number" ? node.meta.opacityMul : 1;

  const tone = node.meta?.tone ?? "neutral";
  const weight = (node.meta?.weight ?? 0) as 0 | 1 | 2 | 3;


  const flags = {
    latest: true,
    active: weight >= 1, // raised
    highlight: !isTemp && highlight,
    trail: isTemp ? false : trail,
    mid: weight >= 2, // strong
    write: isTemp ? false : write || weight >= 3, // max
    depth,
  };

  const baseOpacity = isTemp ? 0.75 : opacity(flags);
  const combinedOpacity =
    typeof metaOpacity === "number"
      ? metaOpacity
      : baseOpacity * depthFade * metaOpacityMul;

  const opacityVal = clamp01(combinedOpacity);
  const scaleVal = isTemp ? 1 : scale(flags);

  const baseBorder = isTemp
    ? "rgb(var(--tn-subtle) / 0.45)"
    : backgroundColor(flags);

  const toneBorder = isTemp ? null : toneBorderColor(tone);
  const borderColor = toneBorder ?? baseBorder;

  const rawShadow = isTemp ? "none" : effects ? boxShadow(flags) : "none";
  const insetShadow = "var(--tn-overlay-inset)";
  const finalShadow =
    rawShadow === "none" ? insetShadow : `${insetShadow}, ${rawShadow}`;

  // z-index / border width are now purely generic:
  // highlight beats weight; then weight beats normal.
  const zIndex = isTemp ? 1 : highlight ? 6 : 2 + weight;
  const borderWidth = isTemp ? 1 : highlight || weight >= 2 ? 3 : 1;

  const isCard = node.kind === "card";

  const wCols = (node.meta as any)?.wCols;
  const hRows = (node.meta as any)?.hRows;

  const widthPx =
    node.meta?.widthPx ??
    (isNum(wCols) && wCols > 0
      ? wCols * cellSize
      : isCard
        ? cellSize * 3.2
        : cellSize);

  const heightPx =
    node.meta?.heightPx ??
    (isNum(hRows) && hRows > 0
      ? hRows * cellSize
      : isCard
        ? cellSize * 2.2
        : cellSize);

  const style: CSSProperties = {
    ["--cellRadius" as any]: `${radius(cellSize)}px`,
    fontSize: `${fontSize(cellSize)}px`,

    width: `${widthPx}px`,
    height: `${heightPx}px`,

    zIndex,
    borderColor,
    borderWidth,
    opacity: opacityVal,
    boxShadow: isTemp ? "none" : finalShadow,

    transform: `translate(${x}px, ${y}px) scale(${scaleVal})`,
    transition: `
      transform 260ms cubic-bezier(0.25, 0.8, 0.25, 1),
      opacity 220ms ease,
      box-shadow 200ms ease,
      border-color 180ms ease,
      background-color 180ms ease
    `,
  };

  if (isTemp) {
    style.backgroundColor = "rgb(var(--tn-bg) / 0.15)";
  }

  return {
    className: isTemp ? TEMP_BASE : CELL_BASE,
    style,
  };
}
