import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  BELLMAN_FORD_PSEUDO,
  BELLMAN_FORD_PSEUDO_POINTER_HINTS,
  BELLMAN_FORD_PSEUDO_POINTER_LABELS,
} from "./bellman-ford-pseudo";

import {
  BELLMAN_FORD_CPP,
  BELLMAN_FORD_CPP_POINTER_HINTS,
  BELLMAN_FORD_CPP_POINTER_LABELS,
} from "./bellman-ford-cpp";

import {
  BELLMAN_FORD_JAVA,
  BELLMAN_FORD_JAVA_POINTER_HINTS,
  BELLMAN_FORD_JAVA_POINTER_LABELS,
} from "./bellman-ford-java";

import {
  BELLMAN_FORD_TS,
  BELLMAN_FORD_TS_POINTER_HINTS,
  BELLMAN_FORD_TS_POINTER_LABELS,
} from "./bellman-ford-ts";

import {
  BELLMAN_FORD_JS,
  BELLMAN_FORD_JS_POINTER_HINTS,
  BELLMAN_FORD_JS_POINTER_LABELS,
} from "./bellman-ford-js";

import {
  BELLMAN_FORD_PY,
  BELLMAN_FORD_PY_POINTER_HINTS,
  BELLMAN_FORD_PY_POINTER_LABELS,
} from "./bellman-ford-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(BELLMAN_FORD_PSEUDO);
const cppParsed = parseMarkerSpans(BELLMAN_FORD_CPP);
const javaParsed = parseMarkerSpans(BELLMAN_FORD_JAVA);
const tsParsed = parseMarkerSpans(BELLMAN_FORD_TS);
const jsParsed = parseMarkerSpans(BELLMAN_FORD_JS);
const pyParsed = parseMarkerSpans(BELLMAN_FORD_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const BELLMAN_FORD_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "bellman-ford.pseudo", content: pseudoParsed.content },
    cpp: { file: "bellman-ford.cpp", content: cppParsed.content },
    java: { file: "bellman-ford.java", content: javaParsed.content },
    ts: { file: "bellman-ford.ts", content: tsParsed.content },
    js: { file: "bellman-ford.js", content: jsParsed.content },
    py: { file: "bellman-ford.py", content: pyParsed.content },
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
    pseudo: BELLMAN_FORD_PSEUDO_POINTER_HINTS,
    cpp: BELLMAN_FORD_CPP_POINTER_HINTS,
    java: BELLMAN_FORD_JAVA_POINTER_HINTS,
    ts: BELLMAN_FORD_TS_POINTER_HINTS,
    js: BELLMAN_FORD_JS_POINTER_HINTS,
    py: BELLMAN_FORD_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: BELLMAN_FORD_PSEUDO_POINTER_LABELS,
    cpp: BELLMAN_FORD_CPP_POINTER_LABELS,
    java: BELLMAN_FORD_JAVA_POINTER_LABELS,
    ts: BELLMAN_FORD_TS_POINTER_LABELS,
    js: BELLMAN_FORD_JS_POINTER_LABELS,
    py: BELLMAN_FORD_PY_POINTER_LABELS,
  },
};
