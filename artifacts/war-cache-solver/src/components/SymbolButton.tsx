import { cn } from "@/lib/utils";
import { SYMBOL_NAMES } from "@/lib/symbols";

interface SymbolButtonProps {
  symbolId: number;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | "responsive";
  disabled?: boolean;
  className?: string;
  dimmed?: boolean;
}

// Order: Laguz, Berkano, Perthro, Ansuz, Ingwaz, Ehwaz (top row)
//        Thurisaz, Othala, Sowilo, Naudiz, Dagaz, Gebo (bottom row)
const SYMBOL_SVGS: Record<number, React.ReactNode> = {
  // 0 — ᛚ Laguz: vertical line with diagonal branch going down-right from mid-upper area
  0: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 18 8 L 18 32 M 18 18 L 27 30"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 1 — ᛒ Berkano: vertical line with two right-pointing humps (upper smaller, lower larger)
  1: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 14 8 L 14 32 M 14 8 L 23 14 L 14 20 M 14 20 L 25 26 L 14 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 2 — ᛈ Perthro: vertical line with two arms branching outward from the centre (cup open to the right)
  2: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 14 8 L 14 32 M 14 20 L 26 8 M 14 20 L 26 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 3 — ᚨ Ansuz: vertical line with two diagonal branches going up-right
  3: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 18 8 L 18 32 M 18 13 L 27 8 M 18 22 L 27 17"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 4 — ᛜ Ingwaz: diamond with tails extending from top and bottom vertices
  4: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 12 L 28 20 L 20 28 L 12 20 L 20 12 M 20 12 L 20 7 M 20 28 L 20 33"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 5 — ᛖ Ehwaz: two vertical lines with two parallel diagonals (top-left→centre-right, centre-left→bottom-right)
  5: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 13 8 L 13 32 M 27 8 L 27 32 M 13 8 L 27 20 M 13 20 L 27 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 6 — ᚦ Thurisaz: vertical line with a triangular thorn pointing right
  6: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 17 8 L 17 32 M 17 12 L 27 20 L 17 28"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 7 — ᛟ Othala: diamond with two legs splaying outward from the left and right vertices
  7: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 8 L 29 20 L 20 30 L 11 20 L 20 8 M 11 20 L 8 33 M 29 20 L 32 33"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 8 — ᛋ Sowilo: angular S / Z — top horizontal, crossing diagonal, bottom horizontal
  8: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 12 8 L 28 8 M 28 8 L 12 32 M 12 32 L 28 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 9 — ᚾ Naudiz: single vertical line with a diagonal crossing stroke
  9: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 20 8 L 20 32 M 12 14 L 28 26"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 10 — ᛞ Dagaz: two vertical bars with crossing diagonals between them (squared infinity / ◁▷)
  10: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 12 8 L 12 32 M 28 8 L 28 32 M 12 8 L 28 32 M 28 8 L 12 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),

  // 11 — ᚷ Gebo: X shape
  11: (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 12 8 L 28 32 M 28 8 L 12 32"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),
};

const sizeClasses = {
  sm:         "w-10 h-10",
  md:         "w-14 h-14",
  lg:         "w-16 h-16",
  responsive: "w-10 h-10 md:w-14 md:h-14 xl:w-16 xl:h-16",
};

export function SymbolButton({
  symbolId,
  selected = false,
  onClick,
  size = "md",
  disabled = false,
  className,
  dimmed = false,
}: SymbolButtonProps) {
  const label = SYMBOL_NAMES[symbolId] ?? `Symbol ${symbolId}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center rounded-sm transition-all duration-150",
        sizeClasses[size],
        "border-2",
        selected
          ? "border-amber-500 bg-amber-950/60 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
          : "border-stone-600 bg-stone-800/80 text-stone-400",
        !disabled && !selected && "hover:border-amber-700 hover:text-amber-500 hover:bg-stone-700/80 cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        dimmed && !selected && "opacity-30",
        className
      )}
    >
      <div className="w-3/5 h-3/5 flex items-center justify-center">
        {SYMBOL_SVGS[symbolId]}
      </div>
      {selected && (
        <div className="absolute inset-0 rounded-sm bg-amber-400/5 pointer-events-none" />
      )}
    </button>
  );
}

export function SymbolDisplay({
  symbolId,
  size = "sm",
  className,
}: {
  symbolId: number;
  size?: "sm" | "md" | "lg" | "responsive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm border-2 border-stone-600 bg-stone-800/80 text-amber-500",
        sizeClasses[size],
        className
      )}
    >
      <div className="w-3/5 h-3/5 flex items-center justify-center">
        {SYMBOL_SVGS[symbolId]}
      </div>
    </div>
  );
}
