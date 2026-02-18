// src/generators/scenes/system-design/file-upload-cdn/file-upload-cdn-layout.ts

export type FileUploadCdnNodeKey =
  | "client"
  | "uploadServer"
  | "redis"
  | "objectStorage"
  | "taskQueue"
  | "edgeServers";

export type FileUploadCdnEdgeKey =
  | "client_to_upload"
  | "upload_to_storage"
  | "upload_to_redis"
  | "upload_to_queue"
  | "queue_to_edges"
  | "edges_to_storage"
  | "edges_to_client";

type Pos = { x: number; y: number; depth?: number };

export function makeFileUploadCdnLayout() {
  // 26x20 grid
  // Layout roughly matching the mock:
  // - client top center
  // - upload server center
  // - bottom row: redis / object storage / edge servers
  // - task queue right side

  const pos: Record<FileUploadCdnNodeKey, Pos> = {
    client: { x: 12, y: 2, depth: 0 },
    uploadServer: { x: 12, y: 6, depth: 0 },

    // bottom row
    redis: { x: 4, y: 12, depth: 0 },
    objectStorage: { x: 12, y: 12, depth: 0 },
    edgeServers: { x: 20, y: 12, depth: 0 },

    // right column
    taskQueue: { x: 20, y: 7.5, depth: 0 },
  };

  // caption bar position (near bottom, centered-ish)
  const caption = { x: 12, y: 17.2 };

  const edges: Array<{
    id: FileUploadCdnEdgeKey;
    from: FileUploadCdnNodeKey;
    to: FileUploadCdnNodeKey;
    kind?: "solid" | "dashed";
    bubble: { x: number; y: number };
  }> = [
    // 1) client -> upload
    {
      id: "client_to_upload",
      from: "client",
      to: "uploadServer",
      kind: "solid",
      bubble: { x: 12, y: 4.2 },
    },

    // 2) upload -> object storage
    {
      id: "upload_to_storage",
      from: "uploadServer",
      to: "objectStorage",
      kind: "solid",
      bubble: { x: 12, y: 9.5 },
    },

    // 3) upload -> redis (often dashed)
    {
      id: "upload_to_redis",
      from: "uploadServer",
      to: "redis",
      kind: "dashed",
      bubble: { x: 8.0, y: 8.3 },
    },

    // 4) upload -> queue
    {
      id: "upload_to_queue",
      from: "uploadServer",
      to: "taskQueue",
      kind: "solid",
      bubble: { x: 16.8, y: 6.3 },
    },

    // 5) queue -> edges
    {
      id: "queue_to_edges",
      from: "taskQueue",
      to: "edgeServers",
      kind: "solid",
      bubble: { x: 20.0, y: 10.0 },
    },

    // 6) edges -> storage (origin fetch dashed)
    {
      id: "edges_to_storage",
      from: "edgeServers",
      to: "objectStorage",
      kind: "dashed",
      bubble: { x: 16.3, y: 12.0 },
    },

    // 7) edges -> client (serve back)
    {
      id: "edges_to_client",
      from: "edgeServers",
      to: "client",
      kind: "solid",
      bubble: { x: 16.0, y: 3.2 },
    },
  ];

  return { pos, edges, caption };
}
