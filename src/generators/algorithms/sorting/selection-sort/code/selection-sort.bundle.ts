import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  SELECTION_SORT_PSEUDO,
  SELECTION_SORT_PSEUDO_POINTER_HINTS,
  SELECTION_SORT_PSEUDO_POINTER_LABELS,
} from "./selection-sort-pseudo";

import {
  SELECTION_SORT_CPP,
  SELECTION_SORT_CPP_POINTER_HINTS,
  SELECTION_SORT_CPP_POINTER_LABELS,
} from "./selection-sort-cpp";

import {
  SELECTION_SORT_JAVA,
  SELECTION_SORT_JAVA_POINTER_HINTS,
  SELECTION_SORT_JAVA_POINTER_LABELS,
} from "./selection-sort-java";

import {
  SELECTION_SORT_TS,
  SELECTION_SORT_TS_POINTER_HINTS,
  SELECTION_SORT_TS_POINTER_LABELS,
} from "./selection-sort-ts";

import {
  SELECTION_SORT_JS,
  SELECTION_SORT_JS_POINTER_HINTS,
  SELECTION_SORT_JS_POINTER_LABELS,
} from "./selection-sort-js";

import {
  SELECTION_SORT_PY,
  SELECTION_SORT_PY_POINTER_HINTS,
  SELECTION_SORT_PY_POINTER_LABELS,
} from "./selection-sort-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(SELECTION_SORT_PSEUDO);
const cppParsed = parseMarkerSpans(SELECTION_SORT_CPP);
const javaParsed = parseMarkerSpans(SELECTION_SORT_JAVA);
const tsParsed = parseMarkerSpans(SELECTION_SORT_TS);
const jsParsed = parseMarkerSpans(SELECTION_SORT_JS);
const pyParsed = parseMarkerSpans(SELECTION_SORT_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const SELECTION_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "selection-sort.pseudo", content: pseudoParsed.content },
    cpp: { file: "selection-sort.cpp", content: cppParsed.content },
    java: { file: "selection-sort.java", content: javaParsed.content },
    ts: { file: "selection-sort.ts", content: tsParsed.content },
    js: { file: "selection-sort.js", content: jsParsed.content },
    py: { file: "selection-sort.py", content: pyParsed.content },
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
    pseudo: SELECTION_SORT_PSEUDO_POINTER_HINTS,
    cpp: SELECTION_SORT_CPP_POINTER_HINTS,
    java: SELECTION_SORT_JAVA_POINTER_HINTS,
    ts: SELECTION_SORT_TS_POINTER_HINTS,
    js: SELECTION_SORT_JS_POINTER_HINTS,
    py: SELECTION_SORT_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: SELECTION_SORT_PSEUDO_POINTER_LABELS,
    cpp: SELECTION_SORT_CPP_POINTER_LABELS,
    java: SELECTION_SORT_JAVA_POINTER_LABELS,
    ts: SELECTION_SORT_TS_POINTER_LABELS,
    js: SELECTION_SORT_JS_POINTER_LABELS,
    py: SELECTION_SORT_PY_POINTER_LABELS,
  },
};
