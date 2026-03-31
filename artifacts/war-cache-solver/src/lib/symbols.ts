// Order matches the in-game layout: top row left→right, then bottom row left→right
// Top:    Laguz, Berkano, Perthro, Ansuz, Ingwaz, Ehwaz
// Bottom: Thurisaz, Othala, Sowilo, Naudiz, Dagaz, Gebo
export const SYMBOL_NAMES = [
  "Laguz",     // 0  ᛚ
  "Berkano",   // 1  ᛒ
  "Perthro",   // 2  ᛈ
  "Ansuz",     // 3  ᚨ
  "Ingwaz",    // 4  ᛜ
  "Ehwaz",     // 5  ᛖ
  "Thurisaz",  // 6  ᚦ
  "Othala",    // 7  ᛟ
  "Sowilo",    // 8  ᛋ
  "Naudiz",    // 9  ᚾ
  "Dagaz",     // 10 ᛞ
  "Gebo",      // 11 ᚷ
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
