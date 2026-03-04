import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  KMEANS_PSEUDO,
  KMEANS_PSEUDO_POINTER_HINTS,
  KMEANS_PSEUDO_POINTER_LABELS,
} from "./kmeans-pseudo";

import {
  KMEANS_CPP,
  KMEANS_CPP_POINTER_HINTS,
  KMEANS_CPP_POINTER_LABELS,
} from "./kmeans-cpp";

import {
  KMEANS_JAVA,
  KMEANS_JAVA_POINTER_HINTS,
  KMEANS_JAVA_POINTER_LABELS,
} from "./kmeans-java";

import {
  KMEANS_TS,
  KMEANS_TS_POINTER_HINTS,
  KMEANS_TS_POINTER_LABELS,
} from "./kmeans-ts";

import {
  KMEANS_JS,
  KMEANS_JS_POINTER_HINTS,
  KMEANS_JS_POINTER_LABELS,
} from "./kmeans-js";

import {
  KMEANS_PY,
  KMEANS_PY_POINTER_HINTS,
  KMEANS_PY_POINTER_LABELS,
} from "./kmeans-py";

const pseudoParsed = parseMarkerSpans(KMEANS_PSEUDO);
const cppParsed = parseMarkerSpans(KMEANS_CPP);
const javaParsed = parseMarkerSpans(KMEANS_JAVA);
const tsParsed = parseMarkerSpans(KMEANS_TS);
const jsParsed = parseMarkerSpans(KMEANS_JS);
const pyParsed = parseMarkerSpans(KMEANS_PY);

export const KMEANS_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "kmeans.pseudo", content: pseudoParsed.content },
    cpp: { file: "kmeans.cpp", content: cppParsed.content },
    java: { file: "kmeans.java", content: javaParsed.content },
    ts: { file: "kmeans.ts", content: tsParsed.content },
    js: { file: "kmeans.js", content: jsParsed.content },
    py: { file: "kmeans.py", content: pyParsed.content },
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
    pseudo: KMEANS_PSEUDO_POINTER_HINTS,
    cpp: KMEANS_CPP_POINTER_HINTS,
    java: KMEANS_JAVA_POINTER_HINTS,
    ts: KMEANS_TS_POINTER_HINTS,
    js: KMEANS_JS_POINTER_HINTS,
    py: KMEANS_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: KMEANS_PSEUDO_POINTER_LABELS,
    cpp: KMEANS_CPP_POINTER_LABELS,
    java: KMEANS_JAVA_POINTER_LABELS,
    ts: KMEANS_TS_POINTER_LABELS,
    js: KMEANS_JS_POINTER_LABELS,
    py: KMEANS_PY_POINTER_LABELS,
  },
};
