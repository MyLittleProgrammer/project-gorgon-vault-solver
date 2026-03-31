import { useState, useCallback, useRef } from "react";
import { MastermindSolver, type Guess, type Feedback } from "@/lib/minimax";
import { SymbolButton, SymbolDisplay } from "@/components/SymbolButton";
import { ALL_SYMBOL_IDS, ACTIVE_SYMBOL_COUNT, CODE_LENGTH, MAX_GUESSES, SYMBOL_NAMES } from "@/lib/symbols";
import { cn } from "@/lib/utils";

type Phase = "select-symbols" | "solving" | "solved" | "failed";

interface GuessRecord {
  guess: Guess;
  feedback: Feedback | null;
}

function HexBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1c1407_0%,_#0a0805_60%,_#000_100%)]" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpath d='M30 2 L58 17 L58 47 L30 62 L2 47 L2 17 Z' fill='none' stroke='%23d97706' strokeWidth='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

function FeedbackInput({ onSubmit }: { onSubmit: (f: Feedback) => void }) {
  const [exact, setExact] = useState<string>("0");
  const [partial, setPartial] = useState<string>("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ex = parseInt(exact, 10);
    const pa = parseInt(partial, 10);
    if (isNaN(ex) || isNaN(pa) || ex < 0 || ex > 4 || pa < 0 || pa + ex > 4) return;
    onSubmit({ exact: ex, partial: pa });
    setExact("0");
    setPartial("0");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-stone-400 text-sm">Enter the feedback from the game:</p>
      <div className="flex gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-amber-400 font-medium">Exact (correct position)</label>
          <select
            value={exact}
            onChange={(e) => setExact(e.target.value)}
            className="bg-stone-900 border border-stone-600 text-amber-300 rounded px-3 py-2 text-center text-lg font-mono focus:outline-none focus:border-amber-500 w-20"
          >
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-amber-400/70 font-medium">Partial (wrong position)</label>
          <select
            value={partial}
            onChange={(e) => setPartial(e.target.value)}
            className="bg-stone-900 border border-stone-600 text-amber-300/70 rounded px-3 py-2 text-center text-lg font-mono focus:outline-none focus:border-amber-500 w-20"
          >
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-semibold rounded transition-colors border border-amber-500"
        >
          Submit
        </button>
      </div>
      <p className="text-stone-500 text-xs">
        Example: the game shows "1,2" → Exact = 1, Partial = 2
      </p>
    </form>
  );
}

function GuessRow({ record, index }: { record: GuessRecord; index: number }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded border",
      record.feedback
        ? "border-stone-700 bg-stone-900/50"
        : "border-amber-700/60 bg-amber-950/30 shadow-[0_0_16px_rgba(245,158,11,0.1)]"
    )}>
      <span className="text-stone-500 text-xs w-5 text-right font-mono">{index + 1}.</span>
      <div className="flex gap-2">
        {record.guess.map((sym, i) => (
          <SymbolDisplay key={i} symbolId={sym} size="sm" />
        ))}
      </div>
      {record.feedback ? (
        <div className="ml-auto flex gap-3 text-sm font-mono">
          <span className="text-amber-400 font-bold">{record.feedback.exact}</span>
          <span className="text-stone-500">/</span>
          <span className="text-amber-400/60">{record.feedback.partial}</span>
        </div>
      ) : (
        <span className="ml-auto text-amber-500 text-xs animate-pulse">Awaiting feedback…</span>
      )}
    </div>
  );
}

export default function Solver() {
  const [phase, setPhase] = useState<Phase>("select-symbols");
  const [selectedSymbols, setSelectedSymbols] = useState<number[]>([]);
  const [guessHistory, setGuessHistory] = useState<GuessRecord[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Guess | null>(null);
  const [remainingCount, setRemainingCount] = useState<number>(0);
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

  const handleFeedback = useCallback((feedback: Feedback) => {
    const solver = solverRef.current;
    if (!solver || !currentGuess) return;

    solver.applyFeedback(currentGuess, feedback);
    const newRemaining = solver.getRemainingCount();

    setGuessHistory((prev) =>
      prev.map((r, i) =>
        i === prev.length - 1 ? { ...r, feedback } : r
      )
    );
    setRemainingCount(newRemaining);

    if (solver.isSolved(feedback)) {
      setPhase("solved");
      return;
    }

    if (guessHistory.length >= MAX_GUESSES) {
      setPhase("failed");
      return;
    }

    if (newRemaining === 0) {
      setPhase("failed");
      return;
    }

    const nextGuess = solver.nextGuess();
    setCurrentGuess(nextGuess);
    setGuessHistory((prev) => [...prev, { guess: nextGuess, feedback: null }]);
  }, [currentGuess, guessHistory.length]);

  const reset = useCallback(() => {
    setPhase("select-symbols");
    setSelectedSymbols([]);
    setGuessHistory([]);
    setCurrentGuess(null);
    setRemainingCount(0);
    solverRef.current = null;
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-8 px-4">
      <HexBackground />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400 tracking-widest uppercase"
            style={{ textShadow: "0 0 20px rgba(245,158,11,0.4)" }}>
            Ilmari War Cache
          </h1>
          <p className="text-stone-500 text-sm mt-1 tracking-wider">Vault Solver · Knuth Minimax</p>
        </div>

        {/* Symbol Selection Phase */}
        {phase === "select-symbols" && (
          <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-6 flex flex-col gap-5 backdrop-blur-sm">
            <div>
              <h2 className="text-amber-300 font-semibold text-lg">Step 1: Identify Active Symbols</h2>
              <p className="text-stone-400 text-sm mt-1">
                Select the <span className="text-amber-400 font-semibold">6 symbols</span> you believe are active in this vault.
                These are the only symbols the puzzle uses.
              </p>
            </div>

            <div className="grid grid-cols-6 gap-3 justify-items-center">
              {ALL_SYMBOL_IDS.map((id) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <SymbolButton
                    symbolId={id}
                    selected={selectedSymbols.includes(id)}
                    onClick={() => toggleSymbol(id)}
                    size="md"
                    dimmed={selectedSymbols.length === ACTIVE_SYMBOL_COUNT && !selectedSymbols.includes(id)}
                  />
                  <span className="text-stone-600 text-[10px] text-center leading-tight w-12 truncate">
                    {SYMBOL_NAMES[id]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-stone-400 text-sm">
                Selected:{" "}
                <span className={cn(
                  "font-bold",
                  selectedSymbols.length === ACTIVE_SYMBOL_COUNT ? "text-amber-400" : "text-stone-300"
                )}>
                  {selectedSymbols.length} / {ACTIVE_SYMBOL_COUNT}
                </span>
              </p>
              <button
                onClick={startSolving}
                disabled={selectedSymbols.length !== ACTIVE_SYMBOL_COUNT}
                className={cn(
                  "px-6 py-2 rounded font-semibold transition-all border",
                  selectedSymbols.length === ACTIVE_SYMBOL_COUNT
                    ? "bg-amber-700 hover:bg-amber-600 text-amber-100 border-amber-500 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-stone-800 text-stone-600 border-stone-700 cursor-not-allowed"
                )}
              >
                Solve →
              </button>
            </div>

            {selectedSymbols.length > 0 && (
              <div className="border-t border-stone-800 pt-3">
                <p className="text-stone-500 text-xs mb-2">Selected symbols:</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedSymbols.map((id) => (
                    <div key={id} className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded px-2 py-1">
                      <SymbolDisplay symbolId={id} size="sm" className="w-7 h-7 border-amber-700/50" />
                      <span className="text-amber-400/80 text-xs">{SYMBOL_NAMES[id]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solving Phase */}
        {(phase === "solving" || phase === "solved" || phase === "failed") && (
          <div className="flex flex-col gap-4">
            {/* Status Bar */}
            <div className="bg-stone-900/80 border border-stone-700 rounded-lg px-4 py-3 flex items-center justify-between backdrop-blur-sm">
              <div className="flex gap-4 text-sm">
                <span className="text-stone-400">
                  Guess: <span className="text-amber-400 font-bold">{guessHistory.filter(g => g.feedback !== null).length} / {MAX_GUESSES}</span>
                </span>
                {phase === "solving" && (
                  <span className="text-stone-400">
                    Possibilities: <span className="text-amber-400 font-bold">{remainingCount}</span>
                  </span>
                )}
              </div>
              <button onClick={reset} className="text-stone-500 hover:text-stone-300 text-xs transition-colors">
                ← Start Over
              </button>
            </div>

            {/* Active symbols reminder */}
            <div className="bg-stone-900/60 border border-stone-800 rounded px-3 py-2 flex items-center gap-2 flex-wrap">
              <span className="text-stone-500 text-xs">Active symbols:</span>
              {selectedSymbols.map((id) => (
                <SymbolDisplay key={id} symbolId={id} size="sm" className="w-8 h-8" />
              ))}
            </div>

            {/* Guess History */}
            <div className="flex flex-col gap-2">
              {guessHistory.map((record, i) => (
                <GuessRow key={i} record={record} index={i} />
              ))}
            </div>

            {/* Feedback Input */}
            {phase === "solving" && currentGuess && (
              <div className="bg-stone-900/80 border border-amber-800/50 rounded-lg p-5 backdrop-blur-sm">
                <div className="mb-4">
                  <h3 className="text-amber-300 font-semibold">Enter this guess in the game:</h3>
                  <div className="flex gap-3 mt-3">
                    {currentGuess.map((sym, i) => (
                      <SymbolDisplay key={i} symbolId={sym} size="md" className="border-amber-600/70" />
                    ))}
                  </div>
                  <p className="text-stone-500 text-xs mt-2">
                    {currentGuess.map((s) => SYMBOL_NAMES[s]).join(" · ")}
                  </p>
                </div>
                <FeedbackInput onSubmit={handleFeedback} />
              </div>
            )}

            {/* Solved */}
            {phase === "solved" && (
              <div className="bg-amber-950/60 border border-amber-600 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🔓</div>
                <h3 className="text-amber-300 text-xl font-bold">Vault Opened!</h3>
                <p className="text-stone-400 text-sm mt-1">
                  Solved in {guessHistory.length} guess{guessHistory.length !== 1 ? "es" : ""}.
                </p>
                <p className="text-amber-400/70 text-xs mt-1">
                  The combination was:{" "}
                  <span className="font-semibold">
                    {currentGuess?.map((s) => SYMBOL_NAMES[s]).join(" · ")}
                  </span>
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-semibold rounded border border-amber-500 transition-colors"
                >
                  Solve Another Vault
                </button>
              </div>
            )}

            {/* Failed */}
            {phase === "failed" && (
              <div className="bg-red-950/40 border border-red-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">💀</div>
                <h3 className="text-red-400 text-xl font-bold">Vault Sealed</h3>
                <p className="text-stone-400 text-sm mt-1">
                  Could not find the combination. The selected symbols may be incorrect,
                  or the feedback entered may have an error.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded border border-stone-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-stone-700 text-xs">
          Project Gorgon · Ilmari War Cache · {CODE_LENGTH}-symbol combination from {ACTIVE_SYMBOL_COUNT} active symbols
        </p>
      </div>
    </div>
  );
}
