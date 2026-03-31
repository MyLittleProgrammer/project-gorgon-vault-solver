import { CODE_LENGTH } from "./symbols";

export type Guess = number[];
export type Feedback = { exact: number; partial: number };

export function scoreFeedback(secret: Guess, guess: Guess): Feedback {
  let exact = 0;
  let partial = 0;
  const secretCounts: Record<number, number> = {};
  const guessCounts: Record<number, number> = {};

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secret[i] === guess[i]) {
      exact++;
    } else {
      secretCounts[secret[i]] = (secretCounts[secret[i]] ?? 0) + 1;
      guessCounts[guess[i]] = (guessCounts[guess[i]] ?? 0) + 1;
    }
  }

  for (const sym of Object.keys(guessCounts)) {
    const s = Number(sym);
    partial += Math.min(guessCounts[s], secretCounts[s] ?? 0);
  }

  return { exact, partial };
}

function feedbackKey(f: Feedback): string {
  return `${f.exact},${f.partial}`;
}

function generateAllCodes(symbols: number[]): Guess[] {
  const codes: Guess[] = [];
  const n = symbols.length;
  for (let a = 0; a < n; a++)
    for (let b = 0; b < n; b++)
      for (let c = 0; c < n; c++)
        for (let d = 0; d < n; d++)
          codes.push([symbols[a], symbols[b], symbols[c], symbols[d]]);
  return codes;
}

export class MastermindSolver {
  private allCodes: Guess[];
  private remaining: Guess[];
  private unusedGuesses: Guess[];
  private guessNumber: number = 0;
  private activeSymbols: number[];

  constructor(activeSymbols: number[]) {
    this.activeSymbols = activeSymbols;
    this.allCodes = generateAllCodes(activeSymbols);
    this.remaining = [...this.allCodes];
    this.unusedGuesses = [...this.allCodes];
    this.guessNumber = 0;
  }

  nextGuess(): Guess {
    this.guessNumber++;

    if (this.remaining.length === 1) return this.remaining[0];

    if (this.guessNumber === 1) {
      const s = this.activeSymbols;
      return [s[0], s[1], s[2], s[3]];
    }

    let bestGuess: Guess = this.unusedGuesses[0];
    let bestScore = Infinity;

    for (const guess of this.unusedGuesses) {
      const partitions: Record<string, number> = {};
      for (const poss of this.remaining) {
        const key = feedbackKey(scoreFeedback(poss, guess));
        partitions[key] = (partitions[key] ?? 0) + 1;
      }

      const worstCase = Math.max(...Object.values(partitions));

      if (
        worstCase < bestScore ||
        (worstCase === bestScore && this.remaining.some((r) => r.every((v, i) => v === guess[i])))
      ) {
        bestScore = worstCase;
        bestGuess = guess;
      }
    }

    return bestGuess;
  }

  applyFeedback(guess: Guess, feedback: Feedback): void {
    this.remaining = this.remaining.filter(
      (poss) => feedbackKey(scoreFeedback(poss, guess)) === feedbackKey(feedback)
    );
    this.unusedGuesses = this.unusedGuesses.filter(
      (g) => !g.every((v, i) => v === guess[i])
    );
  }

  getRemainingCount(): number {
    return this.remaining.length;
  }

  isSolved(feedback: Feedback): boolean {
    return feedback.exact === CODE_LENGTH;
  }

  getRemaining(): Guess[] {
    return this.remaining;
  }
}
