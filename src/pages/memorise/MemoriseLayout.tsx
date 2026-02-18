// src/pages/memorise/MemoriseLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function MemoriseLayout() {
  return (
    <div className="px-3 text-tn-text h-full min-h-0">
      <div className="mx-auto w-full max-w-[1100px] h-full min-h-0">
        <div
          className="rounded-2xl border border-tn-border bg-tn-surface/85 backdrop-blur-sm p-4"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
            Memorise
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
