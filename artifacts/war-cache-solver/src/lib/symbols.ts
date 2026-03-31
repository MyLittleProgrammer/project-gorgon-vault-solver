export const SYMBOL_NAMES = [
  "Fehu",
  "Berkanan",
  "Cen",
  "Gebo",
  "Othalan",
  "Mannaz",
  "Dagaz",
  "Ingwaz",
  "Sowilo",
  "Tiwaz",
  "Ehwaz",
  "Algiz",
] as const;

export type SymbolName = (typeof SYMBOL_NAMES)[number];

export const SYMBOL_COUNT = 12;
export const ACTIVE_SYMBOL_COUNT = 6;
export const CODE_LENGTH = 4;
export const MAX_GUESSES = 12;

export type SymbolId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const ALL_SYMBOL_IDS: SymbolId[] = Array.from(
  { length: SYMBOL_COUNT },
  (_, i) => i as SymbolId,
);
