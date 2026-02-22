// src/generators/algorithms/sorting/merge-sort/code/merge-sort.bundle.ts
import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  MERGE_SORT_PSEUDO,
  MERGE_SORT_PSEUDO_POINTER_HINTS,
  MERGE_SORT_PSEUDO_POINTER_LABELS,
} from "./merge-sort-pseudo";

import {
  MERGE_SORT_PY,
  MERGE_SORT_PY_POINTER_HINTS,
  MERGE_SORT_PY_POINTER_LABELS,
} from "./merge-sort-py";

import {
  MERGE_SORT_JS,
  MERGE_SORT_JS_POINTER_HINTS,
  MERGE_SORT_JS_POINTER_LABELS,
} from "./merge-sort-js";

import {
  MERGE_SORT_TS,
  MERGE_SORT_TS_POINTER_HINTS,
  MERGE_SORT_TS_POINTER_LABELS,
} from "./merge-sort";

import {
  MERGE_SORT_CPP,
  MERGE_SORT_CPP_POINTER_HINTS,
  MERGE_SORT_CPP_POINTER_LABELS,
} from "./merge-sort-cpp";

import {
  MERGE_SORT_JAVA,
  MERGE_SORT_JAVA_POINTER_HINTS,
  MERGE_SORT_JAVA_SKELETON,
} from "./merge-sort-java";


function withMarkers(raw: string) {
  return parseMarkerSpans(raw);
}


const pseudoParsed = withMarkers(MERGE_SORT_PSEUDO);
const javaParsed = withMarkers(MERGE_SORT_JAVA);
const cppParsed = withMarkers(MERGE_SORT_CPP);
const pyParsed = withMarkers(MERGE_SORT_PY);
const jsParsed = withMarkers(MERGE_SORT_JS);
const tsParsed = withMarkers(MERGE_SORT_TS);

export const MERGE_SORT_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "merge-sort.pseudo", content: pseudoParsed.content },
    py: { file: "merge-sort.py", content: pyParsed.content },
    js: { file: "merge-sort.js", content: jsParsed.content },
    ts: { file: "merge-sort.ts", content: tsParsed.content },
    cpp: { file: "merge-sort.cpp", content: cppParsed.content },
    java: { file: "merge-sort.java", content: javaParsed.content, skeleton: MERGE_SORT_JAVA_SKELETON, },
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
    pseudo: MERGE_SORT_PSEUDO_POINTER_HINTS,
    py: MERGE_SORT_PY_POINTER_HINTS,
    js: MERGE_SORT_JS_POINTER_HINTS,
    ts: MERGE_SORT_TS_POINTER_HINTS,
    cpp: MERGE_SORT_CPP_POINTER_HINTS,
    java: MERGE_SORT_JAVA_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: MERGE_SORT_PSEUDO_POINTER_LABELS,
    cpp: MERGE_SORT_CPP_POINTER_LABELS,
    py: MERGE_SORT_PY_POINTER_LABELS,
    js: MERGE_SORT_JS_POINTER_LABELS,
    ts: MERGE_SORT_TS_POINTER_LABELS,
  },
};
