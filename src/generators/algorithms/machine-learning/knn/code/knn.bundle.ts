import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  KNN_PSEUDO,
  KNN_PSEUDO_POINTER_HINTS,
  KNN_PSEUDO_POINTER_LABELS,
} from "./knn-pseudo";

import {
  KNN_CPP,
  KNN_CPP_POINTER_HINTS,
  KNN_CPP_POINTER_LABELS,
} from "./knn-cpp";

import {
  KNN_JAVA,
  KNN_JAVA_POINTER_HINTS,
  KNN_JAVA_POINTER_LABELS,
} from "./knn-java";

import {
  KNN_TS,
  KNN_TS_POINTER_HINTS,
  KNN_TS_POINTER_LABELS,
} from "./knn-ts";

import {
  KNN_JS,
  KNN_JS_POINTER_HINTS,
  KNN_JS_POINTER_LABELS,
} from "./knn-js";

import {
  KNN_PY,
  KNN_PY_POINTER_HINTS,
  KNN_PY_POINTER_LABELS,
} from "./knn-py";

const pseudoParsed = parseMarkerSpans(KNN_PSEUDO);
const cppParsed = parseMarkerSpans(KNN_CPP);
const javaParsed = parseMarkerSpans(KNN_JAVA);
const tsParsed = parseMarkerSpans(KNN_TS);
const jsParsed = parseMarkerSpans(KNN_JS);
const pyParsed = parseMarkerSpans(KNN_PY);

export const KNN_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "knn.pseudo", content: pseudoParsed.content },
    cpp: { file: "knn.cpp", content: cppParsed.content },
    java: { file: "knn.java", content: javaParsed.content },
    ts: { file: "knn.ts", content: tsParsed.content },
    js: { file: "knn.js", content: jsParsed.content },
    py: { file: "knn.py", content: pyParsed.content },
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
    pseudo: KNN_PSEUDO_POINTER_HINTS,
    cpp: KNN_CPP_POINTER_HINTS,
    java: KNN_JAVA_POINTER_HINTS,
    ts: KNN_TS_POINTER_HINTS,
    js: KNN_JS_POINTER_HINTS,
    py: KNN_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: KNN_PSEUDO_POINTER_LABELS,
    cpp: KNN_CPP_POINTER_LABELS,
    java: KNN_JAVA_POINTER_LABELS,
    ts: KNN_TS_POINTER_LABELS,
    js: KNN_JS_POINTER_LABELS,
    py: KNN_PY_POINTER_LABELS,
  },
};
