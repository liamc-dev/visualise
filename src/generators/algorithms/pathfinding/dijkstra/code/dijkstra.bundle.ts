import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  DIJKSTRA_PSEUDO,
  DIJKSTRA_PSEUDO_POINTER_HINTS,
  DIJKSTRA_PSEUDO_POINTER_LABELS,
} from "./dijkstra-pseudo";

import {
  DIJKSTRA_CPP,
  DIJKSTRA_CPP_POINTER_HINTS,
  DIJKSTRA_CPP_POINTER_LABELS,
} from "./dijkstra-cpp";

import {
  DIJKSTRA_JAVA,
  DIJKSTRA_JAVA_POINTER_HINTS,
  DIJKSTRA_JAVA_POINTER_LABELS,
} from "./dijkstra-java";

import {
  DIJKSTRA_TS,
  DIJKSTRA_TS_POINTER_HINTS,
  DIJKSTRA_TS_POINTER_LABELS,
} from "./dijkstra-ts";

import {
  DIJKSTRA_JS,
  DIJKSTRA_JS_POINTER_HINTS,
  DIJKSTRA_JS_POINTER_LABELS,
} from "./dijkstra-js";

import {
  DIJKSTRA_PY,
  DIJKSTRA_PY_POINTER_HINTS,
  DIJKSTRA_PY_POINTER_LABELS,
} from "./dijkstra-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(DIJKSTRA_PSEUDO);
const cppParsed = parseMarkerSpans(DIJKSTRA_CPP);
const javaParsed = parseMarkerSpans(DIJKSTRA_JAVA);
const tsParsed = parseMarkerSpans(DIJKSTRA_TS);
const jsParsed = parseMarkerSpans(DIJKSTRA_JS);
const pyParsed = parseMarkerSpans(DIJKSTRA_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const DIJKSTRA_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "dijkstra.pseudo", content: pseudoParsed.content },
    cpp: { file: "dijkstra.cpp", content: cppParsed.content },
    java: { file: "dijkstra.java", content: javaParsed.content },
    ts: { file: "dijkstra.ts", content: tsParsed.content },
    js: { file: "dijkstra.js", content: jsParsed.content },
    py: { file: "dijkstra.py", content: pyParsed.content },
  },

  spanMaps: {
    pseudo: pseudoParsed.spansByToken,
    cpp: cppParsed.spansByToken,
    java: javaParsed.spansByToken,
    ts: tsParsed.spansByToken,
    js: jsParsed.spansByToken,
    py: pyParsed.spansByToken,
  },

  resolve(lang: CodeLang, token: string) {
    const file = this.sources[lang]?.file ?? this.sources.pseudo?.file ?? "";

    let lines: [number, number] | undefined;
    const spans = this.spanMaps?.[lang]?.[token];

    if (spans) {
      const minLine = Math.min(...spans.map((s) => s.line));
      const maxLine = Math.max(...spans.map((s) => s.line));
      lines = [minLine, maxLine];
    }

    return { file, lines, spans };
  },

  pointerHints: {
    pseudo: DIJKSTRA_PSEUDO_POINTER_HINTS,
    cpp: DIJKSTRA_CPP_POINTER_HINTS,
    java: DIJKSTRA_JAVA_POINTER_HINTS,
    ts: DIJKSTRA_TS_POINTER_HINTS,
    js: DIJKSTRA_JS_POINTER_HINTS,
    py: DIJKSTRA_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: DIJKSTRA_PSEUDO_POINTER_LABELS,
    cpp: DIJKSTRA_CPP_POINTER_LABELS,
    java: DIJKSTRA_JAVA_POINTER_LABELS,
    ts: DIJKSTRA_TS_POINTER_LABELS,
    js: DIJKSTRA_JS_POINTER_LABELS,
    py: DIJKSTRA_PY_POINTER_LABELS,
  },
};
