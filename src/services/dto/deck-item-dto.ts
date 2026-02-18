// src/services/dto

export type DeckItemDto = {
  algorithmKey: string;
  algorithName: string;
  status: "NEW" | "LEARNING" | "REVIEW";
  dueAt: string; // ISO
};