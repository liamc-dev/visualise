import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  INSERTION_SORT_PSEUDO,
  INSERTION_SORT_PSEUDO_POINTER_HINTS,
  INSERTION_SORT_PSEUDO_POINTER_LABELS,
} from "./insertion-sort-pseudo";

import {
  INSERTION_SORT_CPP,
  INSERTION_SORT_CPP_POINTER_HINTS,
  INSERTION_SORT_CPP_POINTER_LABELS,
} from "./insertion-sort-cpp";

import {
  INSERTION_SORT_JAVA,
  INSERTION_SORT_JAVA_POINTER_HINTS,
  INSERTION_SORT_JAVA_POINTER_LABELS,
} from "./insertion-sort-java";

import {
  INSERTION_SORT_TS,
  INSERTION_SORT_TS_POINTER_HINTS,
  INSERTION_SORT_TS_POINTER_LABELS,
} from "./insertion-sort-ts";

import {
  INSERTION_SORT_JS,
  INSERTION_SORT_JS_POINTER_HINTS,
  INSERTION_SORT_JS_POINTER_LABELS,
} from "./insertion-sort-js";

import {
  INSERTION_SORT_PY,
  INSERTION_SORT_PY_POINTER_HINTS,
  INSERTION_SORT_PY_POINTER_LABELS,
} from "./insertion-sort-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(INSERTION_SORT_PSEUDO);
const cppParsed = parseMarkerSpans(INSERTION_SORT_CPP);
const javaParsed = parseMarkerSpans(INSERTION_SORT_JAVA);
const tsParsed = parseMarkerSpans(INSERTION_SORT_TS);
const jsParsed = parseMarkerSpans(INSERTION_SORT_JS);
const pyParsed = parseMarkerSpans(INSERTION_SORT_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const INSERTION_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "insertion-sort.pseudo", content: pseudoParsed.content },
    cpp: { file: "insertion-sort.cpp", content: cppParsed.content },
    java: { file: "insertion-sort.java", content: javaParsed.content },
    ts: { file: "insertion-sort.ts", content: tsParsed.content },
    js: { file: "insertion-sort.js", content: jsParsed.content },
    py: { file: "insertion-sort.py", content: pyParsed.content },
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
    pseudo: INSERTION_SORT_PSEUDO_POINTER_HINTS,
    cpp: INSERTION_SORT_CPP_POINTER_HINTS,
    java: INSERTION_SORT_JAVA_POINTER_HINTS,
    ts: INSERTION_SORT_TS_POINTER_HINTS,
    js: INSERTION_SORT_JS_POINTER_HINTS,
    py: INSERTION_SORT_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: INSERTION_SORT_PSEUDO_POINTER_LABELS,
    cpp: INSERTION_SORT_CPP_POINTER_LABELS,
    java: INSERTION_SORT_JAVA_POINTER_LABELS,
    ts: INSERTION_SORT_TS_POINTER_LABELS,
    js: INSERTION_SORT_JS_POINTER_LABELS,
    py: INSERTION_SORT_PY_POINTER_LABELS,
  },
};
