import type { CodeBundle, CodeLang } from "../../../../../types/algo-types";
import { parseMarkerSpans } from "../../../sorting/markerSpans";

import {
  BFS_PSEUDO,
  BFS_PSEUDO_POINTER_HINTS,
  BFS_PSEUDO_POINTER_LABELS,
} from "./bfs-pseudo";

import {
  BFS_CPP,
  BFS_CPP_POINTER_HINTS,
  BFS_CPP_POINTER_LABELS,
} from "./bfs-cpp";

import {
  BFS_JAVA,
  BFS_JAVA_POINTER_HINTS,
  BFS_JAVA_POINTER_LABELS,
} from "./bfs-java";

import {
  BFS_TS,
  BFS_TS_POINTER_HINTS,
  BFS_TS_POINTER_LABELS,
} from "./bfs-ts";

import {
  BFS_JS,
  BFS_JS_POINTER_HINTS,
  BFS_JS_POINTER_LABELS,
} from "./bfs-js";

import {
  BFS_PY,
  BFS_PY_POINTER_HINTS,
  BFS_PY_POINTER_LABELS,
} from "./bfs-py";

/* Parse marker spans */

const pseudoParsed = parseMarkerSpans(BFS_PSEUDO);
const cppParsed = parseMarkerSpans(BFS_CPP);
const javaParsed = parseMarkerSpans(BFS_JAVA);
const tsParsed = parseMarkerSpans(BFS_TS);
const jsParsed = parseMarkerSpans(BFS_JS);
const pyParsed = parseMarkerSpans(BFS_PY);

/* Bundle */

export const BFS_BUNDLE: CodeBundle = {
  sources: {
    pseudo: { file: "bfs.pseudo", content: pseudoParsed.content },
    cpp: { file: "bfs.cpp", content: cppParsed.content },
    java: { file: "bfs.java", content: javaParsed.content },
    ts: { file: "bfs.ts", content: tsParsed.content },
    js: { file: "bfs.js", content: jsParsed.content },
    py: { file: "bfs.py", content: pyParsed.content },
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
    pseudo: BFS_PSEUDO_POINTER_HINTS,
    cpp: BFS_CPP_POINTER_HINTS,
    java: BFS_JAVA_POINTER_HINTS,
    ts: BFS_TS_POINTER_HINTS,
    js: BFS_JS_POINTER_HINTS,
    py: BFS_PY_POINTER_HINTS,
  },

  pointerLabels: {
    pseudo: BFS_PSEUDO_POINTER_LABELS,
    cpp: BFS_CPP_POINTER_LABELS,
    java: BFS_JAVA_POINTER_LABELS,
    ts: BFS_TS_POINTER_LABELS,
    js: BFS_JS_POINTER_LABELS,
    py: BFS_PY_POINTER_LABELS,
  },
};
