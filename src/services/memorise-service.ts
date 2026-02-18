// src/services/memorise-service.ts
import { api } from "../api/http";
import { DeckItemDto } from "./dto/deck-item-dto";



export const memoriseService = {
  deck: async (signal?: AbortSignal): Promise<DeckItemDto[]> => {
    const res = await api.get<DeckItemDto[]>("/api/memorise/deck", { signal });
    return res.data ?? [];
  },

  addToDeck: async (algorithmKey: string): Promise<void> => {
    await api.post("/api/memorise/deck", { algorithmKey });
  },

  removeFromDeck: async (algorithmKey: string): Promise<void> => {
    await api.delete(`/api/memorise/deck/${algorithmKey}`);
  },
};
