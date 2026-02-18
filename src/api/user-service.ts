// src/api/user-service.ts
import { api, toApiError } from "./http";

export type MeResponse = { email: string; username?: string | null; role: string };

export const userService = {
  async me(): Promise<MeResponse> {
    try {
      const res = await api.get<MeResponse>("/api/users/me");
      return res.data;
    } catch (e) {
      throw toApiError(e);
    }
  },
};
