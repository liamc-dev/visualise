// src/layout/Sidebar.tsx
import React, { useMemo, useState } from "react";
import { NavLink, useLocation, matchPath } from "react-router-dom";
import { useAlgorithmMenu } from "../hooks/use-algorithm-menu";

import {
  Info,
  Brain,
  ChevronDown,
  Dot,
  Share2,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  hideWhenCollapsed?: boolean;
};

type NavSection = {
  header: string;
  items: NavItem[];
  kind?: "primary" | "algos";
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Row ---------- */

function SideRow({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {


  const location = useLocation();
  const isSamePath = !!matchPath({ path: item.to, end: false }, location.pathname);

  if (collapsed && item.hideWhenCollapsed) return null;

  return (
    <NavLink
      to={item.to}
      onClick={(e) => {
        if (isSamePath) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-0.5 rounded-xl ",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30",
          isActive
            ? "bg-tn-card text-tn-text"
            : "text-tn-muted hover:text-tn-text hover:bg-tn-surfaceSoft"
        )
      }
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      {item.icon && (
        <span
          className={cn(
            "flex items-center justify-center text-current",
            collapsed ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg"
          )}
        >
          {item.icon}
        </span>
      )}

      {!collapsed && <span className="truncate text-ui">{item.label}</span>}
    </NavLink>
  );
}

/* ---------- Collapsible Category ---------- */

function AlgoCategory({
  header,
  items,
  collapsed,
  defaultOpen,
  onItemClick,
}: {
  header: string;
  items: NavItem[];
  collapsed: boolean;
  defaultOpen?: boolean;
  onItemClick?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(!!defaultOpen);

  if (collapsed) return null;

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between",
          "px-2 py-2 rounded-xl",
          "text-tn-subtle/80 hover:text-tn-text hover:bg-tn-surfaceSoft",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-label font-medium tracking-[0.18em] uppercase">
            {header}
          </span>
          <span className="text-label text-tn-muted/80">({items.length})</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-80 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 pb-2">
          {items.map((it) => (
            <SideRow
              key={it.to}
              item={it}
              collapsed={collapsed}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Section ---------- */

function Section({
  section,
  collapsed,
  onItemClick,
}: {
  section: NavSection;
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const items = collapsed
    ? section.items.filter((it) => !it.hideWhenCollapsed)
    : section.items;

  if (collapsed && items.length === 0) return null;

  return (
    <div className="">
      {!collapsed && (
        <div className="px-3 pb-2 text-label font-medium tracking-[0.18em] uppercase text-tn-subtle/70">
          {section.header}
        </div>
      )}

      <div className="space-y-2 px-4">
        {items.map((it) => (
          <SideRow
            key={it.to}
            item={it}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Content ---------- */

function SidebarContent({
  sections,
  collapsed,
  onItemClick,
}: {
  sections: NavSection[];
  collapsed: boolean;
  onItemClick?: () => void;
}) {

  // Search only affects algo browsing section
  const [query, setQuery] = useState("");
  
  const { groups, isLoading } = useAlgorithmMenu(query);

  {
    isLoading && (
      <div className="px-5 py-3 text-xs text-tn-muted">
        Loading algorithms…
      </div>
    )
  }


  const algoGroups: Array<{ header: string; items: NavItem[] }> = useMemo(
    () =>
      groups.map((g) => ({
        header: g.header,
        items: g.items.map((it) => ({
          label: it.label,
          to: it.to,
          icon: <Dot className="h-4 w-4" />,
          hideWhenCollapsed: true,
        })),
      })),
    [groups]
  );

  const visibleSections = collapsed
    ? sections.filter((sec) => sec.items.some((it) => !it.hideWhenCollapsed))
    : sections;

  return (
    <nav className={cn("h-full")}>
      
        {visibleSections.map((sec) => (
          <div key={sec.header}>
            <Section section={sec} collapsed={collapsed} onItemClick={onItemClick} />
          </div>
        ))}

        {/* Algorithms browser lives under the doorway, not as “main nav” */}
        {!collapsed && (
          <div className="pt-2">
            <div className="px-3 pb-2 text-label font-medium tracking-[0.18em] uppercase text-tn-subtle/70">
              Browse Algorithms
            </div>

            <div className="px-3 pb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className={cn(
                  "w-full rounded-xl border border-tn-border bg-tn-surface/70",
                  "px-3 py-2 text-ui text-tn-text placeholder:text-tn-muted/70",
                  "focus:outline-none focus:ring-2 focus:ring-tn-accent/30"
                )}
              />
            </div>

            <div className="space-y-2">
              {algoGroups.map((g, idx) => (
                <AlgoCategory
                  key={g.header}
                  header={g.header}
                  items={g.items}
                  collapsed={collapsed}
                  defaultOpen={idx === 0 && !query} // open first group by default
                  onItemClick={onItemClick}
                />
              ))}

              {algoGroups.length === 0 && (
                <div className="px-5 py-3 text-xs text-tn-muted">
                  No matches.
                </div>
              )}
            </div>
          </div>
        )}
     
    </nav>
  );
}

/* ---------- Sidebar ---------- */

export default function Sidebar({
  topOffset,
  isOpen,
  isDesktop,
  railWidth,
  openWidth,
  onClose,
}: {
  topOffset: number;
  isOpen: boolean;
  isDesktop: boolean;
  railWidth: number;
  openWidth: number;
  onClose: () => void;
}) {
  const sections = useMemo<NavSection[]>(
    () => [ 
      {
        header: "Menu",
        items: [
          { label: "Algorithms", to: "/visualiser", icon: <Share2 className="h-4 w-4" /> },
          // { label: "Memorise", to: "/memorise", icon: <Brain className="h-4 w-4" /> },
          { label: "About", to: "/about", icon: <Info className="h-4 w-4" /> },
        ],
      },
    ],
    []
  );

  const collapsed = isDesktop ? !isOpen : false;
  const width = isDesktop ? (isOpen ? openWidth : railWidth) : 288;

  const asideClass = cn(
    "border border-tn-border/15 fixed left-0 z-50 bg-tn-bg overflow-hidden py-2",
    !isDesktop && "transition-transform duration-200",
    !isDesktop && (isOpen ? "translate-x-0" : "-translate-x-full"),
    isDesktop && "z-40 transition-[width] duration-300"
  );

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          style={{ top: topOffset }}
          onClick={onClose}
        />
      )}

      <aside
        className={asideClass}
        style={{
          top: topOffset,
          height: `calc(100vh - ${topOffset}px)`,
          width,
        }}
      >
        <SidebarContent
          sections={sections}
          collapsed={collapsed}
          onItemClick={!isDesktop ? onClose : undefined}
        />
      </aside>
    </>
  );
}
