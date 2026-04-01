import { useState, useCallback, useRef } from "react";
import { MastermindSolver, type Guess, type Feedback } from "@/lib/minimax";
import { SymbolButton, SymbolDisplay } from "@/components/SymbolButton";
import {
  ALL_SYMBOL_IDS,
  ACTIVE_SYMBOL_COUNT,
  CODE_LENGTH,
  MAX_GUESSES,
  SYMBOL_NAMES,
} from "@/lib/symbols";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "select-symbols" | "solving" | "solved" | "failed";

interface GuessRecord {
  guess: Guess;
  feedback: Feedback | null;
}

// ─── Background ───────────────────────────────────────────────────────────────

function HexBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 bg-[#0d0804]" />
  );
}

// ─── Feedback Input ───────────────────────────────────────────────────────────

function FeedbackInput({ onSubmit }: { onSubmit: (f: Feedback) => void }) {
  const [exact, setExact] = useState("0");
  const [partial, setPartial] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ex = parseInt(exact, 10);
    const pa = parseInt(partial, 10);
    if (isNaN(ex) || isNaN(pa) || ex < 0 || ex > 4 || pa < 0 || pa + ex > 4)
      return;
    onSubmit({ exact: ex, partial: pa });
    setExact("0");
    setPartial("0");
  };

  const selectClass =
    "bg-stone-900 border border-stone-600 text-amber-300 rounded px-2 py-2 md:px-3 text-center text-base md:text-lg font-mono focus:outline-none focus:border-amber-500 w-16 md:w-20";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-stone-400 text-xs md:text-sm">
        Enter the feedback from the game:
      </p>

      <div className="flex gap-3 md:gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-amber-400 font-medium">
            Exact
          </label>
          <select
            value={exact}
            onChange={(e) => setExact(e.target.value)}
            className={selectClass}
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-amber-400/70 font-medium">
            Partial
          </label>
          <select
            value={partial}
            onChange={(e) => setPartial(e.target.value)}
            className={cn(selectClass, "text-amber-300/70")}
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-4 md:px-5 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 text-sm md:text-base font-semibold rounded transition-colors border border-amber-500"
        >
          Submit
        </button>
      </div>

      <p className="text-stone-500 text-xs">
        Example: game shows "1,2" → Exact = 1, Partial = 2
      </p>
    </form>
  );
}

// ─── Guess Row ────────────────────────────────────────────────────────────────

function GuessRow({ record, index }: { record: GuessRecord; index: number }) {
  const isPending = record.feedback === null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded border",
        isPending
          ? "border-amber-700/60 bg-amber-950/30 shadow-[0_0_16px_rgba(245,158,11,0.1)]"
          : "border-stone-700 bg-stone-900/50"
      )}
    >
      <span className="text-stone-500 text-xs w-4 md:w-5 text-right font-mono shrink-0">
        {index + 1}.
      </span>

      <div className="flex gap-1 md:gap-2">
        {record.guess.map((sym, i) => (
          <SymbolDisplay key={i} symbolId={sym} size="responsive" />
        ))}
      </div>

      {isPending ? (
        <span className="ml-auto text-amber-500 text-xs animate-pulse">
          Awaiting…
        </span>
      ) : (
        <div className="ml-auto flex gap-2 md:gap-3 text-sm font-mono">
          <span className="text-amber-400 font-bold">{record.feedback!.exact}</span>
          <span className="text-stone-500">/</span>
          <span className="text-amber-400/60">{record.feedback!.partial}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Solver() {
  const [phase, setPhase] = useState<Phase>("select-symbols");
  const [selectedSymbols, setSelectedSymbols] = useState<number[]>([]);
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess | null>(null);
  const [remainingCount, setRemainingCount] = useState(0);
  const solverRef = useRef<MastermindSolver | null>(null);

  const toggleSymbol = useCallback((id: number) => {
    setSelectedSymbols((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= ACTIVE_SYMBOL_COUNT) return prev;
      return [...prev, id];
    });
  }, []);

  const startSolving = useCallback(() => {
    if (selectedSymbols.length !== ACTIVE_SYMBOL_COUNT) return;
    const solver = new MastermindSolver(selectedSymbols);
    solverRef.current = solver;
    const firstGuess = solver.nextGuess();
    setCurrentGuess(firstGuess);
    setGuessHistory([{ guess: firstGuess, feedback: null }]);
    setRemainingCount(solver.getRemainingCount());
    setPhase("solving");
  }, [selectedSymbols]);

  const handleFeedback = useCallback(
    (feedback: Feedback) => {
      const solver = solverRef.current;
      if (!solver || !currentGuess) return;

      solver.applyFeedback(currentGuess, feedback);
      const newRemaining = solver.getRemainingCount();

      setGuessHistory((prev) =>
        prev.map((r, i) => (i === prev.length - 1 ? { ...r, feedback } : r))
      );
      setRemainingCount(newRemaining);

      if (solver.isSolved(feedback)) { setPhase("solved"); return; }
      if (guessHistory.length >= MAX_GUESSES) { setPhase("failed"); return; }
      if (newRemaining === 0) { setPhase("failed"); return; }

      const next = solver.nextGuess();
      setCurrentGuess(next);
      setGuessHistory((prev) => [...prev, { guess: next, feedback: null }]);
    },
    [currentGuess, guessHistory.length]
  );

  const reset = useCallback(() => {
    setPhase("select-symbols");
    setSelectedSymbols([]);
    setGuessHistory([]);
    setCurrentGuess(null);
    setRemainingCount(0);
    solverRef.current = null;
  }, []);

  const completedGuesses = guessHistory.filter((g) => g.feedback !== null).length;

  return (
    // Outer shell — 3 breakpoints: mobile px-3 py-4 / tablet px-4 py-8 / desktop px-8 py-12
    <div className="relative min-h-screen flex flex-col items-center justify-start py-4 px-3 md:py-8 md:px-4 xl:py-12 xl:px-8">
      <HexBackground />

      {/* Content column — grows up to max-w at each breakpoint */}
      <div className="relative z-10 w-full max-w-sm md:max-w-xl xl:max-w-2xl flex flex-col gap-4 md:gap-6 xl:gap-8">

        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl md:text-3xl xl:text-4xl font-bold text-amber-400 tracking-widest uppercase"
            style={{ textShadow: "0 0 20px rgba(245,158,11,0.4)" }}
          >
            Ilmari War Cache
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-1 tracking-wider">
            Minotaur Vault Chest Solver
          </p>
        </div>

        {/* ── PHASE: Symbol Selection ───────────────────────────────────────── */}
        {phase === "select-symbols" && (
          <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-4 md:p-6 xl:p-8 flex flex-col gap-4 md:gap-5 xl:gap-6 backdrop-blur-sm">
            <div>
              <h2 className="text-amber-300 font-semibold text-base md:text-lg xl:text-xl">
                Step 1: Identify Active Runes
              </h2>
              <p className="text-stone-400 text-xs md:text-sm mt-1">
                Select the{" "}
                <span className="text-amber-400 font-semibold">6 runes</span>{" "}
                you believe are active in this vault.
              </p>
            </div>

            {/* Symbol grid — always 6 columns, symbol size grows per breakpoint */}
            <div className="grid grid-cols-6 gap-2 md:gap-3 xl:gap-4 justify-items-center">
              {ALL_SYMBOL_IDS.map((id) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <SymbolButton
                    symbolId={id}
                    selected={selectedSymbols.includes(id)}
                    onClick={() => toggleSymbol(id)}
                    size="responsive"
                    dimmed={
                      selectedSymbols.length === ACTIVE_SYMBOL_COUNT &&
                      !selectedSymbols.includes(id)
                    }
                  />
                  <span className="text-stone-600 text-[9px] md:text-[10px] xl:text-xs text-center leading-tight w-10 md:w-12 xl:w-14 truncate">
                    {SYMBOL_NAMES[id]}
                  </span>
                </div>
              ))}
            </div>

            {/* Count + solve button */}
            <div className="flex items-center justify-between">
              <p className="text-stone-400 text-xs md:text-sm">
                Selected:{" "}
                <span
                  className={cn(
                    "font-bold",
                    selectedSymbols.length === ACTIVE_SYMBOL_COUNT
                      ? "text-amber-400"
                      : "text-stone-300"
                  )}
                >
                  {selectedSymbols.length} / {ACTIVE_SYMBOL_COUNT}
                </span>
              </p>
              <button
                onClick={startSolving}
                disabled={selectedSymbols.length !== ACTIVE_SYMBOL_COUNT}
                className={cn(
                  "px-4 md:px-6 xl:px-8 py-2 rounded font-semibold text-sm md:text-base transition-all border",
                  selectedSymbols.length === ACTIVE_SYMBOL_COUNT
                    ? "bg-amber-700 hover:bg-amber-600 text-amber-100 border-amber-500 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-stone-800 text-stone-600 border-stone-700 cursor-not-allowed"
                )}
              >
                Solve →
              </button>
            </div>

            {/* Selected symbols preview */}
            {selectedSymbols.length > 0 && (
              <div className="border-t border-stone-800 pt-3 md:pt-4">
                <p className="text-stone-500 text-xs mb-2">Selected:</p>
                <div className="flex gap-1 md:gap-2 flex-wrap">
                  {selectedSymbols.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded px-1 md:px-2 py-1"
                    >
                      <SymbolDisplay
                        symbolId={id}
                        size="sm"
                        className="border-amber-700/50"
                      />
                      <span className="text-amber-400/80 text-xs hidden md:inline">
                        {SYMBOL_NAMES[id]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PHASES: Solving / Solved / Failed ────────────────────────────── */}
        {(phase === "solving" || phase === "solved" || phase === "failed") && (
          <div className="flex flex-col gap-3 md:gap-4 xl:gap-5">

            {/* Status bar */}
            <div className="bg-stone-900/80 border border-stone-700 rounded-lg px-3 md:px-4 py-2 md:py-3 flex items-center justify-between gap-3 backdrop-blur-sm">
              <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
                <span className="text-stone-400">
                  Guesses Remaining:{" "}
                  <span className="text-amber-400 font-bold">
                    {MAX_GUESSES - completedGuesses} / {MAX_GUESSES}
                  </span>
                </span>
                {phase === "solving" && (
                  <span className="text-stone-400">
                    Combinations Remaining:{" "}
                    <span className="text-amber-400 font-bold">
                      {remainingCount}
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={reset}
                className="shrink-0 px-3 md:px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs md:text-sm font-semibold rounded transition-colors border border-amber-500 cursor-pointer"
              >
                ← Start Over
              </button>
            </div>

            {/* Active runes reminder — full grid, active ones highlighted */}
            <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-4 md:p-6 xl:p-8 flex flex-col gap-4 md:gap-5 xl:gap-6 backdrop-blur-sm">
              <p className="text-stone-500 text-xs md:text-sm">
                Active runes for this vault:
              </p>
              <div className="grid grid-cols-6 gap-2 md:gap-3 xl:gap-4 justify-items-center">
                {ALL_SYMBOL_IDS.map((id) => (
                  <div key={id} className="flex flex-col items-center gap-1">
                    <SymbolButton
                      symbolId={id}
                      selected={selectedSymbols.includes(id)}
                      disabled
                      size="responsive"
                      dimmed={!selectedSymbols.includes(id)}
                    />
                    <span className="text-stone-600 text-[9px] md:text-[10px] xl:text-xs text-center leading-tight w-10 md:w-12 xl:w-14 truncate">
                      {SYMBOL_NAMES[id]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guess history */}
            <div className="flex flex-col gap-1 md:gap-2">
              {guessHistory.map((record, i) => (
                <GuessRow key={i} record={record} index={i} />
              ))}
            </div>

            {/* Feedback input panel */}
            {phase === "solving" && currentGuess && (
              <div className="bg-stone-900/80 border border-amber-800/50 rounded-lg p-4 md:p-5 xl:p-6 backdrop-blur-sm">
                <div className="mb-3 md:mb-4">
                  <h3 className="text-amber-300 font-semibold text-sm md:text-base">
                    Enter this guess in the game:
                  </h3>
                  <div className="flex gap-2 md:gap-3 mt-2 md:mt-3">
                    {currentGuess.map((sym, i) => (
                      <SymbolDisplay
                        key={i}
                        symbolId={sym}
                        size="responsive"
                        className="border-amber-600/70"
                      />
                    ))}
                  </div>
                  <p className="text-stone-500 text-xs mt-1 md:mt-2">
                    {currentGuess.map((s) => SYMBOL_NAMES[s]).join(" · ")}
                  </p>
                </div>
                <FeedbackInput onSubmit={handleFeedback} />
              </div>
            )}

            {/* Solved */}
            {phase === "solved" && (
              <div className="bg-amber-950/60 border border-amber-600 rounded-lg p-5 md:p-6 xl:p-8 text-center">
                <div className="text-3xl md:text-4xl mb-2">🔓</div>
                <h3 className="text-amber-300 text-lg md:text-xl xl:text-2xl font-bold">
                  Vault Opened!
                </h3>
                <p className="text-stone-400 text-sm mt-1">
                  Solved in {guessHistory.length} guess
                  {guessHistory.length !== 1 ? "es" : ""}.
                </p>
                <p className="text-amber-400/70 text-xs mt-1">
                  Combination:{" "}
                  <span className="font-semibold">
                    {currentGuess?.map((s) => SYMBOL_NAMES[s]).join(" · ")}
                  </span>
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-5 md:px-6 xl:px-8 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-semibold rounded border border-amber-500 transition-colors text-sm md:text-base"
                >
                  Solve Another Vault
                </button>
              </div>
            )}

            {/* Failed */}
            {phase === "failed" && (
              <div className="bg-red-950/40 border border-red-800 rounded-lg p-5 md:p-6 xl:p-8 text-center">
                <div className="text-3xl md:text-4xl mb-2">💀</div>
                <h3 className="text-red-400 text-lg md:text-xl xl:text-2xl font-bold">
                  Vault Sealed
                </h3>
                <p className="text-stone-400 text-sm mt-1">
                  Could not find the combination. Check that your selected
                  runes and feedback are correct.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-5 md:px-6 xl:px-8 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded border border-stone-600 transition-colors text-sm md:text-base"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-stone-700 text-xs">
          Project Gorgon · Ilmari War Cache · {CODE_LENGTH}-rune combination
          from {ACTIVE_SYMBOL_COUNT} active runes
        </p>
      </div>
    </div>
  );
}
