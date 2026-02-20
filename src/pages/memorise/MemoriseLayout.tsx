// src/pages/memorise/MemoriseLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";

export default function MemoriseLayout() {
  return (
    <div className="px-3 text-tn-text h-full min-h-0">
      <div className="mx-auto w-full max-w-[1100px] h-full min-h-0">
        <Panel tone="glass" className="p-4 shadow-st-card">
          <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
            Memorise
          </div>

          <Outlet />
        </Panel>
      </div>
    </div>
  );
}
