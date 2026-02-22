// src/generators/algorithms/sorting/heap-sort/code/heap-sort.bundle.ts
import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  HEAP_SORT_PSEUDO,
  HEAP_SORT_PSEUDO_POINTER_HINTS,
  HEAP_SORT_PSEUDO_POINTER_LABELS,
} from "./heap-sort-pseudo";

import {
  HEAP_SORT_JAVA,
  HEAP_SORT_JAVA_POINTER_HINTS,
  HEAP_SORT_JAVA_POINTER_LABELS,
} from "./heap-sort-java";

// Real code files
import {
  HEAP_SORT_CPP,
  HEAP_SORT_CPP_POINTER_HINTS,
  HEAP_SORT_CPP_POINTER_LABELS,
} from "./heap-sort-cpp";

import {
  HEAP_SORT_TS,
  HEAP_SORT_TS_POINTER_HINTS,
  HEAP_SORT_TS_POINTER_LABELS,
} from "./heap-sort";

import {
  HEAP_SORT_JS,
  HEAP_SORT_JS_POINTER_HINTS,
  HEAP_SORT_JS_POINTER_LABELS,
} from "./heap-sort-js";

import {
  HEAP_SORT_PY,
  HEAP_SORT_PY_POINTER_HINTS,
  HEAP_SORT_PY_POINTER_LABELS,
} from "./heap-sort-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(HEAP_SORT_PSEUDO);
const javaParsed = parseMarkerSpans(HEAP_SORT_JAVA);

const cppParsed = parseMarkerSpans(HEAP_SORT_CPP);
const tsParsed = parseMarkerSpans(HEAP_SORT_TS);
const jsParsed = parseMarkerSpans(HEAP_SORT_JS);
const pyParsed = parseMarkerSpans(HEAP_SORT_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const HEAP_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "heap-sort.pseudo", content: pseudoParsed.content },
    cpp: { file: "heap-sort.cpp", content: cppParsed.content },
    java: { file: "heap-sort.java", content: javaParsed.content },
    ts: { file: "heap-sort.ts", content: tsParsed.content },
    js: { file: "heap-sort.js", content: jsParsed.content },
    py: { file: "heap-sort.py", content: pyParsed.content },
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
    pseudo: HEAP_SORT_PSEUDO_POINTER_HINTS,
    cpp: HEAP_SORT_CPP_POINTER_HINTS,
    java: HEAP_SORT_JAVA_POINTER_HINTS,
    ts: HEAP_SORT_TS_POINTER_HINTS,
    js: HEAP_SORT_JS_POINTER_HINTS,
    py: HEAP_SORT_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: HEAP_SORT_PSEUDO_POINTER_LABELS,
    cpp: HEAP_SORT_CPP_POINTER_LABELS,
    java: HEAP_SORT_JAVA_POINTER_LABELS,
    ts: HEAP_SORT_TS_POINTER_LABELS,
    js: HEAP_SORT_JS_POINTER_LABELS,
    py: HEAP_SORT_PY_POINTER_LABELS,
  },
};
