import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../markerSpans";

import {
  QUICK_SORT_PSEUDO,
  QUICK_SORT_PSEUDO_POINTER_HINTS,
  QUICK_SORT_PSEUDO_POINTER_LABELS,
} from "./quick-sort-pseudo";

import {
  QUICK_SORT_CPP,
  QUICK_SORT_CPP_POINTER_HINTS,
  QUICK_SORT_CPP_POINTER_LABELS,
} from "./quick-sort-cpp";

import {
  QUICK_SORT_JAVA,
  QUICK_SORT_JAVA_POINTER_HINTS,
  QUICK_SORT_JAVA_POINTER_LABELS,
} from "./quick-sort-java";

import {
  QUICK_SORT_TS,
  QUICK_SORT_TS_POINTER_HINTS,
  QUICK_SORT_TS_POINTER_LABELS,
} from "./quick-sort";

import {
  QUICK_SORT_JS,
  QUICK_SORT_JS_POINTER_HINTS,
  QUICK_SORT_JS_POINTER_LABELS,
} from "./quick-sort-js";

import {
  QUICK_SORT_PY,
  QUICK_SORT_PY_POINTER_HINTS,
  QUICK_SORT_PY_POINTER_LABELS,
} from "./quick-sort-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(QUICK_SORT_PSEUDO);
const cppParsed = parseMarkerSpans(QUICK_SORT_CPP);
const javaParsed = parseMarkerSpans(QUICK_SORT_JAVA);
const tsParsed = parseMarkerSpans(QUICK_SORT_TS);
const jsParsed = parseMarkerSpans(QUICK_SORT_JS);
const pyParsed = parseMarkerSpans(QUICK_SORT_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const QUICK_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "quick-sort.pseudo", content: pseudoParsed.content },
    cpp: { file: "quick-sort.cpp", content: cppParsed.content },
    java: { file: "quick-sort.java", content: javaParsed.content },
    ts: { file: "quick-sort.ts", content: tsParsed.content },
    js: { file: "quick-sort.js", content: jsParsed.content },
    py: { file: "quick-sort.py", content: pyParsed.content },
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
      const minLine = Math.min(...spans.map(s => s.line));
      const maxLine = Math.max(...spans.map(s => s.line));
      lines = [minLine, maxLine];
    }

    return { file, lines, spans };
  },

  pointerHints: {
    pseudo: QUICK_SORT_PSEUDO_POINTER_HINTS,
    cpp: QUICK_SORT_CPP_POINTER_HINTS,
    java: QUICK_SORT_JAVA_POINTER_HINTS,
    ts: QUICK_SORT_TS_POINTER_HINTS,
    js: QUICK_SORT_JS_POINTER_HINTS,
    py: QUICK_SORT_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: QUICK_SORT_PSEUDO_POINTER_LABELS,
    cpp: QUICK_SORT_CPP_POINTER_LABELS,
    java: QUICK_SORT_JAVA_POINTER_LABELS,
    ts: QUICK_SORT_TS_POINTER_LABELS,
    js: QUICK_SORT_JS_POINTER_LABELS,
    py: QUICK_SORT_PY_POINTER_LABELS,
  },
};
