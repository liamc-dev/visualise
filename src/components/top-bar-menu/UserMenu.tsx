import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User2 } from "lucide-react";
import { authService } from "../../api/auth-service";
import { userService, MeResponse } from "../../api/user-service";
import { useAuthStore } from "../../stores/useAuthStore";
import { api } from "../../api/http";

function getDisplayName(me: MeResponse | null) {
  if (!me) return "Account";
  return me.username?.trim() ? me.username : me.email;
}

export default function UserMenu() {
  const nav = useNavigate();

  const token = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) {
      setMe(null);
      setOpen(false);
    }
  }, [token]);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token || !open) return;

      try {
        const data = await userService.me();
        if (!cancelled) setMe(data);
      } catch {
        
        if (!cancelled) setMe(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, token]);

 
  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onLogout() {
    setOpen(false); 
    try {
      await authService.logout();
    } finally {
      clearAuth();
      delete api.defaults.headers.common.Authorization;
      nav("/login", { replace: true });
    }
  }

  const signedInLabel = token ? getDisplayName(me) : "Not signed in";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          inline-flex items-center justify-center
          w-10 h-10 rounded-xl
          hover:bg-tn-surfaceSoft transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tn-accent/30
          ${open ? "bg-tn-surfaceSoft/70" : ""}
        `}
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User2 size={18} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="
            absolute right-0 mt-2 w-52
            rounded-2xl border border-tn-border
            bg-tn-surface/95 backdrop-blur-sm
            shadow-[0_12px_30px_rgba(0,0,0,0.18)]
            overflow-hidden
          "
        >
          <div className="px-3 py-3">
            <div className="text-label tracking-[0.18em] uppercase text-tn-subtle/70">
              {token ? "Signed in" : "Session"}
            </div>
            <div className="mt-1 text-sm font-medium text-tn-text truncate">
              {signedInLabel}
            </div>
          </div>

          <div className="h-px bg-tn-border" />

          {token ? (
            <>
              <Link
                to="/account"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-tn-surfaceSoft/70 transition-colors"
              >
                Account
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-tn-surfaceSoft/70 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-tn-surfaceSoft/70 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-tn-surfaceSoft/70 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
