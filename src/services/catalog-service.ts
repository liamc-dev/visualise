// src/services/catalog-service.ts
import { api } from "../api/http";
import type { AlgorithmDto } from "./dto/algorithm-dto";
import type { CategoryDto } from "./dto/category-dto";

export const catalogService = {
  categories: async (signal?: AbortSignal): Promise<CategoryDto[]> => {
    const res = await api.get<CategoryDto[]>("/api/categories", { signal });

    return res.data;
  },

  algorithms: async (category?: string, signal?: AbortSignal): Promise<AlgorithmDto[]> => {

    return mockData;
    
    // const res = await api.get<AlgorithmDto[]>("/api/algorithms", {
    //   signal,
    //   params: category ? { category } : undefined,
    // });
    
    // return res.data;
  },
};

const mockData = [
    {
        "id": "262871fe-eee5-47de-b468-241ac69169c3",
        "key": "bubble-sort",
        "name": "Bubble Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        "key": "bfs",
        "name": "Breadth-First Search",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
        "key": "dfs",
        "name": "Depth-First Search",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "3ef746b0-730a-472b-905e-359a0355d79c",
        "key": "dijkstra",
        "name": "Dijkstra's Shortest Path",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "f7a8b9c0-d1e2-3456-f789-0abcdef12345",
        "key": "a-star",
        "name": "A* Search",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "0a9b547b-af0d-42cf-b960-ac3f2b2566ab",
        "key": "heap-sort",
        "name": "Heap Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "69557b8c-d65f-481f-952d-ce919f092871",
        "key": "merge-sort",
        "name": "Merge Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "0e0aa9ab-d83f-4ca8-8b82-03c011f84a8d",
        "key": "quick-sort",
        "name": "Quick Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "0e0aa9ab-d83f-4ca8-8b82-03c011f84a8y",
        "key": "insertion-sort",
        "name": "Insertion Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ey",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "key": "radix-sort",
        "name": "Radix Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "e5f6a7b8-c9d0-1234-ef01-56789abcdef0",
        "key": "counting-sort",
        "name": "Counting Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "d4e5f6a7-b8c9-0123-def0-456789abcdef",
        "key": "selection-sort",
        "name": "Selection Sort",
        "categories": [
            {
                "id": "4472b151-6b88-4508-b2e4-b6cb8ecdb7ea",
                "key": "sorting",
                "name": "Sorting"
            }
        ]
    },
    {
        "id": "a1b2c3d4-e5f6-7890-abcd-binary000001",
        "key": "binary-search",
        "name": "Binary Search",
        "categories": [
            {
                "id": "b1c2d3e4-f5a6-7890-abcd-search000001",
                "key": "search",
                "name": "Search"
            }
        ]
    },
    {
        "id": "a1b2c3d4-e5f6-7890-abcd-linear000001",
        "key": "linear-search",
        "name": "Linear Search",
        "categories": [
            {
                "id": "b1c2d3e4-f5a6-7890-abcd-search000001",
                "key": "search",
                "name": "Search"
            }
        ]
    },
    {
        "id": "b2c3d4e5-f6a7-8901-bcde-bellman00001",
        "key": "bellman-ford",
        "name": "Bellman-Ford",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "c3d4e5f6-a7b8-9012-cdef-prims0000001",
        "key": "prims",
        "name": "Prim's MST",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "d4e5f6a7-b8c9-0123-cdef-kruskal00001",
        "key": "kruskals",
        "name": "Kruskal's MST",
        "categories": [
            {
                "id": "7219c7b4-c6aa-4495-9689-fde0a5066921",
                "key": "graph",
                "name": "Graph"
            }
        ]
    },
    {
        "id": "e5f6a7b8-c9d0-1234-cdef-linreg000001",
        "key": "linear-regression",
        "name": "Linear Regression",
        "categories": [
            {
                "id": "a1b2c3d4-e5f6-7890-abcd-ml0000000001",
                "key": "machine-learning",
                "name": "Machine Learning"
            }
        ]
    }
]