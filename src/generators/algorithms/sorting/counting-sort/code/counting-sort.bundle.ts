// src/generators/algorithms/sorting/counting-sort/code/counting-sort.bundle.ts
import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  COUNTING_SORT_PSEUDO,
  COUNTING_SORT_PSEUDO_POINTER_HINTS,
  COUNTING_SORT_PSEUDO_POINTER_LABELS,
} from "./counting-sort-pseudo";

import {
  COUNTING_SORT_PY,
  COUNTING_SORT_PY_POINTER_HINTS,
  COUNTING_SORT_PY_POINTER_LABELS,
} from "./counting-sort-py";

import {
  COUNTING_SORT_JS,
  COUNTING_SORT_JS_POINTER_HINTS,
  COUNTING_SORT_JS_POINTER_LABELS,
} from "./counting-sort-js";

import {
  COUNTING_SORT_TS,
  COUNTING_SORT_TS_POINTER_HINTS,
  COUNTING_SORT_TS_POINTER_LABELS,
} from "./counting-sort-ts";

import {
  COUNTING_SORT_CPP,
  COUNTING_SORT_CPP_POINTER_HINTS,
  COUNTING_SORT_CPP_POINTER_LABELS,
} from "./counting-sort-cpp";

import {
  COUNTING_SORT_JAVA,
  COUNTING_SORT_JAVA_POINTER_HINTS,
} from "./counting-sort-java";


function withMarkers(raw: string) {
  return parseMarkerSpans(raw);
}


const pseudoParsed = withMarkers(COUNTING_SORT_PSEUDO);
const javaParsed = withMarkers(COUNTING_SORT_JAVA);
const cppParsed = withMarkers(COUNTING_SORT_CPP);
const pyParsed = withMarkers(COUNTING_SORT_PY);
const jsParsed = withMarkers(COUNTING_SORT_JS);
const tsParsed = withMarkers(COUNTING_SORT_TS);

export const COUNTING_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "counting-sort.pseudo", content: pseudoParsed.content },
    py: { file: "counting-sort.py", content: pyParsed.content },
    js: { file: "counting-sort.js", content: jsParsed.content },
    ts: { file: "counting-sort.ts", content: tsParsed.content },
    cpp: { file: "counting-sort.cpp", content: cppParsed.content },
    java: { file: "counting-sort.java", content: javaParsed.content },
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
    pseudo: COUNTING_SORT_PSEUDO_POINTER_HINTS,
    py: COUNTING_SORT_PY_POINTER_HINTS,
    js: COUNTING_SORT_JS_POINTER_HINTS,
    ts: COUNTING_SORT_TS_POINTER_HINTS,
    cpp: COUNTING_SORT_CPP_POINTER_HINTS,
    java: COUNTING_SORT_JAVA_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: COUNTING_SORT_PSEUDO_POINTER_LABELS,
    cpp: COUNTING_SORT_CPP_POINTER_LABELS,
    py: COUNTING_SORT_PY_POINTER_LABELS,
    js: COUNTING_SORT_JS_POINTER_LABELS,
    ts: COUNTING_SORT_TS_POINTER_LABELS,
  },
};
