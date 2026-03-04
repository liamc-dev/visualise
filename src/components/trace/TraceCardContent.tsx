// src/components/trace/TraceCardContent.tsx
import React from "react";
import { Cloud, Server, Database, Archive, Layers, Boxes } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  client: Cloud,
  upload: Server,
  redis: Database,
  storage: Archive,
  queue: Layers,
  edge: Boxes,
};

export default function TraceCardContent({ meta }: { meta: Record<string, unknown> }) {
  const title = meta?.title ?? "";
  const subtitle = meta?.subtitle;
  const lines: string[] = Array.isArray(meta?.lines) ? meta.lines : [];
  const Icon = meta?.icon ? ICONS[meta.icon as string] : null;

  return (
    <div className="w-full">
      {/* header */}
      <div className="flex items-start gap-2">
        {Icon ? (
          <span className="mt-0.5 grid place-items-center h-7 w-7 rounded-lg bg-tn-surfaceSoft/35">
            <Icon size={16} className="opacity-85" />
          </span>
        ) : null}

        <div className="min-w-0">
          <div className="text-ui font-semibold tracking-tight text-tn-text leading-tight truncate">
            {title as React.ReactNode}
          </div>
          {subtitle ? (
            <div className="text-label text-tn-muted leading-tight truncate">{subtitle as React.ReactNode}</div>
          ) : null}
        </div>
      </div>

      {/* body */}
      {lines.length ? (
        <div className="mt-2 space-y-1">
          {lines.map((l, i) => (
            <div
              key={i}
              className="text-label text-tn-muted truncate opacity-90 font-mono"
            >
              {l}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
