import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../markerSpans";

import {
  BUBBLE_SORT_PSEUDO,
  BUBBLE_SORT_PSEUDO_POINTER_HINTS,
  BUBBLE_SORT_PSEUDO_POINTER_LABELS,
} from "./bubble-sort-pseudo";

import {
  BUBBLE_SORT_CPP,
  BUBBLE_SORT_CPP_POINTER_HINTS,
  BUBBLE_SORT_CPP_POINTER_LABELS,
} from "./bubble-sort-cpp";

import {
  BUBBLE_SORT_JAVA,
  BUBBLE_SORT_JAVA_POINTER_HINTS,
  BUBBLE_SORT_JAVA_POINTER_LABELS,
} from "./bubble-sort-java";

import {
  BUBBLE_SORT_TS,
  BUBBLE_SORT_TS_POINTER_HINTS,
  BUBBLE_SORT_TS_POINTER_LABELS,
} from "./bubble-sort-ts";

import {
  BUBBLE_SORT_JS,
  BUBBLE_SORT_JS_POINTER_HINTS,
  BUBBLE_SORT_JS_POINTER_LABELS,
} from "./bubble-sort-js";

import {
  BUBBLE_SORT_PY,
  BUBBLE_SORT_PY_POINTER_HINTS,
  BUBBLE_SORT_PY_POINTER_LABELS,
} from "./bubble-sort-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(BUBBLE_SORT_PSEUDO);
const cppParsed = parseMarkerSpans(BUBBLE_SORT_CPP);
const javaParsed = parseMarkerSpans(BUBBLE_SORT_JAVA);
const tsParsed = parseMarkerSpans(BUBBLE_SORT_TS);
const jsParsed = parseMarkerSpans(BUBBLE_SORT_JS);
const pyParsed = parseMarkerSpans(BUBBLE_SORT_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const BUBBLE_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "bubble-sort.pseudo", content: pseudoParsed.content },
    cpp: { file: "bubble-sort.cpp", content: cppParsed.content },
    java: { file: "bubble-sort.java", content: javaParsed.content },
    ts: { file: "bubble-sort.ts", content: tsParsed.content },
    js: { file: "bubble-sort.js", content: jsParsed.content },
    py: { file: "bubble-sort.py", content: pyParsed.content },
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
    pseudo: BUBBLE_SORT_PSEUDO_POINTER_HINTS,
    cpp: BUBBLE_SORT_CPP_POINTER_HINTS,
    java: BUBBLE_SORT_JAVA_POINTER_HINTS,
    ts: BUBBLE_SORT_TS_POINTER_HINTS,
    js: BUBBLE_SORT_JS_POINTER_HINTS,
    py: BUBBLE_SORT_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: BUBBLE_SORT_PSEUDO_POINTER_LABELS,
    cpp: BUBBLE_SORT_CPP_POINTER_LABELS,
    java: BUBBLE_SORT_JAVA_POINTER_LABELS,
    ts: BUBBLE_SORT_TS_POINTER_LABELS,
    js: BUBBLE_SORT_JS_POINTER_LABELS,
    py: BUBBLE_SORT_PY_POINTER_LABELS,
  },
};
