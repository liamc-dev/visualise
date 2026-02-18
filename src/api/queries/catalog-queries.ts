// src/api/queries/catalog-queries.ts
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "../../services/catalog-service";
import type { AlgorithmDto } from "../../services/dto/algorithm-dto";
import { isBundledAlgorithm } from "../../generators/algorithms/utils/resolve-algorithm";

export function useAlgorithmCatalog(category?: string) {
  return useQuery<AlgorithmDto[]>({
    queryKey: ["catalog", "algorithms", "bundled", category ?? "all"],
    queryFn: ({ signal }) => catalogService.algorithms(category, signal),
    select: (rows) => rows.filter((a) => isBundledAlgorithm(a.key)),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev ?? [],
    meta: { toastOnError: false },
  });
}
