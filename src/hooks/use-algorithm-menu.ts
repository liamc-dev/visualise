import { useMemo } from "react";
import { useAlgorithmCatalog } from "../api/queries/catalog-queries";

export type AlgorithmMenuItem = {
  label: string;
  to: string;
  supported: boolean;
};

export type AlgorithmMenuGroup = {
  header: string;
  items: AlgorithmMenuItem[];
};

export function useAlgorithmMenu(query: string): {
  groups: AlgorithmMenuGroup[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
} {
  const { data: items = [], isLoading, isError, error } = useAlgorithmCatalog();
  
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((a) => a.name.toLowerCase().includes(q))
      : items;

    const grouped = new Map<string, AlgorithmMenuItem[]>();

    for (const a of filtered) {
      const header = a.categories?.[0]?.name ?? "Other";

      const arr = grouped.get(header) ?? [];
      arr.push({
        label: a.name,
        to: `/visualiser/${a.key}`,
        supported: true,
      });
      grouped.set(header, arr);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([header, groupItems]) => ({
        header,
        items: groupItems.sort((a, b) => a.label.localeCompare(b.label)),
      }));
  }, [items, query]);

  return { groups, isLoading, isError, error };
}
