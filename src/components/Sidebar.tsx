// Sidebar.tsx
import { NavLink } from "react-router-dom";
import Logo from "../assets/avx-wave.png";

type NavItem = {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
};

function NavMenu({
  navItems,
  onItemClick,
}: {
  navItems: NavItem[];
  onItemClick?: () => void;
}) {
  return (
    <nav className="px-2 py-4 space-y-1 text-sm">
      {navItems.map((item) => (
        <div key={item.to}>
          {/* Parent item */}
          <NavLink
            to={item.to}
            onClick={onItemClick}
            className={({ isActive }) =>
              [
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-tn-card text-tn-text"
                  : "text-tn-muted hover:text-tn-text hover:bg-tn-surfaceSoft",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>

          {/* Submenu */}
          {item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-1.5 rounded-md text-xs transition-colors",
                      isActive
                        ? "bg-tn-accentSoft text-tn-text"
                        : "text-tn-subtle hover:text-tn-text hover:bg-tn-surfaceSoft",
                    ].join(" ")
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navItems: NavItem[] = [
    {
      label: "Visualiser",
      to: "/",
      children: [
        { label: "Merge Sort", to: "/visualiser/merge-sort" },
        { label: "Quick Sort", to: "/visualiser/quick-sort" },
        { label: "Bubble Sort", to: "/visualiser/bubble-sort" },
      ],
    },
    { label: "About", to: "/about" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-tn-surface/95 backdrop-blur-md border-r border-tn-border
          transform transition-transform duration-200 md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-14 flex items-center px-4 border-b border-tn-border">
          <span className="text-sm font-semibold tracking-wide text-tn-text">
            {/* optional title */}
          </span>
        </div>

        {/* ✅ Mobile submenu added */}
        <NavMenu navItems={navItems} onItemClick={onClose} />
      </aside>

      {/* Desktop collapsible */}
      <aside
        className={`
          hidden md:flex md:flex-col md:h-screen
          bg-tn-surface/90 backdrop-blur-sm border-r border-tn-border
          transition-[width] duration-200 overflow-hidden
          ${isOpen ? "w-48" : "w-0 border-r-0"}
        `}
      >
        {/* Logo */}
        <img
          src={Logo}
          alt="AV Logo"
          className="h-auto w-auto select-none pointer-events-none px-4 py-4"
        />

        <div
          className={`transition-opacity duration-150 ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* ✅ Desktop submenu added */}
          <NavMenu navItems={navItems} />
        </div>
      </aside>
    </>
  );
}
