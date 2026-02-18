// src/services/dto/algorithm-dto.ts
import type { CategoryDto } from "./category-dto";

export type AlgorithmDto = {
  id: string;
  key: string;
  name: string;
  categories: CategoryDto[];
};
