// src/api/queries/memorise-queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memoriseService } from "../../services/memorise-service";

export function useMyDeck() {
  return useQuery({
    queryKey: ["memorise", "deck"],
    queryFn: ({ signal }) => memoriseService.deck(signal),
    staleTime: 10_000,
  });
}

export function useAddToDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (algorithmKey: string) => memoriseService.addToDeck(algorithmKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memorise", "deck"] }),
  });
}

export function useRemoveFromDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (algorithmKey: string) =>
      memoriseService.removeFromDeck(algorithmKey),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["memorise", "deck"] }),
  });
}
