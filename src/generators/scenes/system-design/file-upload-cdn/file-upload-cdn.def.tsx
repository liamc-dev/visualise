// src/generators/scenes/system-design/file-upload-cdn/file-upload-cdn-trace.ts
import type { SceneDef } from "../../registry";
import { fileUploadCdnTrace } from "./file-upload-cdn-trace";

const def: Omit<SceneDef, "id"> = {
  label: "File Upload / CDN",
  category: "System Design",
  trace: () => fileUploadCdnTrace(),

  description: (
    <>
      A simple end-to-end flow for uploading a file to object storage and
      distributing it through a CDN, with caching and async tasks.
    </>
  ),

  bullets: [
    "Client uploads file → upload server",
    "Object storage persists the file",
    "CDN edge replication distributes globally",
    "Redis cache stores resolved URL / metadata",
    "Queue triggers background processing",
  ],
};

export default def;
