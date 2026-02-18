// src/api/auth-service.ts
import { api, toApiError } from "./http";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; username?: string };
export type AuthResponse = { accessToken: string };

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/api/auth/login", payload);
      return res.data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/api/auth/register", payload);
      return res.data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async refresh(): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/api/auth/refresh");
      return res.data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async bootstrapSession(): Promise<AuthResponse | null> {
    try {
      const res = await api.post<AuthResponse>("/api/auth/refresh");
      return res.data?.accessToken ? res.data : null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      throw toApiError(e);
    }
  },
};
