import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../markerSpans";

import {
  ASTAR_PSEUDO,
  ASTAR_PSEUDO_POINTER_HINTS,
  ASTAR_PSEUDO_POINTER_LABELS,
} from "./a-star-pseudo";

import {
  ASTAR_CPP,
  ASTAR_CPP_POINTER_HINTS,
  ASTAR_CPP_POINTER_LABELS,
} from "./a-star-cpp";

import {
  ASTAR_JAVA,
  ASTAR_JAVA_POINTER_HINTS,
  ASTAR_JAVA_POINTER_LABELS,
} from "./a-star-java";

import {
  ASTAR_TS,
  ASTAR_TS_POINTER_HINTS,
  ASTAR_TS_POINTER_LABELS,
} from "./a-star-ts";

import {
  ASTAR_JS,
  ASTAR_JS_POINTER_HINTS,
  ASTAR_JS_POINTER_LABELS,
} from "./a-star-js";

import {
  ASTAR_PY,
  ASTAR_PY_POINTER_HINTS,
  ASTAR_PY_POINTER_LABELS,
} from "./a-star-py";

/* ---------------------------------------------------------
   Parse marker spans
--------------------------------------------------------- */

const pseudoParsed = parseMarkerSpans(ASTAR_PSEUDO);
const cppParsed = parseMarkerSpans(ASTAR_CPP);
const javaParsed = parseMarkerSpans(ASTAR_JAVA);
const tsParsed = parseMarkerSpans(ASTAR_TS);
const jsParsed = parseMarkerSpans(ASTAR_JS);
const pyParsed = parseMarkerSpans(ASTAR_PY);

/* ---------------------------------------------------------
   Bundle
--------------------------------------------------------- */

export const ASTAR_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "a-star.pseudo", content: pseudoParsed.content },
    cpp: { file: "a-star.cpp", content: cppParsed.content },
    java: { file: "a-star.java", content: javaParsed.content },
    ts: { file: "a-star.ts", content: tsParsed.content },
    js: { file: "a-star.js", content: jsParsed.content },
    py: { file: "a-star.py", content: pyParsed.content },
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
      const minLine = Math.min(...spans.map((s) => s.line));
      const maxLine = Math.max(...spans.map((s) => s.line));
      lines = [minLine, maxLine];
    }

    return { file, lines, spans };
  },

  pointerHints: {
    pseudo: ASTAR_PSEUDO_POINTER_HINTS,
    cpp: ASTAR_CPP_POINTER_HINTS,
    java: ASTAR_JAVA_POINTER_HINTS,
    ts: ASTAR_TS_POINTER_HINTS,
    js: ASTAR_JS_POINTER_HINTS,
    py: ASTAR_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: ASTAR_PSEUDO_POINTER_LABELS,
    cpp: ASTAR_CPP_POINTER_LABELS,
    java: ASTAR_JAVA_POINTER_LABELS,
    ts: ASTAR_TS_POINTER_LABELS,
    js: ASTAR_JS_POINTER_LABELS,
    py: ASTAR_PY_POINTER_LABELS,
  },
};
