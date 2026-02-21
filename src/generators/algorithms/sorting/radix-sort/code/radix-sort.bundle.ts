// src/generators/algorithms/sorting/radix-sort/code/radix-sort.bundle.ts
import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../markerSpans";

import {
  RADIX_SORT_PSEUDO,
  RADIX_SORT_PSEUDO_POINTER_HINTS,
  RADIX_SORT_PSEUDO_POINTER_LABELS,
} from "./radix-sort-pseudo";

import {
  RADIX_SORT_PY,
  RADIX_SORT_PY_POINTER_HINTS,
  RADIX_SORT_PY_POINTER_LABELS,
} from "./radix-sort-py";

import {
  RADIX_SORT_JS,
  RADIX_SORT_JS_POINTER_HINTS,
  RADIX_SORT_JS_POINTER_LABELS,
} from "./radix-sort-js";

import {
  RADIX_SORT_TS,
  RADIX_SORT_TS_POINTER_HINTS,
  RADIX_SORT_TS_POINTER_LABELS,
} from "./radix-sort";

import {
  RADIX_SORT_CPP,
  RADIX_SORT_CPP_POINTER_HINTS,
  RADIX_SORT_CPP_POINTER_LABELS,
} from "./radix-sort-cpp";

import {
  RADIX_SORT_JAVA,
  RADIX_SORT_JAVA_POINTER_HINTS,
} from "./radix-sort-java";


function withMarkers(raw: string) {
  return parseMarkerSpans(raw);
}


const pseudoParsed = withMarkers(RADIX_SORT_PSEUDO);
const javaParsed = withMarkers(RADIX_SORT_JAVA);
const cppParsed = withMarkers(RADIX_SORT_CPP);
const pyParsed = withMarkers(RADIX_SORT_PY);
const jsParsed = withMarkers(RADIX_SORT_JS);
const tsParsed = withMarkers(RADIX_SORT_TS);

export const RADIX_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "radix-sort.pseudo", content: pseudoParsed.content },
    py: { file: "radix-sort.py", content: pyParsed.content },
    js: { file: "radix-sort.js", content: jsParsed.content },
    ts: { file: "radix-sort.ts", content: tsParsed.content },
    cpp: { file: "radix-sort.cpp", content: cppParsed.content },
    java: { file: "radix-sort.java", content: javaParsed.content },
  },

  spanMaps: {
    pseudo: pseudoParsed.spansByToken,
    java: javaParsed.spansByToken,
    cpp: cppParsed.spansByToken,
    py: pyParsed.spansByToken,
    js: jsParsed.spansByToken,
    ts: tsParsed.spansByToken,
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
    pseudo: RADIX_SORT_PSEUDO_POINTER_HINTS,
    py: RADIX_SORT_PY_POINTER_HINTS,
    js: RADIX_SORT_JS_POINTER_HINTS,
    ts: RADIX_SORT_TS_POINTER_HINTS,
    cpp: RADIX_SORT_CPP_POINTER_HINTS,
    java: RADIX_SORT_JAVA_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: RADIX_SORT_PSEUDO_POINTER_LABELS,
    cpp: RADIX_SORT_CPP_POINTER_LABELS,
    py: RADIX_SORT_PY_POINTER_LABELS,
    js: RADIX_SORT_JS_POINTER_LABELS,
    ts: RADIX_SORT_TS_POINTER_LABELS,
  },
};
