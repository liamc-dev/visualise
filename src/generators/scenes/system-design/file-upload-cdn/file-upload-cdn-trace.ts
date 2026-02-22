// src/generators/scenes/system-design/file-upload-cdn/file-upload-cdn-trace.ts
import type { TraceFrame, TracePointer, TraceScene } from "../../../../types/trace-types";
import { computeSceneBounds } from "../../../../components/trace/utils/trace-bounds";

import {
  makeFileUploadCdnLayout,
  type FileUploadCdnNodeKey,
  type FileUploadCdnEdgeKey,
} from "./file-upload-cdn-layout";

/**
 * - Keep all rendering concerns inside buildScene()
 * - Keep all progression logic inside step.* functions
 * - Use pushFrame() as the single place that writes frames
 * - Support branching scenarios without duplicating logic
 */

type FlowState = {
  filename: string;

  cacheKeys: number;
  cacheEntry?: string;

  uploaded: boolean;
  stored: boolean;
  enqueued: boolean;
  replicated: boolean;
  servedFromEdge: boolean;

  edgeHasFile: boolean;
};

export type FileUploadCdnTraceArgs = {
  filename?: string;
  replicationDelaySec?: number;
  cacheExpiration?: string;

  /** If true, edge already has the file at the start (warm cache demo) */
  startEdgeWarm?: boolean;

  /** If true, simulate the "first request" path after upload */
  includeClientRequest?: boolean;
};

type PushArgs = {
  kind: string;
  codeToken?: string;
  narrationToken?: string;
  focus?: FileUploadCdnNodeKey[];
  focusEdges?: FileUploadCdnEdgeKey[];
  pointers?: (TracePointer | null)[];
  caption: string;
  meta?: Record<string, unknown>;
};

export function fileUploadCdnTrace(args?: FileUploadCdnTraceArgs): TraceFrame[] {
  const layout = makeFileUploadCdnLayout();

  const state: FlowState = {
    filename: args?.filename ?? "photo.jpg",
    cacheKeys: 0,

    uploaded: false,
    stored: false,
    enqueued: false,
    replicated: false,
    servedFromEdge: false,

    edgeHasFile: !!args?.startEdgeWarm,
  };

  const frames: TraceFrame[] = [];
  let stepNo = 0;

  const nodeId = (k: FileUploadCdnNodeKey) => `sd:${k}`;

  const cfg = {
    replicationDelaySec: args?.replicationDelaySec ?? 3,
    cacheExpiration: args?.cacheExpiration ?? "30m",
    includeClientRequest: args?.includeClientRequest ?? true,
  };

  const cardTitle = (k: FileUploadCdnNodeKey) => {
    switch (k) {
      case "client":
        return "Client";
      case "uploadServer":
        return "Upload Server";
      case "redis":
        return "Redis Cache";
      case "objectStorage":
        return "Object Storage";
      case "taskQueue":
        return "Task Queue";
      case "edgeServers":
        return "Edge Servers";
    }
  };

  // --- Card geometry intent -------------------------------------------------
  const CARD_W_COLS = 4.6;
  const CARD_H_ROWS = 2.55;

  const cardSizeMeta = () => ({
    wCols: CARD_W_COLS,
    hRows: CARD_H_ROWS,
  });

  const roleFor = (k: FileUploadCdnNodeKey) => {
    if (k === "edgeServers") return state.edgeHasFile ? "warm" : "cold";
    if (k === "redis") return state.cacheKeys ? "warm" : "cold";
    return "normal";
  };

  // ---------------------------------------------------------
  // Authoring helpers (GRID coords)
  // ---------------------------------------------------------

  const pt = (x: number, y: number) => ({ x, y });

  // --- Scene builder (single source of truth for visuals) -------------------
  const buildScene = (caption: string): TraceScene => {
    const nodes: TraceScene["nodes"] = [];

    const addCard = (k: FileUploadCdnNodeKey, meta: Record<string, unknown> = {}) => {
      const p = layout.pos[k];

      nodes.push({
        id: nodeId(k),
        kind: "card",
        pos: { x: p.x, y: p.y, depth: p.depth },
        meta: {
          title: cardTitle(k),
          role: roleFor(k),
          ...cardSizeMeta(),
          ...meta,
        },
      });
    };

    addCard("client", {
      subtitle: state.servedFromEdge ? "Request served" : state.uploaded ? "Uploaded" : "Idle",
      lines: [
        `file: ${state.filename}`,
        state.servedFromEdge && state.cacheEntry ? `GET ${state.cacheEntry}` : "",
      ].filter(Boolean),
    });

    addCard("uploadServer", {
      subtitle: state.uploaded ? "Received upload" : "Idle",

      icon: "upload",     // small header icon
      bgIcon: "upload",   // large background icon
      bgIconOpacity: 0.08,
      bgIconScale: 3.0,
      bgIconAlign: "right",

      wCols: 3.6,
      hRows: 2.55,

      lines: [
        state.uploaded ? `POST /upload (${state.filename})` : "waiting…",
        state.stored ? "stored: ✅" : "stored: —",
        state.enqueued ? "queued: ✅" : "queued: —",
      ],
    });

    addCard("redis", {
      subtitle: state.cacheKeys ? "Key present" : "Empty",
      lines: [
        `cache keys: ${state.cacheKeys}`,
        state.cacheEntry ? `cdn url: ${state.cacheEntry}` : "cdn url: —",
        `ttl: ${cfg.cacheExpiration}`,
      ],
    });

    addCard("objectStorage", {
      subtitle: state.stored ? "Stored" : "Empty",
      lines: ["bucket: /uploads", state.stored ? `object: ${state.filename}` : "object: —"],
    });

    addCard("taskQueue", {
      subtitle: state.enqueued ? "Job queued" : "Idle",
      lines: [
        "type: distributed queue",
        state.enqueued ? `job: replicate(${state.filename})` : "job: —",
      ],
    });

    addCard("edgeServers", {
      subtitle: state.edgeHasFile ? "Cache warm" : "Cache cold",
      lines: [
        state.edgeHasFile ? `has: ${state.filename}` : "has: —",
        `replication: ${state.replicated ? "done" : "pending"}`,
        `delay: ~${cfg.replicationDelaySec}s`,
      ],
    });

    const edgeMeta = (id: FileUploadCdnEdgeKey) => {
      switch (id) {
        case "client_to_upload":
          return {
            arrow: true,
            fromPt: pt(12.0, 3.8),
            toPt: pt(12.0, 5.4),
          };

        case "upload_to_storage":
          return {
            arrow: true,
            fromPt: pt(12.0, 7.8),
            toPt: pt(12.0, 11.4),
          };

        case "upload_to_redis":
          return {
            arrow: true,
            dashed: true,
            fromPt: pt(11.3, 6.5),
            toPt: pt(4.9, 11.4),
            via: [pt(7.0, 6.5)],
          };

        case "upload_to_queue":
          return {
            arrow: true,
            fromPt: pt(14.8, 6.5),
            toPt: pt(19.4, 8.0),
            curveVia: pt(17.9, 6.0),
          };

        case "queue_to_edges":
          return {
            arrow: true,
            fromPt: pt(21.1, 9.3),  // bottom of Queue
            toPt: pt(21.1, 11.4),   // top of Edge Servers
          };

        case "edges_to_storage":
          return {
            arrow: true,
            dashed: true,
            fromPt: pt(19.3, 12.2), // left of Edge Servers
            toPt: pt(14.8, 12.2),   // right of Object Storage
          };

        case "edges_to_client":
          return {
            arrow: true,
            fromPt: pt(19.5, 11.4), // top-left-ish of Edge Servers
            toPt: pt(14.7, 3.75),    // right-ish of Client

          };

        default:
          return { arrow: true };
      }
    };


    const edges = layout.edges.map((e) => {
      const m = edgeMeta(e.id);

      return {
        id: `e:${e.id}`,
        from: nodeId(e.from),
        to: nodeId(e.to),
        kind: e.kind === "dashed" ? "dashed" : "flow",
        meta: {
          style: e.kind ?? "solid",
          bubble: e.bubble,

          // allow layout to set base style, but authoring meta wins
          ...(e.kind === "dashed" ? { style: "dashed" } : null),

          ...m,
        },
      };
    });

    const overlays: TraceScene["overlays"] = [
      {
        kind: "caption",
        id: "caption",
        x: layout.caption.x,
        y: layout.caption.y,
        text: caption,
        emphasis: "soft",
      },
    ];

    const scene: TraceScene = { nodes, edges, overlays };
    scene.bounds = computeSceneBounds(scene);

    return scene;
  };

  // --- Small pointer helpers ------------------------------------------------
  const stepBubble = (
    stepLabel: string,
    edgeId: FileUploadCdnEdgeKey,
    lane: "above" | "on" | "below" = "on"
  ) => {
    const e = layout.edges.find((x) => x.id === edgeId);
    if (!e) return null;

    return {
      id: `step:${stepLabel}`,
      label: stepLabel,
      target: { kind: "pos", x: e.bubble.x, y: e.bubble.y, anchor: "center" },
      lane,
      color: "var(--color-tn-warning)",
    } satisfies TracePointer;
  };

  // --- Single write-path for frames ----------------------------------------
  const pushFrame = (p: PushArgs) => {
    const focusNodes = (p.focus ?? []).map(nodeId);
    const focusEdges = (p.focusEdges ?? []).map((e) => `e:${e}`);

    const pointers = (p.pointers ?? []).filter(Boolean) as TracePointer[];
    for (const ptr of pointers) {
      if (ptr.target.kind === "node") focusNodes.push(ptr.target.nodeId);
    }

    frames.push({
      id: `fucdn.${p.kind}.${stepNo++}`,
      kind: p.kind,
      codeToken: p.codeToken,
      narrationToken: p.narrationToken,
      scene: buildScene(p.caption),
      focus: {
        nodes: focusNodes.length ? focusNodes : undefined,
        edges: focusEdges.length ? focusEdges : undefined,
        pointers: pointers.length ? pointers : undefined,
      },
      meta: {
        filename: state.filename,
        cacheKeys: state.cacheKeys,
        cacheEntry: state.cacheEntry,
        replicationDelaySec: cfg.replicationDelaySec,
        cacheExpiration: cfg.cacheExpiration,
        ...p.meta,
      },
    });
  };

  // --- Semantic step DSL ----------------------------------------------------
  const step = {
    init() {
      pushFrame({
        kind: "init",
        codeToken: "sd.init",
        narrationToken: "sd.init",
        focus: [
          "client",
          "uploadServer",
          "redis",
          "objectStorage",
          "taskQueue",
          "edgeServers",
        ],
        caption: state.edgeHasFile
          ? "System ready: edge cache already warm"
          : "System ready: waiting for upload",
        meta: { startEdgeWarm: state.edgeHasFile },
      });
    },

    upload() {
      state.uploaded = true;
      pushFrame({
        kind: "upload",
        codeToken: "sd.upload",
        narrationToken: "sd.upload",
        focus: ["client", "uploadServer"],
        focusEdges: ["client_to_upload"],
        pointers: [stepBubble("1", "client_to_upload")],
        caption: `1) Client uploads ${state.filename} to the upload server`,
        meta: { step: 1 },
      });
    },

    store() {
      state.stored = true;
      pushFrame({
        kind: "store",
        codeToken: "sd.store",
        narrationToken: "sd.store",
        focus: ["uploadServer", "objectStorage"],
        focusEdges: ["upload_to_storage"],
        pointers: [stepBubble("2", "upload_to_storage")],
        caption: `2) Upload server stores ${state.filename} in object storage`,
        meta: { step: 2 },
      });
    },

    cacheWrite() {
      state.cacheKeys = 1;
      state.cacheEntry = `https://cdn.domain.com/${state.filename}`;

      pushFrame({
        kind: "cache_write",
        codeToken: "sd.cache_write",
        narrationToken: "sd.cache_write",
        focus: ["uploadServer", "redis"],
        focusEdges: ["upload_to_redis"],
        pointers: [stepBubble("3", "upload_to_redis")],
        caption: "3) Upload server writes CDN URL to Redis cache",
        meta: { step: 3 },
      });
    },

    enqueueReplication() {
      state.enqueued = true;
      pushFrame({
        kind: "enqueue",
        codeToken: "sd.enqueue",
        narrationToken: "sd.enqueue",
        focus: ["uploadServer", "taskQueue"],
        focusEdges: ["upload_to_queue"],
        pointers: [stepBubble("4", "upload_to_queue")],
        caption: "4) Upload server enqueues replication job",
        meta: { step: 4 },
      });
    },

    replicateStart() {
      pushFrame({
        kind: "replicate_start",
        codeToken: "sd.replicate_start",
        narrationToken: "sd.replicate_start",
        focus: ["taskQueue", "edgeServers"],
        focusEdges: ["queue_to_edges"],
        pointers: [stepBubble("5", "queue_to_edges")],
        caption: "5) Workers push replication tasks to edge servers",
        meta: { step: 5 },
      });
    },

    originFetch() {
      pushFrame({
        kind: "origin_fetch",
        codeToken: "sd.origin_fetch",
        narrationToken: "sd.origin_fetch",
        focus: ["edgeServers", "objectStorage"],
        focusEdges: ["edges_to_storage"],
        pointers: [stepBubble("6", "edges_to_storage")],
        caption: `6) Edge servers origin-fetch ${state.filename} from object storage`,
        meta: { step: 6 },
      });
    },

    replicateDone() {
      state.replicated = true;
      state.edgeHasFile = true;

      pushFrame({
        kind: "replicate_done",
        codeToken: "sd.replicate_done",
        narrationToken: "sd.replicate_done",
        focus: ["edgeServers"],
        caption: `Replication complete: edges now cache ${state.filename}`,
        meta: { distributed: true },
      });
    },

    serveFromEdge() {
      state.servedFromEdge = true;

      pushFrame({
        kind: "serve",
        codeToken: "sd.serve",
        narrationToken: "sd.serve",
        focus: ["client", "edgeServers"],
        focusEdges: ["edges_to_client"],
        pointers: [stepBubble("7", "edges_to_client")],
        caption:
          "7) Client requests CDN URL and is served from nearest edge",
        meta: { step: 7 },
      });
    },

    done() {
      pushFrame({
        kind: "done",
        codeToken: "sd.done",
        narrationToken: "sd.done",
        caption: `Done: ${state.filename} is ${state.edgeHasFile ? "warm" : "not warm"
          } in edge caches`,
        meta: { done: true },
      });
    },
  };


  // --- Scenario runner -------------------------------------------------------
  const scenario = {
    happyPath() {
      step.init();
      step.upload();
      step.store();
      step.cacheWrite();
      step.enqueueReplication();
      step.replicateStart();
      step.originFetch();
      step.replicateDone();
      if (cfg.includeClientRequest) step.serveFromEdge();
      step.done();
    },

    warmEdgeServeOnly() {
      step.init();

      if (cfg.includeClientRequest) {
        if (!state.cacheEntry) {
          state.cacheKeys = 1;
          state.cacheEntry = `https://cdn.domain.com/${state.filename}`;
        }
        step.serveFromEdge();
      }

      step.done();
    },
  };

  if (state.edgeHasFile) scenario.warmEdgeServeOnly();
  else scenario.happyPath();

  return frames;
}
