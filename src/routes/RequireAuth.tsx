import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const location = useLocation();

  if (!isBootstrapped) return null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
