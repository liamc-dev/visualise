// AppShell.tsx
import { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";
import Sidebar from "../components/Sidebar";


export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const glowEnabled = useSettingsStore((s) => s.glowEnabled);
  useEffect(() => {
    // when glowEnabled is false → add tn-no-anim and kill all animations
    if (!glowEnabled) {
      document.body.classList.add("tn-no-anim");
    } else {
      document.body.classList.remove("tn-no-anim");
    }
  }, [glowEnabled]);

  return (
    <div className="min-h-screen bg-tn-bg text-tn-text flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <header
          className="
            h-14
            border-b border-tn-border
            bg-tn-surface/80 backdrop-blur-sm
            flex items-center gap-4
            px-4
            shadow-[0_8px_24px_rgba(0,0,0,0.45)]
          "
        >
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(v => !v)}
            className="
              p-2 rounded-md
              hover:bg-tn-surfaceSoft/80
              focus:outline-none focus:ring-2 focus:ring-tn-accent/60
              transition-colors
              md:hidden
            "
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex flex-col gap-1.5">
              <span className="block w-5 h-0.5 rounded bg-tn-text" />
              <span className="block w-5 h-0.5 rounded bg-tn-text" />
              <span className="block w-5 h-0.5 rounded bg-tn-text" />
            </div>
          </button>

          
        </header>

        <main className="flex-1 px-4 py-4 overflow-auto">
          <div className="w-full max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
