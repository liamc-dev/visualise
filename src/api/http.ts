// src/api/http.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { ApiError } from "./api-error";

type RefreshResponse = { accessToken: string };

// Match BE error: { code, message, timestamp }
type ApiErrorBody = {
  code?: string;
  message?: string;
  timestamp?: string;

  // fallbacks (endpoint returns default Spring format)
  error?: string;
  path?: string;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Separate client for refresh only (no interceptors) to avoid recursion
const authHttp: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function isAuthPath(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url, baseURL);
    return u.pathname === "/api/auth" || u.pathname.startsWith("/api/auth/");
  } catch {
    return url === "/api/auth" || url.startsWith("/api/auth/");
  }
}

function toApiError(err: unknown): ApiError {
  // idempotent: don't re-wrap our own errors
  if (err instanceof ApiError) return err;

  // Non-axios error
  if (!axios.isAxiosError(err)) {
    return new ApiError("Request failed", { status: 0, details: err });
  }

  const status = err.response?.status ?? 0;
  const data = err.response?.data as unknown;

  let code: string | undefined;
  let message: string | undefined;

  if (data && typeof data === "object") {
    const body = data as ApiErrorBody;
    code = body.code;
    message = body.message ?? body.error;
  } else if (typeof data === "string") {
    message = data;
  }

  if (!message) {
    message =
      status === 0
        ? "Network error. Please check your connection."
        : status === 401
          ? "Unauthorized."
          : "Request failed.";
  }

  return new ApiError(message, { status, code, details: data });
}

// ---- attach access token on requests ----
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});


// ---- refresh single-flight ----
let refreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function enqueue(): Promise<string> {
  return new Promise((resolve, reject) => queue.push({ resolve, reject }));
}

function flush(err: unknown, token?: string) {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
}

// ---- response interceptor: refresh on 401 ----
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const res = err.response;
    const cfg = err.config as RetriableConfig | undefined;

    // Network error / no config
    if (!res || !cfg) return Promise.reject(toApiError(err));

    // Only handle 401
    if (res.status !== 401) return Promise.reject(toApiError(err));

    // Never refresh for auth endpoints (login/register/refresh/logout)
    if (isAuthPath(cfg.url)) return Promise.reject(toApiError(err));

    // Prevent loops
    if (cfg._retry) return Promise.reject(toApiError(err));
    cfg._retry = true;

    try {
      // If refresh already in flight, wait for it
      if (refreshing) {
        const token = await enqueue();
        cfg.headers = cfg.headers ?? {};
        cfg.headers.Authorization = `Bearer ${token}`;
        return api(cfg);
      }

      refreshing = true;

      // Refresh using cookie
      const rr = await authHttp.post<RefreshResponse>("/api/auth/refresh");
      const token = rr.data?.accessToken;

      if (!token) {
        throw new ApiError("Session expired. Please log in again.", { status: 401 });
      }

      // Persist in-memory token + set default header
      useAuthStore.getState().setAccessToken(token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Release queued requests
      flush(null, token);

      // Retry original request
      cfg.headers = cfg.headers ?? {};
      cfg.headers.Authorization = `Bearer ${token}`;
      return api(cfg);
    } catch (refreshErr) {
      flush(refreshErr);

      const apiErr = toApiError(refreshErr);

      // Only clear local auth if the server says the session is invalid.
      // Avoid logging users out on transient network/5xx errors.
      if (apiErr.status === 401 || apiErr.status === 403) {
        useAuthStore.getState().clearAuth();
        delete api.defaults.headers.common.Authorization;
      }

      return Promise.reject(apiErr);
    } finally {
      refreshing = false;
    }
  }
);

export { api, toApiError };
