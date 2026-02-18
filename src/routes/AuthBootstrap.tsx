// src/routes/AuthBootstrap.tsx
import { useEffect } from "react";
import { authService } from "../api/auth-service";
import { useAuthStore } from "../stores/useAuthStore";

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await authService.bootstrapSession();
        if (cancelled) return;
        if (res?.accessToken) setAccessToken(res.accessToken);
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    }

    if (!isBootstrapped) run();

    return () => {
      cancelled = true;
    };
  }, [isBootstrapped, setAccessToken, setBootstrapped]);

  if (!isBootstrapped) {
    return (
      <div className="h-full min-h-0 grid place-items-center text-tn-text">
        <div className="text-sm text-tn-muted">Starting session…</div>
      </div>
    );
  }

  return <>{children}</>;
}
